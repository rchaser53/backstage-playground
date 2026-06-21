import { coreServices, createBackendModule } from '@backstage/backend-plugin-api';
import {
  AuthorizeResult,
  isResourcePermission,
  type PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  catalogConditions,
  createCatalogConditionalDecision,
} from '@backstage/plugin-catalog-backend/alpha';
import {
  type PermissionPolicy,
  type PolicyQuery,
  type PolicyQueryUser,
} from '@backstage/plugin-permission-node';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';

type AuthzPlaygroundMode = 'playground' | 'allow-all' | 'deny-all';

const DEFAULT_MODE: AuthzPlaygroundMode = 'playground';

const authzAdminRefs = ['group:default/authz-admins'];
const developerRefs = ['group:default/developers'];
const guestRefs = ['user:default/guest', 'group:default/guests'];

const publicReadPermissionPatterns = [
  /^catalog\.entity\.read$/,
  /^catalog\.location\.read$/,
  /^catalog\..*\.read$/,
  /^search\./,
  /^techdocs\./,
];

const guestDeniedPermissionPatterns = [
  /^catalog\..*\.(create|update|delete)$/,
  /^scaffolder\./,
  /^kubernetes\./,
  /^permission\./,
  /^mcp-actions\./,
];

const developerAllowedPermissionPatterns = [
  /^scaffolder\./,
  /^catalog\.entity\.create$/,
  /^catalog\.location\.create$/,
  /^catalog\.location\.read$/,
  /^catalog\.entity\.read$/,
  /^search\./,
  /^techdocs\./,
];

const normalizeMode = (value?: string): AuthzPlaygroundMode => {
  if (value === 'playground' || value === 'allow-all' || value === 'deny-all') {
    return value;
  }

  return DEFAULT_MODE;
};

const hasAnyOwnershipRef = (user: PolicyQueryUser | undefined, refs: string[]) => {
  const claims = user?.info.ownershipEntityRefs ?? [];
  return refs.some(ref => user?.info.userEntityRef === ref || claims.includes(ref));
};

const matchesAny = (permissionName: string, patterns: RegExp[]) =>
  patterns.some(pattern => pattern.test(permissionName));

const isPublicReadPermission = (permissionName: string) =>
  matchesAny(permissionName, publicReadPermissionPatterns);

const isGuestDeniedPermission = (permissionName: string) =>
  matchesAny(permissionName, guestDeniedPermissionPatterns);

const isDeveloperAllowedPermission = (permissionName: string) =>
  matchesAny(permissionName, developerAllowedPermissionPatterns);

class AuthzPlaygroundPermissionPolicy implements PermissionPolicy {
  constructor(
    private readonly mode: AuthzPlaygroundMode,
    private readonly logger: { info(message: string): void },
  ) {}

  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    const permissionName = request.permission.name;
    const userEntityRef = user?.info.userEntityRef ?? 'anonymous';
    const ownershipRefs = user?.info.ownershipEntityRefs ?? [];

    if (this.mode === 'allow-all') {
      this.logDecision(AuthorizeResult.ALLOW, permissionName, userEntityRef);
      return { result: AuthorizeResult.ALLOW };
    }

    if (this.mode === 'deny-all') {
      this.logDecision(AuthorizeResult.DENY, permissionName, userEntityRef);
      return { result: AuthorizeResult.DENY };
    }

    if (hasAnyOwnershipRef(user, authzAdminRefs)) {
      this.logDecision(AuthorizeResult.ALLOW, permissionName, userEntityRef);
      return { result: AuthorizeResult.ALLOW };
    }

    if (hasAnyOwnershipRef(user, guestRefs)) {
      const result = isGuestDeniedPermission(permissionName)
        ? AuthorizeResult.DENY
        : AuthorizeResult.ALLOW;
      this.logDecision(result, permissionName, userEntityRef);
      return { result };
    }

    if (
      isResourcePermission(request.permission, 'catalog-entity') &&
      !isPublicReadPermission(permissionName)
    ) {
      this.logger.info(
        `authz-playground: CONDITIONAL permission=${permissionName} user=${userEntityRef} mode=${this.mode} claims=${ownershipRefs.join(',')}`,
      );
      return createCatalogConditionalDecision(
        request.permission,
        catalogConditions.isEntityOwner({
          claims: ownershipRefs,
        }),
      );
    }

    if (hasAnyOwnershipRef(user, developerRefs)) {
      const result = isDeveloperAllowedPermission(permissionName)
        ? AuthorizeResult.ALLOW
        : AuthorizeResult.DENY;
      this.logDecision(result, permissionName, userEntityRef);
      return { result };
    }

    const result = isPublicReadPermission(permissionName)
      ? AuthorizeResult.ALLOW
      : AuthorizeResult.DENY;
    this.logDecision(result, permissionName, userEntityRef);
    return { result };
  }

  private logDecision(
    result: AuthorizeResult.ALLOW | AuthorizeResult.DENY,
    permissionName: string,
    userEntityRef: string,
  ) {
    this.logger.info(
      `authz-playground: ${result} permission=${permissionName} user=${userEntityRef} mode=${this.mode}`,
    );
  }
}

export default createBackendModule({
  pluginId: 'permission',
  moduleId: 'authz-playground-policy',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        policy: policyExtensionPoint,
      },
      async init({ logger, policy }) {
        const mode = normalizeMode(process.env.AUTHZ_PLAYGROUND_MODE);
        logger.info(`authz-playground: installing permission policy mode=${mode}`);
        policy.setPolicy(new AuthzPlaygroundPermissionPolicy(mode, logger));
      },
    });
  },
});
