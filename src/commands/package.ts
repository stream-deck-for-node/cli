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
import { mkdir, stat } from 'fs/promises';
import got from 'got';
import unzipper from 'unzipper';
import { createWriteStream } from 'fs';
import ora from 'ora';

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
      const spinner = ora('Downloading Elgato Distribution Tool...').start();
      return new Promise((resolve, reject) => {
        got(ElgatoDistributionToolDownload, { isStream: true })
          .pipe(unzipper.Parse())
          .on('error', reject)
          .on('entry', async (entry) => {
            const fileName = entry.path;
            if (fileName === DistributionTool) {
              await mkdir(basePath, { recursive: true }).catch();
              entry.pipe(createWriteStream(dt)).on('finish', () => {
                spinner.stop();
                resolve(dt);
              });
            } else {
              entry.autodrain();
            }
          });
      });
    }

    return dt;
  }

  async execute(): Promise<void> {
    const cwd = process.cwd();
    const manifest = await parseManifest(cwd);
    const dt = await this.downloadDistributionTool();

    if (manifest) {
      const spinner = ora('Packaging plugin...').start();

      try {
        const uuid = getUUID(manifest);
        const pluginDirectory = join(PluginPath, uuid + '.sdPlugin');

        const { stdout } = await exec(
          `${dt} -b -i ${pluginDirectory} -o ${cwd}`
        );

        stdout?.on('data', (data) => {
          if (data.includes('successfully exported')) {
            spinner.stop();
            console.log(logSymbols.success, 'Plugin package exported');
          }
        });

        stdout?.on('data', (data) => {
          if (data.includes('Error:')) {
            spinner.stop();
            console.log(logSymbols.error, `${data.split('Error:')[1]}\n`);
          }
        });
      } catch (e) {
        spinner.stop();
        console.log(logSymbols.error, "Cannot export the plugin's package");
      }
    }
  }
}
