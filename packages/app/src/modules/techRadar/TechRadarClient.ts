import {
  TechRadarApi,
  techRadarApiRef,
} from '@backstage-community/plugin-tech-radar';
import { TechRadarLoaderResponse } from '@backstage-community/plugin-tech-radar-common';
import {
  createApiFactory,
  DiscoveryApi,
  discoveryApiRef,
  FetchApi,
  fetchApiRef,
  IdentityApi,
  identityApiRef,
} from '@backstage/frontend-plugin-api';

export class MultiTechRadarClient implements TechRadarApi {
  constructor(
    private readonly options: {
      discoveryApi: DiscoveryApi;
      fetchApi: FetchApi;
      identityApi: IdentityApi;
    },
  ) {}

  async load(id: string | undefined): Promise<TechRadarLoaderResponse> {
    const { token: idToken } = await this.options.identityApi.getCredentials();
    const apiUrl = await this.options.discoveryApi.getBaseUrl('tech-radar');
    const query = id ? `?id=${encodeURIComponent(id)}` : '';
    const response = await this.options.fetchApi.fetch(`${apiUrl}/data${query}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to load tech radar '${id ?? 'default'}': ${response.status}`,
      );
    }

    return response.json();
  }
}

export const multiTechRadarApiFactory = createApiFactory({
  api: techRadarApiRef,
  deps: {
    discoveryApi: discoveryApiRef,
    fetchApi: fetchApiRef,
    identityApi: identityApiRef,
  },
  factory: ({ discoveryApi, fetchApi, identityApi }) =>
    new MultiTechRadarClient({ discoveryApi, fetchApi, identityApi }),
});
