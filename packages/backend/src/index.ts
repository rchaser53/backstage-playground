/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import { createBackend } from '@backstage/backend-defaults';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { TechRadarLoaderResponseParser } from '@backstage-community/plugin-tech-radar-common';
import fs from 'fs/promises';
import path from 'path';
import express from 'express';

const downloadDir = path.join('/tmp', 'backstage-scaffolder-downloads');

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));

// scaffolder plugin
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(
  import('@backstage/plugin-scaffolder-backend-module-notifications'),
);

// tech radar plugin
backend.add(
  createBackendPlugin({
    pluginId: 'tech-radar',
    register(env) {
      env.registerInit({
        deps: {
          httpRouter: coreServices.httpRouter,
          logger: coreServices.logger,
          config: coreServices.rootConfig,
          reader: coreServices.urlReader,
        },
        async init({ httpRouter, logger, config, reader }) {
          const router = express.Router();

          const getRadarUrl = (id?: string) => {
            if (id) {
              return config.getOptionalString(`techRadar.radars.${id}`);
            }
            return config.getString('techRadar.url');
          };

          const readRadarJson = async (url: string) => {
            if (url.startsWith('file:') && !url.startsWith('file://')) {
              const filePath = url.slice('file:'.length);
              const candidatePaths = path.isAbsolute(filePath)
                ? [filePath]
                : [
                    path.resolve(process.cwd(), filePath),
                    path.resolve(process.cwd(), '../..', filePath),
                  ];

              for (const candidatePath of candidatePaths) {
                try {
                  return JSON.parse(await fs.readFile(candidatePath, 'utf8'));
                } catch (error) {
                  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                    throw error;
                  }
                }
              }

              throw new Error(
                `File not found in any candidate path: ${candidatePaths.join(', ')}`,
              );
            }

            const result = await reader.readUrl(url);
            return JSON.parse((await result.buffer()).toString('utf8'));
          };

          router.get('/health', (_, response) => {
            response.json({ status: 'ok' });
          });

          router.get('/data', async (request, response) => {
            const id =
              typeof request.query.id === 'string'
                ? request.query.id
                : undefined;
            const url = getRadarUrl(id);

            if (!url) {
              response.status(404).json({
                message: `No tech radar configured for id '${id}'`,
              });
              return;
            }

            try {
              const responseJson = await readRadarJson(url);
              const validationResult =
                TechRadarLoaderResponseParser.safeParse(responseJson);

              if (!validationResult.success) {
                logger.error(
                  `Tech radar data validation failed for '${url}': ${validationResult.error.message}`,
                );
                response.status(502).json({
                  message: `Invalid tech radar data for id '${id ?? 'default'}'`,
                });
                return;
              }

              response.json(validationResult.data);
            } catch (error) {
              logger.error(
                `Failed to load tech radar data from '${url}': ${String(error)}`,
              );
              response.status(502).json({
                message: `Unable to retrieve tech radar data for id '${id ?? 'default'}'`,
              });
            }
          });

          httpRouter.use(router as any);
          httpRouter.addAuthPolicy({
            path: '/health',
            allow: 'unauthenticated',
          });
        },
      });
    },
  }),
);

// techdocs plugin
backend.add(import('@backstage/plugin-techdocs-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
// See https://backstage.io/docs/auth/guest/provider

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
// See https://backstage.io/docs/permissions/getting-started for how to create your own permission policy
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);

// search plugin
backend.add(import('@backstage/plugin-search-backend'));

// search engine
// See https://backstage.io/docs/features/search/search-engines
backend.add(import('@backstage/plugin-search-backend-module-pg'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// kubernetes plugin
backend.add(import('@backstage/plugin-kubernetes-backend'));

// notifications and signals plugins
backend.add(import('@backstage/plugin-notifications-backend'));
backend.add(import('@backstage/plugin-signals-backend'));

// mcp actions plugin
backend.add(import('@backstage/plugin-mcp-actions-backend'));

backend.add(
  import('@internal/backstage-plugin-scaffolder-backend-module-zip-download'),
);
backend.add(
  createBackendPlugin({
    pluginId: 'static-downloads',
    register(env) {
      env.registerInit({
        deps: {
          rootHttpRouter: coreServices.rootHttpRouter,
        },
        async init({ rootHttpRouter }) {
          rootHttpRouter.use(
            '/static/scaffolder-downloads',
            express.static(downloadDir) as any,
          );
        },
      });
    },
  }),
);

backend.start();
