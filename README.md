# @stream-deck-for-node/cli

CLI utility to create / link / unlink / develop / package
a [stream deck plugin in Node.js](https://stream-deck-for-node.dev/cli)

## Installation

```shell
npm i -g @stream-deck-for-node/cli
```

## Supported OS

- [x] windows
- [ ] mac `(need help)`

```shell
Stream Deck Node.js CLI

  Everything needed to create a Stream Deck's plugins in Node.js

Synopsis

  $ stream-deck <command> <options>

Command List

  create    Generate a new plugin project with a sample action.
  link      Create a symlink between your development code and the Elgato plugins directory.
  unlink    Remove (if exists) the symlink created with the link command.
  dev       Temporary modify the manifest.json using a debug-plugin for a faster development.
  package   Generate a .streamDeckPlugin using the Elgato's DistributionTool.

dev options

  -p, --persistent    dev command persistently modifies the manifest.json.
```

## Author

Francesco Saverio Cannizzaro ([fcannizzaro](https://github.com/fcannizzaro))

## License

MIT
