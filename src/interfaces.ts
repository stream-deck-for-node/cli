import { CommandLineOptions, OptionDefinition } from 'command-line-args';

export interface CliCommand {
  definitions: OptionDefinition[];

  execute(args: CommandLineOptions): void;
}

interface State {
  Image: string;
}

interface Action {
  Icon: string;
  Name: string;
  States: State[];
  SupportedInMultiActions: boolean;
  Tooltip: string;
  UUID: string;
}

export interface PluginManifest {
  UUID: string;
  Name: string;
  Description: string;
  CodePath?: string;
  CodePathWin?: string;
  CodePathMac?: string;
  Actions: Action[];
}

export type GithubRelease = Record<string, Array<Record<string, string>>>;
