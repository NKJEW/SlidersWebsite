// printers are used to display information
function getConsolePrinter() { return function(msg) { console.log(msg); } }
function getHtmlPrinter(elementId) { return function(msg) { $("#" + elementId).html(getHtmlSafeText(msg)); } }

function getAlertPrinter(id) {
    return function(msg) {
        if (!isNullOrEmpty(msg)) {
            $("#" + id + "_alert").css("display", "");
            $("#" + id + "_alert_message").text(msg);
        } else {
            $("#" + id + "_alert").css("display", "none");
        }
    }
}

function clearAlertPrinter(id) {
    getAlertPrinter(id)("");
}

function getPageRedirector(path) { return function() { window.location.href = path; } }
function goToPageSafe(path) {
    if (profCommands.getIsProcessing()) return;
    if (studentCommands.getIsProcessing()) return;

    window.location.href = path;
}

function getURLClassCode() {
    return new URLSearchParams(window.location.search).get('code');
}

function printError(err, printer) {
    printer("Unexpected error: See console for details.");
    console.log("Error: " + JSON.stringify(err, undefined, 2));
}

function isNullOrEmpty(str) { return !str || str === ""; }
function isString(obj) { return typeof obj === 'string' || obj instanceof String; }

function loadStringFromStorage(key) {
    var val = localStorage.getItem(key);
    if (isString(val)) {
        return val;
    }

    return "";
}

function getHtmlSafeText(text) {
    return $('<span>').text(text).html();
}

// date formatting
function getPaddedNumStr(num, digits) {
    return new String(num).padStart(digits, '0');
}

function parseSlidersDateString(datestring) {
    let parsedDate = new Date(Date.parse(datestring));
    return new Date(Date.UTC(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate(),
        parsedDate.getHours(),
        parsedDate.getMinutes(),
        parsedDate.getSeconds()
    ));
}

function getSlidersFormattedDateString(timestamp) {
    // format is "yyyy MM/dd HH:mm:ss", where the time is in UTC
    return timestamp.getUTCFullYear() + " " +
        getPaddedNumStr(timestamp.getUTCMonth() + 1, 2) + "/" + // months are 0-indexed
        getPaddedNumStr(timestamp.getUTCDate(), 2) + " " +
        getPaddedNumStr(timestamp.getUTCHours(), 2) + ":" +
        getPaddedNumStr(timestamp.getUTCMinutes(), 2) + ":" +
        getPaddedNumStr(timestamp.getUTCSeconds(), 2);
}

function getWebFormattedDateString(timestamp) {
    // format is "yyyy-MM-dd"
    return timestamp.getFullYear() + "-" +
        getPaddedNumStr(timestamp.getMonth() + 1, 2) + "-" + // months are 0-indexed
        getPaddedNumStr(timestamp.getDate(), 2);
}

function getShortFormattedDateString(date) {
    return new String(date.getMonth() + 1) + "/" + new String(date.getDate());
}

// login caching
loginManager = function() {
    const CACHED_TABLE_KEY_KEY = "table_key";
    const CACHED_PASSWORD_KEY = "password";
    const LOGIN_KEY_TYPE_KEY = "login_type";
    let cachedTableKey = loadStringFromStorage(CACHED_TABLE_KEY_KEY);
    let cachedPassword = loadStringFromStorage(CACHED_PASSWORD_KEY);
    let cachedLoginType = loadStringFromStorage(LOGIN_KEY_TYPE_KEY);

    const PROF_LOGIN_KEY_TYPE = "p";
    const STUDENT_LOGIN_KEY_TYPE = "s";

    function loginAsProfessor(email, password) {
        cacheLogin(email, password, PROF_LOGIN_KEY_TYPE);
    }

    function loginAsStudent(accountID, password) {
        cacheLogin(new String(accountID), password, STUDENT_LOGIN_KEY_TYPE);
    }

    function cacheLogin(tableKey, password, loginType) {
        cachedTableKey = tableKey;
        localStorage.setItem(CACHED_TABLE_KEY_KEY, tableKey);

        cachedPassword = password;
        localStorage.setItem(CACHED_PASSWORD_KEY, password);

        cachedLoginType = loginType;
        localStorage.setItem(LOGIN_KEY_TYPE_KEY, loginType);
    }

    function logout(onComplete) {
        if (profCommands.getIsProcessing()) return;
        if (studentCommands.getIsProcessing()) return;

        cacheLogin("", "", "");
        onComplete();
    }

    function isProfessor() {
        return cachedLoginType === PROF_LOGIN_KEY_TYPE;
    }

    function isStudent() {
        return cachedLoginType === STUDENT_LOGIN_KEY_TYPE;
    }

    function getCachedEmail() {
        return cachedTableKey;
    }

    function getCachedStudentID() {
        return parseInt(cachedTableKey);
    }

    function getCachedPassword() {
        return cachedPassword;
    }

    return {
        loginAsProfessor:loginAsProfessor,
        loginAsStudent:loginAsStudent,
        logout:logout,
        isProfessor:isProfessor,
        isStudent:isStudent,
        getCachedEmail:getCachedEmail,
        getCachedStudentID:getCachedStudentID,
        getCachedPassword:getCachedPassword
    }
}();
