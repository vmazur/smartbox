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
        detect: function(){
            if(!!window.tizen){
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

        },

        getMac: function () {

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
            var gatewayStatus = 0,
            // Get active connection type - wired or wireless.
            currentInterface = this.$plugins.pluginObjectNetwork.GetActiveType();
            if (currentInterface === -1) {
                return false;
            }
            gatewayStatus = this.$plugins.pluginObjectNetwork.CheckGateway(currentInterface);
            if (gatewayStatus !== 1) {
                return false;
            }
                return true;
        },
        /**
         * Set keys for samsung platform
         */
        setKeys: function () {


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