interface ManifestOptions {
  uuid: string;
  name: string;
  description: string;
  author: string;
  category: string;
  targets: string;
}
export const createManifest = (options: ManifestOptions) => {
  const hasWin = options.targets.includes('win');
  const hasMac = options.targets.includes('mac');
  return {
    UUID: options.uuid,
    Name: options.name,
    Author: options.author,
    Description: options.description,
    Icon: './icons/pluginIcon',
    Version: '1.0.0',
    SDKVersion: 2,
    Software: {
      MinimumVersion: '5.0'
    },
    OS: [
      hasWin && {
        Platform: 'windows',
        MinimumVersion: '10'
      },
      hasMac && {
        Platform: 'mac',
        MinimumVersion: '10'
      }
    ].filter(Boolean),
    Category: options.category,
    CategoryIcon: 'icons/category',
    CodePathWin: hasWin ? `${options.uuid}.exe` : undefined,
    CodePathMac: hasMac ? options.uuid : undefined,
    Actions: [
      {
        Icon: 'icons/actionIcon',
        Name: 'Sample Action',
        States: [
          {
            Image: 'icons/actionState'
          }
        ],
        Tooltip: 'Sample Action',
        UUID: `${options.uuid}.sample-action`
      }
    ]
  };
};
