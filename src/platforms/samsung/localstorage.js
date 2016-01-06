SB.readyForPlatform('samsung', function () {

	var localStorage = window.localStorage,
		fileSysObj,
		commonDir,
		fileName,
		fileObj;

    fileSysObj = new FileSystem();
    commonDir = fileSysObj.isValidCommonPath(curWidget.id);

    if ( !commonDir ) {
        fileSysObj.createCommonDir(curWidget.id);
    }
    fileName = curWidget.id + "_localStorage.db";
    fileObj = fileSysObj.openCommonFile(fileName, "r+");

    var lStorage = {},
        changed = false;

    if ( fileObj ) {
        try {
            lStorage = JSON.parse(fileObj.readAll());
        } catch (e) {
            localStorage && localStorage.clear();
        }
    } else {
        fileObj = fileSysObj.openCommonFile(fileName, "w");
        fileObj.writeAll("{}");
    }
    fileSysObj.closeCommonFile(fileObj);



    var saveStorage = _.debounce(function saveStorage() {
        if (changed) {
            fileObj = fileSysObj.openCommonFile(fileName, "w");
            fileObj.writeAll(JSON.stringify(window._localStorage));
            fileSysObj.closeCommonFile(fileObj);
            changed = false;
        }
    },100);

    lStorage._setItem = function ( key, value ) {
        changed = true;
        this[key] = value;
        saveStorage();
        return this[key];
    };
    lStorage._getItem = function ( key ) {
        return this[key];
    };
    lStorage.removeItem = function ( key ) {
        changed = true;
        delete this[key];
        saveStorage();
    };
    lStorage.clear = function () {
        fileSysObj.deleteCommonFile(fileName);
    };
    window._localStorage = lStorage;
});