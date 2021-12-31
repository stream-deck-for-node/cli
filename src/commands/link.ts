import {CliCommand} from "../interfaces.js";
import {CommandLineOptions} from "command-line-args";
import {checkApplicationInPath, getUUID, parseManifest, reloadStreamDeckApplication} from "../util.js";
import {join} from "node:path";
import symlinkDir from 'symlink-dir';
import {lstatSync, rmdirSync} from "node:fs";
import {PluginPath} from "../constant.js";
import logSymbols from 'log-symbols';


// Command to link/unlink (symlink) development plugin to Stream Deck Application's plugin directory
export default class LinkCommand implements CliCommand {

    definitions: any[];

    constructor(private unlink: boolean = false) {
        this.definitions = [];
    }

    async execute(args: CommandLineOptions): Promise<void> {

        await checkApplicationInPath();

        let cwd = args.cwd || process.cwd();

        let manifest = await parseManifest(cwd);

        if (!manifest) {
            // allows command's execution in the main project directory
            cwd = join(cwd, "plugin");
            manifest = await parseManifest(cwd);
        }

        if (manifest!) {
            const uuid = getUUID(manifest);
            const pluginDirectory = join(PluginPath, uuid + ".sdPlugin");
            let stats = null;

            try {
                stats = lstatSync(pluginDirectory);
            } catch (e) {
                // ignore missing files
            }

            if (this.unlink) {

                if (!stats) {
                    return console.log(logSymbols.error, "Plugin already unlinked");
                }

                if (stats.isSymbolicLink()) {
                    rmdirSync(pluginDirectory);
                    console.log(logSymbols.success, "Plugin unlinked");
                    await reloadStreamDeckApplication();
                } else {
                    console.log(logSymbols.error, "Plugin is not a symlink");
                }

            } else {

                if (stats) {
                    return console.log(logSymbols.error, "Plugin already linked");
                }

                await symlinkDir(cwd, pluginDirectory);
                console.log(logSymbols.success, "Plugin linked")
                await reloadStreamDeckApplication();
            }
        }

    }

}
