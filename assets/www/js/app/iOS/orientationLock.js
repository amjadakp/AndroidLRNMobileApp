var screenOrientation = {},
iosOrientation = 'unlocked',
orientationMap  = {
    'portrait': [0,180],
    'portrait-primary': [0],
    'portrait-secondary': [180],
    'landscape': [-90,90],
    'landscape-primary': [-90],
    'landscape-secondary': [90],
    'default': [-90,90,0]
};

window.shouldRotateToOrientation = function(orientation) {
var map = orientationMap[iosOrientation] || orientationMap['default'];
var res = map.indexOf(orientation) >= 0;
return res;
};

var screenOrientation = function() {}

screenOrientation.prototype.set = function(str, success, fail) {
if (str === iosOrientation)
    return;

var args = {};
args.key = str;
iosOrientation = str;
cordova.exec(success, fail, "ScreenOrientation", "set", [args]);
};


cordova.addConstructor(function() {
if (!window.plugins) {
    window.plugins = {};
}
window.plugins.screenOrientation = new screenOrientation();
});