import { CliCommand, GithubRelease } from '../interfaces.js';
import { OptionDefinition } from 'command-line-args';
import {
  checkApplicationInPath,
  parseManifest,
  reloadStreamDeckApplication,
  updateManifest
} from '../util.js';
import {
  debugPlugin,
  debugPluginBinary,
  DEV_PLUGIN_RELEASE
} from '../constant.js';
import got from 'got';
import { createWriteStream } from 'fs';
import { promisify } from 'node:util';
import stream from 'node:stream';
import fs from 'fs-extra';
import logSymbols from 'log-symbols';
import { join } from 'node:path';

const pipeline = promisify(stream.pipeline);

// Command to link/unlink (symlink) development plugin to Stream Deck Application's plugin directory
export default class DevCommand implements CliCommand {
  definitions: OptionDefinition[];

  constructor() {
    this.definitions = [
      {
        name: 'persistent',
        alias: 'p',
        type: Boolean
      }
    ];
  }

  async downloadDebugPlugin() {
    if (await fs.pathExists(debugPluginBinary)) {
      return;
    }

    const latest: GithubRelease = await got
      .get(DEV_PLUGIN_RELEASE, {
        resolveBodyOnly: true
      })
      .json();

    await pipeline(
      got.stream(
        latest.assets.find((it) => it.name === debugPlugin)
          ?.browser_download_url
      ),
      createWriteStream(debugPluginBinary)
    );

    console.log(
      logSymbols.success,
      'Downloaded prebuilt debug plugin at',
      debugPluginBinary
    );
  }

  async execute(): Promise<void> {
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

      if (manifest.CodePath !== debugPlugin) {
        manifest.CodePath = debugPlugin;
        manifest.CodePathWin = undefined;
        manifest.CodePathMac = undefined;
      }

      const uuid = manifest['UUID'].toString();
      await fs.copy(debugPluginBinary, join(cwd, debugPlugin));
      await updateManifest(cwd, manifest);
      await reloadStreamDeckApplication(uuid);

      console.log(
        logSymbols.success,
        'Updated manifest.json using debug-plugin'
      );
    } else {
      console.log(logSymbols.error, 'Error starting the dev command');
    }
  }
}
