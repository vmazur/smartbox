/**
 * Tizen platform
 */
!(function (window, undefined) {

    var
        plugins = {
            avplayer: '<div id="av-cnt"><object id="av-player" type="application/avplayer" style="width:1280px;height:720px;position: absolute;z-index: 1001;"></object></div>'
        },
        samsungFiles = [
        '$WEBAPIS/webapis/webapis.js'
        ];

    SB.createPlatform('tizen', {

        $plugins: {},
        platformUserAgent: 'Tizen',
        keys: {
            ENTER: 13,
            PAUSE: 19,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            N0: 48,
            N1: 49,
            N2: 50,
            N3: 51,
            N4: 52,
            N5: 53,
            N6: 54,
            N7: 55,
            N8: 56,
            N9: 57,
            RED: 403,
            GREEN: 404,
            YELLOW: 405,
            BLUE: 406,
            REW: 412,
            STOP: 413,
            PLAY: 415,
            FF: 417,
            RETURN: 10009,
            CH_UP: 427,
            CH_DOWN: 428,
            TOOLS: 10135,
            EXIT: 10182,
            PLAYPAUSE: 10252
        },
        detect: function(){
            Storage.prototype._setItem = function(key, obj) {
                return this.setItem(key, JSON.stringify(obj));
            };
            Storage.prototype._getItem = function(key) {
                try {
                    return JSON.parse(this.getItem(key));
                } catch(error) {
                    return undefined;
                }
            };
            if(!!window.tizen || navigator.userAgent.indexOf("sdk") != -1){
                return true;
            }
            // debug return true
            return false;
        },

        onDetect: function () {
            var htmlString = '';
            for (var i = 0; i < samsungFiles.length; i++) {
                htmlString += '<script type="text/javascript" src="' + samsungFiles[i] + '"></script>';
            }
            for (var id in plugins) {
                htmlString += plugins[id]
            }
            document.write(htmlString);
        },
        getVersion: function(){
            var version = 'unknown';
            try {
                  version = webapis.tvinfo.getVersion();
                } catch (error) {
                  console.log(" error code = " + error.code);
            }
            return version;
        },
        getFirmware: function(){
            var firmware = 'unknown';
            try {
                  firmware = webapis.productinfo.getFirmware();
                } catch (error) {
                  console.log(" error code = " + error.code);
            }
            return firmware;
        },
        getDuid: function(){
            var diu = 'unknown';
            try {
                diu = webapis.productinfo.getDuid();
            } catch (error) {
                console.log(" error code = " + error.code);
            }
            return diu;
        },
        getMac: function () {
            var mac = null;
            try {
                mac = webapis.network.getMac();
            } catch (e) {
                console.log("getGateway exception [" + e.code + "] name: " + e.name
                      + " message: " + e.message);
            }
            return mac
        },
        getModelCode: function(){
            var modelCode = 'unknown';
            try {
                modelCode = webapis.productinfo.getModelCode();
            } catch (e) {
                console.log("getGateway exception [" + e.code + "] name: " + e.name
                      + " message: " + e.message);
            }

            return modelCode;
        },
        getModel: function(){
            var model = 'unknown';
            try {
                model = webapis.productinfo.getRealModel() || webapis.productinfo.getModel();
            } catch (error) {
                console.log(" error code = " + error.code);
            }
            return model;
        },
        getSDI: function () {

        },
        getCustomDeviceInfo: function(full){
            return "Duid:"+ this.getDuid() +';Version:' + this.getVersion() + ';Firmware:' + this.getFirmware()
                   + ";ModelCode:" + this.getModelCode() + ";Model:" + this.getModel();
        },
        /**
         * Return hardware version for 2013 samsung only
         * @returns {*}
         */
        getHardwareVersion: function () {
            return this.getFirmware();
        },
        setPlugins: function () {
            window._localStorage = window.localStorage;
            tizen.tvinputdevice.registerKey("MediaPlayPause");
            tizen.tvinputdevice.registerKey("MediaPlay");
            tizen.tvinputdevice.registerKey("MediaPause");
            tizen.tvinputdevice.registerKey("MediaStop");
            tizen.tvinputdevice.registerKey("MediaFastForward");
            tizen.tvinputdevice.registerKey("MediaRewind");
            tizen.tvinputdevice.registerKey("ColorF0Red");
            tizen.tvinputdevice.registerKey("ColorF1Green");
            tizen.tvinputdevice.registerKey("ColorF2Yellow");
            tizen.tvinputdevice.registerKey("ColorF3Blue");
            tizen.tvinputdevice.registerKey("Exit");



        var self = this;
        document.addEventListener('visibilitychange', function (){
            var _plugin = window.playerView?window.playerView.plugin:undefined;
            if(document.hidden){
                if (_plugin){
                    webapis.avplay.suspend();
                }
            } else {
                var _checkConn = setInterval(function(){
                    if(self.checkConnection()){
                        clearInterval(_checkConn);
                        if (_plugin){
                            webapis.avplay.restore();
                        }
                    }
                }, 500);
            }
        });

        },
        setRelatetPlatformCSS: function(rootUrl, tema, isReplace, cb){
            tizen.systeminfo.getPropertyValue("DISPLAY", function(e){
                var _resolutionObj = {width: e.resolutionWidth, height: e.resolutionHeight};
                var resolution = rootUrl + 'css/' +tema+ '/resolution/' + _resolutionObj.width + 'x' + _resolutionObj.height + '.css';
                var main = rootUrl + 'css/' + tema + '/css.css';
                var defaulRes = rootUrl + 'css/resolution/'+ _resolutionObj.width + 'x' + _resolutionObj.height + '.css';
                if (!isReplace){
                    $('head').append('<link rel="stylesheet" href="' + main + ' " type="text/css" />');
                    $('head').append('<link rel="stylesheet" href="' + defaulRes + ' " type="text/css" />');
                    $('head').append('<link rel="stylesheet" href="' + resolution + '" type="text/css" />');
                    cb(false, false, _resolutionObj);
                } else {
                    cb(main, 1, _resolutionObj);
                    cb(defaulRes, 2, _resolutionObj);
                    cb(resolution, 3, _resolutionObj);
                }
            });
        },
        disableNetworkCheck: function(){
            if (this.internetCheck !== undefined){
                clearInterval(this.internetCheck);
            }
        },
        enableNetworkCheck: function(cntx, cb, t){
            var interv = t || 500;
            this.internetCheck = setInterval(this.cyclicInternetConnectionCheck, interv, cntx, this, cb);
        },
        cyclicInternetConnectionCheck: function(context, me, cb){
            var self = me;
            cb.apply(context, [self.checkConnection()]);
        },
        checkConnection: function(){
            var gateway = false;
            try {
                gateway = webapis.network.getGateway();
            } catch (e) {
                $$log("getGateway exception [" + e.code + "] name: " + e.name
                      + " message: " + e.message);
            }
            return gateway?true:false;
        },
        /**
         * Start screensaver
         * @param time
         */
        enableScreenSaver: function () {
            $$log('>>>>>>>> enableScreenSaver');
            try {
                webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_ON);
            } catch (e) {
                $$log("enableScreenSaver exception [" + e.code + "] name: " + e.name
                      + " message: " + e.message);
            }
        },

        /**
         * Disable screensaver
         */
        disableScreenSaver: function () {
            $$log('>>>>>>>> disableScreenSaver');
            try {
                webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF);
            } catch (e) {
                $$log("disableScreenSaver exception [" + e.code + "] name: " + e.name
                      + " message: " + e.message);
            }
        },

        exit: function (fullExit) {
            if (fullExit === -1){
                Bugsnag.notify('Application Hide: ', self.userAgent, {}, "info");
                tizen.application.getCurrentApplication().hide();
            } else {
                Bugsnag.notify('Application EXIT: ', self.userAgent, {}, "info");
                tizen.application.getCurrentApplication().exit();
            }
        },

        sendReturn: function () {

        },

        blockNavigation: function () {

        }
    });

})(this);
