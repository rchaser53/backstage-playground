import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import kubernetesPlugin from '@backstage/plugin-kubernetes/alpha';
import snykPlugin from 'backstage-plugin-snyk/alpha';
import { navModule } from './modules/nav';

export default createApp({
  features: [catalogPlugin, kubernetesPlugin, snykPlugin, navModule],
});
