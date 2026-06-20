import { coreServices, createBackendModule } from '@backstage/backend-plugin-api';
import {
  AuthorizeResult,
  type PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  type PermissionPolicy,
  type PolicyQuery,
  type PolicyQueryUser,
  policyExtensionPoint,
} from '@backstage/plugin-permission-node/alpha';

type AuthzPlaygroundMode =
  | 'allow-all'
  | 'deny-all'
  | 'catalog-readonly'
  | 'guests-readonly';

const DEFAULT_MODE: AuthzPlaygroundMode = 'guests-readonly';

const readPermissionPatterns = [
  /^catalog\.entity\.read$/,
  /^catalog\.location\.read$/,
  /^catalog\..*\.read$/,
  /^search\./,
  /^techdocs\./,
];

const writePermissionPatterns = [
  /^catalog\..*\.(create|update|delete)$/,
  /^scaffolder\./,
  /^kubernetes\./,
  /^permission\./,
  /^mcp-actions\./,
];

const normalizeMode = (value?: string): AuthzPlaygroundMode => {
  if (
    value === 'allow-all' ||
    value === 'deny-all' ||
    value === 'catalog-readonly' ||
    value === 'guests-readonly'
  ) {
    return value;
  }

  return DEFAULT_MODE;
};

const isReadPermission = (permissionName: string) =>
  readPermissionPatterns.some(pattern => pattern.test(permissionName));

const isWritePermission = (permissionName: string) =>
  writePermissionPatterns.some(pattern => pattern.test(permissionName));

const isGuestUser = (user?: PolicyQueryUser) => {
  if (!user) {
    return true;
  }

  return (
    user.info.userEntityRef === 'user:default/guest' ||
    user.info.ownershipEntityRefs.includes('user:default/guest') ||
    user.info.ownershipEntityRefs.includes('group:default/guests')
  );
};

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

    const result = this.evaluate(permissionName, user);

    this.logger.info(
      `authz-playground: ${result} permission=${permissionName} user=${userEntityRef} mode=${this.mode}`,
    );

    return { result };
  }

  private evaluate(
    permissionName: string,
    user?: PolicyQueryUser,
  ): AuthorizeResult.ALLOW | AuthorizeResult.DENY {
    if (this.mode === 'allow-all') {
      return AuthorizeResult.ALLOW;
    }

    if (this.mode === 'deny-all') {
      return AuthorizeResult.DENY;
    }

    if (this.mode === 'catalog-readonly') {
      return isReadPermission(permissionName)
        ? AuthorizeResult.ALLOW
        : AuthorizeResult.DENY;
    }

    if (this.mode === 'guests-readonly') {
      if (isGuestUser(user) && isWritePermission(permissionName)) {
        return AuthorizeResult.DENY;
      }

      return AuthorizeResult.ALLOW;
    }

    return AuthorizeResult.DENY;
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
