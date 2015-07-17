/**
 * Tizen platform
 */
!(function (window, undefined) {
    SB.createPlatform('tizen', {

        $plugins: {},
        platformUserAgent: 'maple',
        detect: function(){
            $$log('>>>>>>>>>> detect tizen');
            var userAgent = navigator.userAgent.toLowerCase();
            $$log(userAgent);
            var ret = false;
            if(!!window.tizen){
                $$log('This is Tizen platform');
                ret = true;
                if(!!window.tizen.tv){
                    $$log('This is Samsung Tizen TV platform.');
                } else {
                    $$log('This is Tizen but not TV');
                }
            } else {
              $$log('This is not Tizen platform.');
            }
            return ret
        },

        onDetect: function () {
            $$log('>>>>>>>> on detect, do nothing');
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

        },

        sendReturn: function () {

        },

        blockNavigation: function () {

        }
    });

})(this);