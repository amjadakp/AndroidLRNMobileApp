
API_BASE.LogEventArgs = function () {
	API_BASE.LogEventArgs.constructBase(this);
}
API_BASE.LogEventArgs.prototype = {
	message : null,
	errorCode : null,
	errorDescription : null
}
API_BASE.LOG = function () {}
API_BASE.LOG.add_logEvent = function (value) {
	API_BASE.LOG.$1 = Delegate.combine(API_BASE.LOG.$1, value);
}
API_BASE.LOG.remove_logEvent = function (value) {
	API_BASE.LOG.$1 = Delegate.remove(API_BASE.LOG.$1, value);
}
API_BASE.LOG.displayMessage = function (message, errorCode, errorDescription) {

	if (!API_BASE.LOG.silent && API_BASE.LOG.$1 != null) {
		console.log("LMS Message: " + message);
		if (errorCode != 0) {
			console.log("LMS ERRORCODE: " + errorCode);
			console.log("LMS ERRORDESCRIPTION: " + errorDescription);
		}
	}
}
API_BASE.BaseActivityTreeNodeEventArgs.createClass('API_BASE.BaseActivityTreeNodeEventArgs', EventArgs);
API_BASE.BaseUtils.createClass('API_BASE.BaseUtils');
API_BASE.LogEventArgs.createClass('API_BASE.LogEventArgs', EventArgs);
API_BASE.LOG.createClass('API_BASE.LOG');
API_BASE.BaseUtils.ncName = '[A-Za-z_][\\w\\\\.\\\\-]*';
API_BASE.LOG.silent = false;
API_BASE.LOG.$0 = new API_BASE.LogEventArgs();
API_BASE.LOG.$1 = null;
// ---- Do not remove this footer ----
// This script was generated using Script# v0.5.5.0 (http://projects.nikhilk.net/ScriptSharp)
// -----------------------------------
