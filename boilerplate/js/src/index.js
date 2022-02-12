const {SampleAction} = require("./actions/sample");
const {StreamDeck} = require("@stream-deck-for-node/sdk");

const sd = new StreamDeck({
    actions: {
        'sample-action': SampleAction
    }
});
