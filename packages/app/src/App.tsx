import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import kubernetesPlugin from '@backstage/plugin-kubernetes/alpha';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';
import {
  techDocsExpandableNavigationAddonModule,
  techDocsLightBoxAddonModule,
  techDocsReportIssueAddonModule,
  techDocsTextSizeAddonModule,
} from '@backstage/plugin-techdocs-module-addons-contrib/alpha';
import snykPlugin from 'backstage-plugin-snyk/alpha';
import { navModule } from './modules/nav';
import { techRadarModule } from './modules/techRadar';

export default createApp({
  features: [
    catalogPlugin,
    kubernetesPlugin,
    techdocsPlugin,
    techDocsExpandableNavigationAddonModule,
    techDocsLightBoxAddonModule,
    techDocsReportIssueAddonModule,
    techDocsTextSizeAddonModule,
    snykPlugin,
    navModule,
    techRadarModule,
  ],
});
