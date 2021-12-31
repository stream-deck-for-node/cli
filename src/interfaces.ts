import {CommandLineOptions} from "command-line-args";

export interface CliCommand {

    definitions: any[]

    execute(args: CommandLineOptions): void

}

interface State {
    Image: string
}

interface Action {
    Icon: string
    Name: string
    States: State[]
    SupportedInMultiActions: boolean
    Tooltip: string
    UUID: string
}

export interface PluginManifest {
    Name: string
    Description: string
    CodePath?: string
    CodePathWin?: string
    CodePathMac?: string
    Actions: Action[]
}
