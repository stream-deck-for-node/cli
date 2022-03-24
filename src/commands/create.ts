import { CliCommand } from '../interfaces.js';
import { OptionDefinition } from 'command-line-args';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import logSymbols from 'log-symbols';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Mustache from 'mustache';
import { exec } from 'node:child_process';
import util from 'node:util';
import ora from 'ora';
import LinkCommand from './link.js';
import chalk from 'chalk';
import { checkApplicationInPath } from '../util.js';

const execAsync = util.promisify(exec);

const __dirname = dirname(fileURLToPath(import.meta.url));

// Command to create the elgato stream deck package using the distribution tool
export default class CreateCommand implements CliCommand {

    definitions: OptionDefinition[];

    constructor() {
        this.definitions = [];
    }

    async execute(): Promise<void> {

        await checkApplicationInPath();

        console.log('\n', '[stream-deck]', chalk.cyan('@stream-deck-for-node/cli'), '\n');

        const choices = await inquirer.prompt([
            {
                type: 'list',
                name: 'template',
                message: 'Template',
                default: 0,
                choices: [{ name: 'TypeScript (recommended)', value: 'TypeScript' }, 'JavaScript']
            },
            {
                type: 'input',
                name: 'uuid',
                default: 'com.plugin.sample',
                message: 'Plugin UUID'
            },
            {
                type: 'input',
                name: 'name',
                default: 'com.plugin.sample',
                message: 'Name'
            },
            {
                type: 'input',
                name: 'description',
                message: 'Description'
            },
            {
                type: 'input',
                name: 'author',
                message: 'Author'
            },
            {
                type: 'input',
                name: 'category',
                default: 'Custom',
                message: 'Category'
            }
        ]);

        const spinner = ora('Creating the project...').start();

        const base = choices.uuid + '/';

        if (await fs.pathExists(base)) {
            return console.log(logSymbols.error, 'Directory not empty');
        }

        await fs.mkdir(base + 'plugin/icons', { recursive: true });
        await fs.ensureDir(base + 'plugin/pi');
        await fs.ensureDir(base + 'src/actions');

        await fs.copy(join(__dirname, '../../boilerplate/plugin/pi'), join(base, 'plugin/pi'), {
            recursive: true
        });

        const templatePi = await fs.readFile(join(__dirname, '../../boilerplate/plugin/pi/index.html'));
        await fs.writeFile(base + '/plugin/pi/index.html', Mustache.render(templatePi.toString(), choices));

        const templateManifest = await fs.readFile(join(__dirname, '../../boilerplate/plugin/manifest.json'));
        await fs.writeFile(base + '/plugin/manifest.json', Mustache.render(templateManifest.toString(), choices));

        await fs.copy(join(__dirname, '../../boilerplate/plugin/icons'), join(base, 'plugin/icons'), {
            recursive: true
        });

        if (choices.template === 'TypeScript') {

            const templatePackageJson = await fs.readFile(join(__dirname, `../../boilerplate/ts/package.json`));
            await fs.writeFile(base + '/package.json', Mustache.render(templatePackageJson.toString(), choices));

            await fs.copy(join(__dirname, '../../boilerplate/ts/src'), join(base, 'src'), {
                recursive: true
            });

            await fs.copy(join(__dirname, '../../boilerplate/ts/tsconfig.json'), join(base, 'tsconfig.json'));

        } else {
            const templatePackageJson = await fs.readFile(join(__dirname, '../../boilerplate/js/package.json'));

            await fs.copy(join(__dirname, '../../boilerplate/js/src'), join(base, 'src'), {
                recursive: true
            });

            await fs.writeFile(base + '/package.json', Mustache.render(templatePackageJson.toString(), choices));
        }

        spinner.succeed('Boilerplate generated');

        spinner.start('Installing node modules...');
        await execAsync('npm i', { cwd: base });

        spinner.succeed('Node modules installed');
        spinner.start('Building the project...');
        await execAsync('npm run build', { cwd: base });
        spinner.stop();

        await new LinkCommand().execute({
            cwd: join(base, 'plugin')
        });

        console.log('\n', logSymbols.success, 'Project created', '\n');
        console.log(`  start developing your new plugin using`, '\n');
        console.log(`  cd ${choices.uuid}`, '\n');
        console.log(`  $ ${chalk.black.bgWhite.underline(' stream-deck dev ')} and ${chalk.black.bgWhite.underline(' npm start ')} in two different terminals`, '\n');

    }

}
