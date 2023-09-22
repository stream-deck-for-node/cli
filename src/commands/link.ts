import { CliCommand } from '../interfaces.js';
import { CommandLineOptions, OptionDefinition } from 'command-line-args';
import { checkApplicationInPath, getUUID, parseManifest, reloadStreamDeckApplication } from '../util.js';
import { join } from 'node:path';
import { lstatSync, symlinkSync, unlinkSync } from 'node:fs';
import { PluginPath } from '../constant.js';
import logSymbols from 'log-symbols';


// Command to link/unlink (symlink) development plugin to Stream Deck Application's plugin directory
export default class LinkCommand implements CliCommand {

    definitions: OptionDefinition[];

    constructor(private unlink: boolean = false) {
        this.definitions = [];
    }

    async execute(args: CommandLineOptions): Promise<void> {

        await checkApplicationInPath();

        let cwd = args.cwd || process.cwd();

        let manifest = await parseManifest(cwd);

        if (manifest) {
            const uuid = getUUID(manifest);
            const pluginDirectory = join(PluginPath, uuid + '.sdPlugin');
            let stats = null;

            try {
                stats = lstatSync(pluginDirectory);
            } catch (e) {
                // ignore missing files
            }

            if (this.unlink) {

                if (!stats) {
                    return console.log(logSymbols.error, 'Plugin already unlinked');
                }

                if (stats.isSymbolicLink()) {
                    unlinkSync(pluginDirectory);
                    console.log(logSymbols.success, 'Plugin unlinked');
                    await reloadStreamDeckApplication(uuid);
                } else {
                    console.log(logSymbols.error, 'Plugin is not a symlink');
                }

            } else {

                if (stats) {
                    return console.log(logSymbols.error, 'Plugin already linked');
                }

                symlinkSync(cwd, pluginDirectory, 'dir');
                console.log(logSymbols.success, 'Plugin linked');
                await reloadStreamDeckApplication(uuid);
            }
        } else {
            console.log(logSymbols.error, 'No manifest file found in current directory.');
        }

    }

}
