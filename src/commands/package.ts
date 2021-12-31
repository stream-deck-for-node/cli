import { CliCommand } from '../interfaces.js';
import { OptionDefinition } from 'command-line-args';
import { getUUID, parseManifest } from '../util.js';
import { DistributionTool, PluginPath } from '../constant.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'child_process';
import logSymbols from 'log-symbols';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Command to create the elgato stream deck package using the distribution tool
export default class PackageCommand implements CliCommand {

    definitions: OptionDefinition[];

    constructor() {
        this.definitions = [];
    }

    async execute(): Promise<void> {

        const cwd = process.cwd();
        const manifest = await parseManifest(cwd);
        const dt = join(__dirname, '../../elgato-bin/', DistributionTool);

        if (manifest) {
            try {

                const uuid = getUUID(manifest);
                const pluginDirectory = join(PluginPath, uuid + '.sdPlugin');
                const { stdout, stderr } = await exec(`${dt} -b -i ${pluginDirectory} -o ${cwd}`);

                stderr?.on('data', (data) => {
                    if (data.includes('successfully exported')) {
                        console.log(logSymbols.success, 'Plugin package exported');
                    }
                });

                stdout?.on('data', (data) => {
                    if (data.includes('Error:')) {
                        console.log(logSymbols.error, 'Cannot export the plugin\'s package');
                    }
                });

            } catch (e) {
                console.log(logSymbols.error, 'Cannot export the plugin\'s package');
            }

        }

    }

}
