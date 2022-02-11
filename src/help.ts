export const help = [
  {
    header: 'Stream Deck Node.js CLI',
    content: 'Everything needed to create a Stream Deck\'s plugin in Node.js'
  },
  {
    header: 'Synopsis',
    content: '$ stream-deck <command> <options>'
  },
  {
    header: 'Command List',
    content: [
      {
        name: 'create',
        summary: 'Generate a new plugin project with a sample action.'
      },
      {
        name: 'link',
        summary: 'Create a symlink between your development code and the Elgato plugins directory.'
      },
      {
        name: 'unlink',
        summary: 'Remove (if exists) the symlink created with the link command.'
      },
      {
        name: 'dev',
        summary: 'Temporary modify the manifest.json using a debug-plugin for a faster development.'
      },
      {
        name: 'package',
        summary: 'Generate a .streamDeckPlugin using the Elgato DistributionTool.'
      }
    ]
  },
  {
    header: 'dev options',
    optionList: [
      {
        name: 'persistent',
        alias: 'p',
        type: Boolean,
        description: 'dev command persistently modifies the manifest.json.'
      }
    ]
  }
];
