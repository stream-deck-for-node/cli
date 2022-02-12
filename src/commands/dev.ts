import { CliCommand, GithubRelease, PluginManifest } from '../interfaces.js';
import { CommandLineOptions, OptionDefinition } from 'command-line-args';
import {
    checkApplicationInPath,
    killStreamDeckApp,
    launchStreamDeckApp,
    parseManifest,
    reloadStreamDeckApplication,
    updateManifest
} from '../util.js';
import { debugPlugin, debugPluginBinary, DEV_PLUGIN_RELEASE } from '../constant.js';
import got from 'got';
import { createWriteStream } from 'fs';
import { promisify } from 'node:util';
import stream from 'node:stream';
import fs from 'fs-extra';
import logSymbols from 'log-symbols';
import pick from 'lodash.pick';
import { join } from 'node:path';

const pipeline = promisify(stream.pipeline);

// Command to link/unlink (symlink) development plugin to Stream Deck Application's plugin directory
export default class DevCommand implements CliCommand {

    definitions: OptionDefinition[];

    constructor() {
        this.definitions = [{
            name: 'persistent', alias: 'p', type: Boolean
        }];
    }

    async downloadDebugPlugin() {

        if (await fs.pathExists(debugPluginBinary)) {
            return;
        }

        const latest: GithubRelease = await got.get(DEV_PLUGIN_RELEASE, {
            resolveBodyOnly: true
        }).json();

        await pipeline(
          got.stream(latest.assets.find(it => it.name === debugPlugin)?.browser_download_url),
          createWriteStream(debugPluginBinary)
        );

        console.log(logSymbols.success, 'Downloaded prebuilt debug plugin at', debugPluginBinary);

    }

    async revertManifest(cwd: string, manifest?: PluginManifest, initialCP: Record<string, string> = {}) {
        if (!manifest) return;
        manifest.CodePath = undefined;
        Object.assign(manifest, initialCP);
        await updateManifest(cwd, manifest);
        console.log(logSymbols.success, 'Reverted manifest.json');
    }

    async execute(args: CommandLineOptions): Promise<void> {

        await checkApplicationInPath();

        let cwd = process.cwd();
        let manifest = await parseManifest(cwd);

        if (!manifest) {
            // allows command's execution in the main project directory
            cwd = join(cwd, 'plugin');
            manifest = await parseManifest(cwd);
        }

        if (manifest) {

            await this.downloadDebugPlugin();
            const initialCP = pick(manifest, 'CodePath', 'CodePathWin', 'CodePathMac');

            if (manifest.CodePath !== debugPlugin) {
                manifest.CodePath = debugPlugin;
                manifest.CodePathWin = undefined;
                manifest.CodePathMac = undefined;
            }

            await fs.copy(debugPluginBinary, join(cwd, debugPlugin));

            await updateManifest(cwd, manifest);

            await reloadStreamDeckApplication();

            console.log(logSymbols.success, 'Updated manifest.json using debug-plugin');

            if (!args.persistent) {

                console.log('\n >> Press any key to stop development mode <<\n');

                process.stdin.setRawMode(true);

                process.stdin.on('data', async () => {
                    process.stdin.setRawMode(false);
                    manifest = await parseManifest(cwd);
                    await this.revertManifest(cwd, manifest, initialCP);
                    await killStreamDeckApp();
                    await fs.rm(join(cwd, debugPlugin));
                    console.log(logSymbols.success, 'Removed debug-plugin binary');
                    await launchStreamDeckApp();
                    console.log(logSymbols.success, 'Application reloaded');
                    process.exit(0);
                });

            }

        } else {
            console.log(logSymbols.error, 'Error starting the dev command');
        }

    }

}
