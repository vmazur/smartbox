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
            TOOLS: 10135
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

        getNativeDUID: function () {
            // TO DO
            return '';
        },
        getCustomDeviceInfo: function(){
            return this.getNativeDUID();
        },
        getMac: function () {
            var mac = null;
            try {
                mac = webapis.network.getMac();
            } catch (e) {
                console.log("getGateway exception [" + e.code + "] name: " + e.name
                      + " message: " + e.message);
            }
            console.log(mac);

            return mac
        },

        getSDI: function () {

        },

        /**
         * Return hardware version for 2013 samsung only
         * @returns {*}
         */
        getHardwareVersion: function () {

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


        },
        setRelatetPlatformCSS: function(rootUrl){
            tizen.systeminfo.getPropertyValue("DISPLAY", function(e){
                var cssUrl = rootUrl + 'css/resolution/' + e.resolutionWidth + 'x' + e.resolutionHeight + '.css';
                $('head').append('<link rel="stylesheet" href="' + cssUrl + '" type="text/css" />');
                console.log('INFO: setRelatetPlatformCSS: ' + cssUrl);
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

        exit: function () {
            tizen.application.getCurrentApplication().exit();
        },

        sendReturn: function () {

        },

        blockNavigation: function () {

        }
    });

})(this);