const {SampleAction} = require("./actions/sample");
const {StreamDeck} = require("elgato-stream-deck-sdk");

const sd = new StreamDeck({
    actions: {
        'sample-action': SampleAction
    }
});
