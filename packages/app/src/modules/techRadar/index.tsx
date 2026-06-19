import { RadarPage } from '@backstage-community/plugin-tech-radar';
import { compatWrapper } from '@backstage/core-compat-api';
import { ApiBlueprint, PageBlueprint } from '@backstage/frontend-plugin-api';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import MapIcon from '@material-ui/icons/MyLocation';
import { multiTechRadarApiFactory } from './TechRadarClient';

const techRadarApi = ApiBlueprint.make({
  params: defineParams => defineParams(multiTechRadarApiFactory),
});

const platformRadarPage = PageBlueprint.make({
  name: 'platform',
  params: {
    path: '/tech-radar/platform',
    title: 'Platform Radar',
    icon: <MapIcon />,
    loader: async () =>
      compatWrapper(
        <RadarPage
          id="platform"
          title="Platform Radar"
          pageTitle="Platform Radar"
          subtitle="Languages, frameworks, infrastructure, and internal tools"
        />,
      ),
  },
});

const dataAiRadarPage = PageBlueprint.make({
  name: 'data-ai',
  params: {
    path: '/tech-radar/data-ai',
    title: 'Data & AI Radar',
    icon: <MapIcon />,
    loader: async () =>
      compatWrapper(
        <RadarPage
          id="data-ai"
          title="Data & AI Radar"
          pageTitle="Data & AI Radar"
          subtitle="Data platform, analytics, ML/AI, and governance choices"
        />,
      ),
  },
});

const securityRadarPage = PageBlueprint.make({
  name: 'security',
  params: {
    path: '/tech-radar/security',
    title: 'Security Radar',
    icon: <MapIcon />,
    loader: async () =>
      compatWrapper(
        <RadarPage
          id="security"
          title="Security Radar"
          pageTitle="Security Radar"
          subtitle="Application security, identity, platform controls, and operations"
        />,
      ),
  },
});

export const techRadarModule = createFrontendModule({
  pluginId: 'tech-radar',
  extensions: [
    techRadarApi,
    platformRadarPage,
    dataAiRadarPage,
    securityRadarPage,
  ],
});
