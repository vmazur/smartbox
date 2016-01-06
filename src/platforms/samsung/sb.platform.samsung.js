/**
 * Samsung platform
 */
!(function (window, undefined) {


    var
        document=window.document,
        /**
         * Native plugins
         * id: clsid (DOM element id : CLSID)
         * @type {{object}}
         */
            plugins = {
            audio: 'SAMSUNG-INFOLINK-AUDIO',
            pluginObjectTV: 'SAMSUNG-INFOLINK-TV',
            pluginObjectTVMW: 'SAMSUNG-INFOLINK-TVMW',
            pluginObjectNetwork: 'SAMSUNG-INFOLINK-NETWORK',
            pluginObjectNNavi: 'SAMSUNG-INFOLINK-NNAVI',
            pluginPlayer: 'SAMSUNG-INFOLINK-PLAYER'
        },
        samsungFiles = [
            '$MANAGER_WIDGET/Common/af/../webapi/1.0/deviceapis.js',
            '$MANAGER_WIDGET/Common/af/../webapi/1.0/serviceapis.js',
            '$MANAGER_WIDGET/Common/af/2.0.0/extlib/jquery.tmpl.js',
            '$MANAGER_WIDGET/Common/Define.js',
            '$MANAGER_WIDGET/Common/af/2.0.0/sf.min.js',
            '$MANAGER_WIDGET/Common/API/Plugin.js',
            '$MANAGER_WIDGET/Common/API/Widget.js',
            '$MANAGER_WIDGET/Common/API/TVKeyValue.js',
            'src/platforms/samsung/localstorage.js'
        ];

    SB.createPlatform('samsung', {

        $plugins: {},
        platformUserAgent: 'maple',

        onDetect: function () {
            $$log('>>>>>>>>> samsung ondetect');
            // non-standart inserting objects in DOM (i'm looking at you 2011 version)
            // in 2011 samsung smart tv's we can't add objects if document is ready

            var htmlString = '';
            for (var i = 0; i < samsungFiles.length; i++) {
                htmlString += '<script type="text/javascript" src="' + samsungFiles[i] + '"></script>';
            }
            for (var id in plugins) {
                htmlString += '<object id=' + id + ' border=0 classid="clsid:' + plugins[id] + '" style="opacity:0.0;background-color:#000000;width:0px;height:0px;"></object>';
            }
            document.write(htmlString);
        },
        getCustomDeviceInfo: function(full){
            var devinfo = 'modelCode:' + this.$plugins.pluginObjectNNavi.GetModelCode() +
                ';firmware:' + this.$plugins.pluginObjectNNavi.GetFirmware() +
                ';systemVersion:' + this.$plugins.pluginObjectNNavi.GetSystemVersion(0) +
                ';productCode:' + this.$plugins.pluginObjectTV.GetProductCode(1) +
                ';productType:' + this.$plugins.pluginObjectTV.GetProductType();
                if (full){
                    devinfo += ';NativeDUID:' + this.getNativeDUID() +
                    ';mac:' + this.getMac() +
                    ';SDI:' + this.getSDI() +
                    ';hardwareVersion:' + this.getHardwareVersion();
                }
                return devinfo;
        },
        getNativeDUID: function () {
            return this.$plugins.pluginObjectNNavi.GetDUID(this.getMac());
        },

        getMac: function () {
            return this.$plugins.pluginObjectNetwork.GetMAC();
        },

        getSDI: function () {
            this.SDI = this.$plugins.SDIPlugin.Execute('GetSDI_ID');
            return this.SDI;
        },

        /**
         * Return hardware version for 2013 samsung only
         * @returns {*}
         */
        getHardwareVersion: function () {
            var version = this.firmware.match(/\d{4}/) || [];
            if (version[0] === '2013') {
                this.hardwareVersion = sf.core.sefplugin('Device').Execute('Firmware');
            } else {
                this.hardwareVersion = null;
            }
            return this.hardwareVersion;
        },

        setVolumeUp: function()
        {
            var audiocontrol= deviceapis.audiocontrol;
            audiocontrol.setVolumeUp();
            return audiocontrol.getVolume();
        },

        setVolumeDown: function()
        {
            var audiocontrol= deviceapis.audiocontrol;
            audiocontrol.setVolumeDown();
            return audiocontrol.getVolume();
        },

        setMute: function()
        {
            var audiocontrol= deviceapis.audiocontrol;
            var mute = audiocontrol.getMute();

            if(mute === true)
            {
                audiocontrol.setMute(false);
            }
            else
            {
                audiocontrol.setMute(true);
            }
            return mute?audiocontrol.getVolume():0;
        },

        setPlugins: function () {
          var self = this,
            PL_NNAVI_STATE_BANNER_NONE = 0,
            PL_NNAVI_STATE_BANNER_VOL = 1,
            PL_NNAVI_STATE_BANNER_VOL_CH = 2,
            tvKey;

            _.each(plugins, function (clsid, id) {
                self.$plugins[id] = document.getElementById(id);
            });

            this.$plugins.SDIPlugin = sf.core.sefplugin('ExternalWidgetInterface');
            this.$plugins.tvKey = new Common.API.TVKeyValue();

            var NNAVIPlugin = this.$plugins.pluginObjectNNavi,
                TVPlugin = this.$plugins.pluginObjectTV;

            this.modelCode = NNAVIPlugin.GetModelCode();
            this.firmware = NNAVIPlugin.GetFirmware();
            this.systemVersion = NNAVIPlugin.GetSystemVersion(0);
            this.productCode = TVPlugin.GetProductCode(1);

            this.pluginAPI = new Common.API.Plugin();
            this.widgetAPI = new Common.API.Widget();

            tvKey = new Common.API.TVKeyValue();
            this.productType = TVPlugin.GetProductType();

            this.setKeys();

            this.pluginAPI.SetBannerState(1);

            if(this.pluginAPI.SetBannerState){
              NNAVIPlugin.SetBannerState(PL_NNAVI_STATE_BANNER_VOL_CH);
            }
            function unregisterKey(key){
                try{
                    self.pluginAPI.unregistKey(tvKey['KEY_'+key]);
                }catch(e){
                    $$error(e);
                 }
            }
            unregisterKey('VOL_UP');
            unregisterKey('VOL_DOWN');
            unregisterKey('MUTE');
            unregisterKey('PANEL_VOL_UP');
            unregisterKey('PANEL_VOL_DOWN');
            self.pluginAPI.unregistKey(7);
            self.pluginAPI.unregistKey(11);
            self.pluginAPI.unregistKey(27);
            self.pluginAPI.unregistKey(262);
            self.pluginAPI.unregistKey(147);
            self.pluginAPI.unregistKey(45);
            self.pluginAPI.unregistKey(261);


            this.widgetAPI.sendReadyEvent();
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

          this.keys = sf.key;
          var self = this;

          document.body.onkeydown = function ( event ) {
            var keyCode = event.keyCode;
            //$$log('keyDown ' + keyCode);

            switch ( keyCode ) {
              case sf.key.RETURN:
              //case sf.key.EXIT:
              case 147:
              case 261:
                sf.key.preventDefault();
                break;
              default:
                break;
            }
          }
        },

        /**
         * Start screensaver
         * @param time
         */
        enableScreenSaver: function (time) {
            time = time || false;
            sf.service.setScreenSaver(true, time);
        },

        /**
         * Disable screensaver
         */
        disableScreenSaver: function () {
            sf.service.setScreenSaver(false);
        },

        exit: function () {
            sf.core.exit(false);
        },

        sendReturn: function () {
            sf.core.exit(true);
        },

        blockNavigation: function () {
            sf.key.preventDefault();
        }
    });

})(this);