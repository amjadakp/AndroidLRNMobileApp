function OrientationLock() {}

OrientationLock.prototype.lock = function(orientation, win, fail) {
    return PhoneGap.exec(function(args) {
        if (win !== undefined) {
            win(args);
        }
    }, function(args) {
        if (fail !== undefined) {
            fail(args);
        }
    }, "OrientationLock", "lock", [orientation]);
};

OrientationLock.prototype.unlock = function(win, fail) {
    return PhoneGap.exec(function(args) {
        if (win !== undefined) {
            win(args);
        }
    }, function(args) {
        if (fail !== undefined) {
            fail(args);
        }
    }, "OrientationLock", "unlock", []);
};

PhoneGap.addConstructor(function() {
    if (!window.plugins) {
        window.plugins = {};
    }
    window.plugins.OrientationLock = new OrientationLock();
});