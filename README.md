# @stream-deck-for-node/cli

CLI utility to create / link / unlink / develop / package
a [stream deck plugin in Node.js](https://stream-deck-for-node.netlify.app/#/cli)

[![Build status](https://ci.appveyor.com/api/projects/status/im247e4qbk754pdj/branch/main?svg=true)](https://ci.appveyor.com/project/fcannizzaro/cli/branch/main)

## Installation

```shell
npm i -g @stream-deck-for-node/cli
```

## Supported OS

- [x] windows
- [x] mac

```shell
Stream Deck Node.js CLI

  Everything needed to create a Stream Deck's plugins in Node.js

Synopsis

  $ stream-deck <command> <options>

Command List

  create    Generate a new plugin project with a sample action.
  link      Create a symlink between your development code and the Elgato plugins directory.
  unlink    Remove (if exists) the symlink created with the link command.
  dev       Modify the manifest.json using a debug-plugin for a faster development.
  package   Generate a .streamDeckPlugin using the Elgato DistributionTool.
```

## Author

Francesco Saverio Cannizzaro ([fcannizzaro](https://github.com/fcannizzaro))

## License

MIT
