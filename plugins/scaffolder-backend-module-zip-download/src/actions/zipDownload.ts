import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import * as archiver from 'archiver';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuid } from 'uuid';

type ZipArchiveInstance = {
  on(event: 'error', listener: (err: Error) => void): void;
  pipe(destination: NodeJS.WritableStream): void;
  directory(dirpath: string, destpath: string | false): void;
  finalize(): void | Promise<void>;
};

type ZipArchiveConstructor = new (options?: {
  zlib?: { level: number };
}) => ZipArchiveInstance;

type Options = {
  outputDir: string;
  publicBaseUrl: string;
};

export function createZipDownloadAction(options: Options) {
  return createTemplateAction({
    id: 'custom:zip-download',
    description: 'Zip the scaffolder workspace and expose a download URL',

    schema: {
      input: {
        filename: z => z.string().describe('Zip filename'),
      },
      output: {
        downloadUrl: z => z.string().describe('Download URL'),
      },
    },

    async handler(ctx) {
      await fs.ensureDir(options.outputDir);

      const safeFilename = ctx.input.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const zipName = `${uuid()}-${safeFilename}`;
      const zipPath = path.join(options.outputDir, zipName);

      await new Promise<void>((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const { ZipArchive } = archiver as unknown as {
          ZipArchive: ZipArchiveConstructor;
        };
        const archive = new ZipArchive({ zlib: { level: 9 } });

        output.on('close', () => resolve());
        archive.on('error', err => reject(err));

        archive.pipe(output);
        archive.directory(ctx.workspacePath, false);
        archive.finalize();
      });

      const downloadUrl = `${options.publicBaseUrl}/${zipName}`;

      ctx.output('downloadUrl', downloadUrl);
      ctx.logger.info(`Created zip: ${downloadUrl}`);
    },
  });
}
