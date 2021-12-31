import { join } from 'node:path';
import { PluginManifest } from './interfaces.js';
import fs from 'fs-extra';
import fkill from 'fkill';
import { spawn } from 'node:child_process';
import logSymbols from 'log-symbols';
import { Application, debugPlugin } from './constant.js';
import commandExists from 'command-exists';
import chalk from 'chalk';

if (!['darwin', 'win32'].includes(process.platform)) {
    console.log('This platform is not supported!');
    process.exit();
}

export const parseManifest = async (cwd: string): Promise<PluginManifest | undefined> => {
    try {
        return await fs.readJSON(join(cwd, 'manifest.json'));
    } catch (e) {
        return;
    }
};

export const updateManifest = async (cwd: string, manifest: PluginManifest): Promise<void> => {
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

export const killStreamDeckApp = async () => {
    try {
        await fkill(Application, { forceAfterTimeout: 1000, tree: false });
        await killDebugPlugins();
    } catch (e) {
        // ignore killing issues
    }
};

export const launchStreamDeckApp = async () => {
    const child = spawn(Application, { detached: true, stdio: 'inherit' });
    child.unref();
};

export const reloadStreamDeckApplication = async () => {
    await killStreamDeckApp();
    await launchStreamDeckApp();
    console.log(logSymbols.success, 'Application reloaded');
};

export const checkApplicationInPath = async () => {
    try {
        await commandExists(Application);
    } catch (e) {
        console.log('\n', logSymbols.error, chalk.white.underline('StreamDeck Application not found in PATH'), '\n');
        console.log(' >> add the binary directory to the PATH and restart the terminal\n');
        process.exit(0);
    }
};
