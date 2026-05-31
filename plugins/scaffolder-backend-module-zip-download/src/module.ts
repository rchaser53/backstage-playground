import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import { createZipDownloadAction } from './actions/zipDownload';

export const scaffolderModuleZipDownload = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'zip-download',

  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
      },

      async init({ scaffolder, config }) {
        const backendBaseUrl = config.getString('backend.baseUrl');

        scaffolder.addActions(
          createZipDownloadAction({
            outputDir: '/tmp/backstage-scaffolder-downloads',
            publicBaseUrl: `${backendBaseUrl}/static/scaffolder-downloads`,
          }),
        );
      },
    });
  },
});