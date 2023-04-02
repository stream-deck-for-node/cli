import { join } from 'node:path';
import { PluginManifest } from './interfaces.js';
import fs from 'fs-extra';
import fkill from 'fkill';
import { spawn } from 'node:child_process';
import logSymbols from 'log-symbols';
import {
  Application,
  ApplicationRef,
  debugPlugin,
  platform
} from './constant.js';
import commandExists from 'command-exists';
import chalk from 'chalk';
import { exec } from 'child_process';

if (!['darwin', 'win32'].includes(process.platform)) {
  console.log('This platform is not supported!');
  process.exit();
}

export const parseManifest = async (
  cwd: string,
  nested = false
): Promise<PluginManifest | undefined> => {
  try {
    return await fs.readJSON(
      join(cwd, nested ? 'plugin' : '', 'manifest.json')
    );
  } catch (e) {
    if (!nested) {
      return await parseManifest(cwd, true);
    }
    return;
  }
};

export const updateManifest = async (
  cwd: string,
  manifest: PluginManifest
): Promise<void> => {
  try {
    await fs.writeJson(join(cwd, 'manifest.json'), manifest, {
      spaces: 2
    });
  } catch (e) {
    console.log(e);
  }
};

export const getUUID = (manifest: PluginManifest) => {
  return manifest.Actions[0].UUID.replace(/(.+)\..*?$/, '$1');
};

export const killDebugPlugins = async () => {
  try {
    await fkill(debugPlugin, { force: true });
  } catch (e) {
    // ignore killing issues
  }
};

export const killStreamDeckApp = async (uuid: string) => {
  try {
    await fkill(uuid + (platform === 'win' ? '.exe' : ''), {
      force: true,
      tree: true
    });
  } catch (e) {
    // ignore killing issues
  }
  try {
    await fkill(Application, { forceAfterTimeout: 1000, tree: false });
    await killDebugPlugins();
  } catch (e) {
    // ignore killing issues
  }
};

export const launchStreamDeckApp = async () => {
  if ('darwin' === process.platform) {
    await execRun(`open -a "${Application}"`);
  } else {
    const child = spawn(ApplicationRef, { detached: true, stdio: 'inherit' });
    child.unref();
  }
};

export const reloadStreamDeckApplication = async (uuid: string) => {
  await killStreamDeckApp(uuid);
  await launchStreamDeckApp();
  console.log(logSymbols.success, 'Application reloaded');
};

/**
 * Helper function to shell out application commands.
 * @returns {String} The result of the cmd minus the newline character.
 */
const execRun = (cmd: string) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};

export const checkApplicationInPath = async () => {
  try {
    if ('darwin' === process.platform) {
      await execRun(
        `osascript -e 'tell application "Finder" to get version of application file id "${ApplicationRef}"'`
      );
    } else {
      await commandExists(Application);
    }
  } catch (e) {
    console.log(
      '\n',
      logSymbols.error,
      chalk.white.underline('StreamDeck Application not found in PATH'),
      '\n'
    );
    console.log(
      ' >> add the binary directory to the PATH and restart the terminal\n'
    );
    process.exit(0);
  }
};
