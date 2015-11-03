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
            RW: 412,
            STOP: 413,
            PLAY: 415,
            FF: 417,
            RETURN: 10009,
            CH_UP: 427,
            CH_DOWN: 428,
            TOOLS: 10135
        },
        detect: function(){
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
            tizen.tvinputdevice.registerKey("MediaPlayPause");
            tizen.tvinputdevice.registerKey("MediaPlay");
            tizen.tvinputdevice.registerKey("MediaPause");
            tizen.tvinputdevice.registerKey("MediaStop");
            tizen.tvinputdevice.registerKey("MediaFastForward");
            tizen.tvinputdevice.registerKey("MediaRewind");
            tizen.tvinputdevice.registerKey("Tools");
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
        enableScreenSaver: function (time) {

        },

        /**
         * Disable screensaver
         */
        disableScreenSaver: function () {

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