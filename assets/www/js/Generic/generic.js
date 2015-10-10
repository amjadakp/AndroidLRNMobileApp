function ShowDefaultLoadingImage(msg) {
    $.mobile.loading('show', {
        textVisible: true,
        textonly: false,
        theme: 'b',
        html: "<p >" + msg + "</p></br><img src='./css/core/images/ajax-loader.gif' />"
    });
    $('body').append('<div class="loaderBG"/>');
}

function HideDefaultLoadingImage() {
    $.mobile.loading('hide');
    $('.loaderBG').remove();
}

function setUsername() {
    var fName = localStorage.getItem('fName');
    var lName = localStorage.getItem('lName');
    $('.fname').html(fName);
    $('.lname').html(lName);

}

function UrlExists(url) {
    var http = new XMLHttpRequest();
    http.open('GET', url, false);
    http.timeout = 4000;
    http.send();
    var status = (http.responseXML != null && http.responseXML != "");
    return status;
}

function SetStartupPage() {}

function DoLogging(type, functionName, logDetails) {
    var currentdate = new Date();
    var timestamp = currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " - " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();

    db.transaction(function(tx) {
        tx.executeSql("INSERT INTO LOGS(LOG_TYPE, LOG_FUNCTION, LOG_TRACE, LOG_TIME) VALUES (?, ?, ?, ?)", [type, functionName, logDetails, timestamp], function(tx, result) {}, function(err) {});
    });
}

function ClearLogs() {
    db.transaction(function(tx) {
        tx.executeSql('DELETE FROM LOGS');
    });
}

function checkPassword(str) {
    var regularExpression = /^(?=.*[!@#$%^&*])/;
    if (str.length < 6) {
        $("#messageText").html("");
        $("#messageText").html("Minimum 6 characters required.");
        $("#passwordValidation").simpledialog2();
        return false;
    } else if (str.length > 50) {
        $("#messageText").html("");
        $("#messageText").html("Maximum 50 characters required.");
        $("#passwordValidation").simpledialog2();
        return false;
    } else if (str.search(/\d/) == -1) {
        $("#messageText").html("");
        $("#messageText").html("At least one numeric value is required.");
        $("#passwordValidation").simpledialog2();
        return false;
    } else if (str.search(/[a-zA-Z]/) == -1) {
        $("#messageText").html("");
        $("#messageText").html("At least one alphabet is required.");
        $("#passwordValidation").simpledialog2();
        return false;
    }
    return true;
}
var consoleHolder = console;
function debug() {

    if (noInfologs) {

        consoleHolder = console;
        console = {};
        console.log = function() {};
    } else {
        if (!infoLogsInConsole) {
            console.log = function(msg) {
                if (db != null && !noInfologs && !infoLogsInConsole)
                    DoLogging("Info", "ConsoleLog", msg);
            };
        }
        console = consoleHolder;

    }
}