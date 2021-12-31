import "./actions/sample";
import {StreamDeck} from "elgato-stream-deck-sdk";

interface PluginSettings {
    sample: string
}

export const sd = new StreamDeck<PluginSettings>();


