import './actions/sample';
import { StreamDeck } from '@stream-deck-for-node/sdk';

interface PluginSettings {
    sample: string;
}

export const sd = new StreamDeck<PluginSettings>();


