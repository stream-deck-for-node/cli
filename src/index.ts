#!/usr/bin/env node
import './util.js';
import commandLineArgs from 'command-line-args';
import LinkCommand from './commands/link.js';
import { CliCommand } from './interfaces.js';
import DevCommand from './commands/dev.js';
import PackageCommand from './commands/package.js';
import CreateCommand from './commands/create.js';
import commandLineUsage from 'command-line-usage';
import { help } from './help.js';

const mainDefinitions = [
  { name: 'command', defaultOption: true }
];

const main = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true });
const argv = main._unknown || [];

const commands: Record<string, CliCommand> = {
  create: new CreateCommand(),
  link: new LinkCommand(),
  unlink: new LinkCommand(true),
  dev: new DevCommand(),
  package: new PackageCommand()
};

const handler = commands[main.command];

if (handler) {
  const options = commandLineArgs(handler.definitions, { argv });
  handler.execute(options);
} else {
  console.log(commandLineUsage(help));
}

