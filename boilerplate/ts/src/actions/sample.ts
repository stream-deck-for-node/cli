import { Action, BaseAction, KeyEvent } from 'elgato-stream-deck-sdk';
import { sd } from '../index';

let counter = 0;

@Action('sample-action')
export class SampleAction extends BaseAction {

    onKeyDown(e: KeyEvent) {
        sd.setTitle(e.context, 'Tap ' + ++counter);
    }

}
