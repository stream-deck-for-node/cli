let counter = 0;

exports.SampleAction = (sd) => ({
    onKeyDown: (e) => {
        sd.setTitle(e.context, "Tap " + ++counter);
    }
});
