import { CliCommand } from '../interfaces.js';
import { OptionDefinition } from 'command-line-args';
import { getUUID, parseManifest } from '../util.js';
import {
  DistributionTool,
  ElgatoDistributionToolDownload,
  PluginPath
} from '../constant.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'child_process';
import logSymbols from 'log-symbols';
import { stat } from 'fs/promises';
import got from 'got';
import unzipper from 'unzipper';
import { createWriteStream } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Command to create the elgato stream deck package using the distribution tool
export default class PackageCommand implements CliCommand {
  definitions: OptionDefinition[];

  constructor() {
    this.definitions = [];
  }

  async downloadDistributionTool(): Promise<string> {
    const basePath = join(__dirname, '../../elgato-bin');
    const dt = join(basePath, DistributionTool);
    const exist = await stat(dt).catch(() => false);

    if (!exist) {
      got(ElgatoDistributionToolDownload, { isStream: true })
        .pipe(unzipper.Parse())
        .on('entry', (entry) => {
          const fileName = entry.path;
          if (fileName === DistributionTool) {
            entry.pipe(createWriteStream(dt));
          } else {
            entry.autodrain();
          }
        });
    }

    return dt;
  }

  async execute(): Promise<void> {
    const cwd = process.cwd();
    const manifest = await parseManifest(cwd);
    const dt = await this.downloadDistributionTool();

    if (manifest) {
      try {
        const uuid = getUUID(manifest);
        const pluginDirectory = join(PluginPath, uuid + '.sdPlugin');

        const { stdout } = await exec(
          `${dt} -b -i ${pluginDirectory} -o ${cwd}`
        );

        stdout?.on('data', (data) => {
          if (data.includes('successfully exported')) {
            console.log(logSymbols.success, 'Plugin package exported');
          }
        });

        stdout?.on('data', (data) => {
          if (data.includes('Error:')) {
            console.log(logSymbols.error, `${data.split('Error:')[1]}\n`);
          }
        });
      } catch (e) {
        console.log(logSymbols.error, "Cannot export the plugin's package");
      }
    }
  }
}
