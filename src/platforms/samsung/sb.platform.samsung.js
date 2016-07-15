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
    var userAgent = navigator.userAgent.toLowerCase();
    var isNotSF = userAgent.indexOf('2015') >= 0;
    var PL_TV_PRODUCT_TYPE_BD = 2;
    var productType  = null;

    SB.createPlatform('samsung', {

        $plugins: {},
        platformUserAgent: 'maple',
        keys: {},

        onDetect: function () {
            if (isNotSF){
                samsungFiles = [
                    '$MANAGER_WIDGET/Common/API/TVKeyValue.js',
                    '$MANAGER_WIDGET/Common/API/Plugin.js',
                    '$MANAGER_WIDGET/Common/API/Widget.js',
                    '$MANAGER_WIDGET/Common/webapi/1.0/webapis.js',
                    "$MANAGER_WIDGET/Common/webapi/1.0/deviceapis.js"
                ];
                plugins.plugin = 'SAMSUNG-INFOLINK-SEF';
            }

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
        setRelatetPlatformCSS: function(rootUrl, tema, isReplace, cb){
                var _resolutionObj = {width: 1280, height: 720};
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
        },
        getMac: function () {
            return this.$plugins.pluginObjectNetwork.GetMAC();
        },

        getSDI: function () {
            if(isNotSF) {
                return null;
            }
            this.$plugins.SDIPlugin = sf.core.sefplugin('ExternalWidgetInterface');
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
            if(isNotSF) {
                return null;
            }
            var audiocontrol= deviceapis.audiocontrol;
            audiocontrol.setVolumeUp();
            return audiocontrol.getVolume();
        },

        setVolumeDown: function()
        {
            if(isNotSF) {
                return null;
            }
            var audiocontrol= deviceapis.audiocontrol;
            audiocontrol.setVolumeDown();
            return audiocontrol.getVolume();
        },

        setMute: function()
        {
            if(isNotSF) {
                return null;
            }
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
          var self = this;

            _.each(plugins, function (clsid, id) {
                self.$plugins[id] = document.getElementById(id);
            });

            this.$plugins.tvKey = new Common.API.TVKeyValue();

            var NNAVIPlugin = this.$plugins.pluginObjectNNavi;

            this.modelCode = NNAVIPlugin.GetModelCode();
            this.firmware = NNAVIPlugin.GetFirmware();

            this.pluginAPI = new Common.API.Plugin();
            this.widgetAPI = new Common.API.Widget();
            this.setKeys();
            this.widgetAPI.sendReadyEvent();


            if(NNAVIPlugin.SetBannerState){
                if (window.onShow){
                    window.onShow = function() {
                        self._setBannerState(self);
                    }
                } else {
                     setTimeout(function(){
                         self._setBannerState(self);
                     }, 500);
                }

            }
            self.pluginAPI.unregistKey(27);
            self.pluginAPI.unregistKey(262);
            self.pluginAPI.unregistKey(147);
            self.pluginAPI.unregistKey(45);
            self.pluginAPI.unregistKey(261);
        },

        _setBannerState: function(self){
            function unregisterKey(key){
                try{
                    self.pluginAPI.unregistKey(self.$plugins.tvKey['KEY_'+key]);
                }catch(e){
                    $$error(e);
                 }
            }
            var NNAVIPlugin = self.$plugins.pluginObjectNNavi;

            NNAVIPlugin.SetBannerState(2);
            unregisterKey('VOL_UP');
            unregisterKey('VOL_DOWN');
            unregisterKey('MUTE');
            unregisterKey('PANEL_VOL_UP');
            unregisterKey('PANEL_VOL_DOWN');
            self.pluginAPI.unregistKey(7);
            self.pluginAPI.unregistKey(11);

            if(isNotSF) {
                NNAVIPlugin.SetBannerState(1);
            }
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
          if(isNotSF){
            var tvKey = this.$plugins.tvKey;
            this.keys = {
                ENTER: tvKey.KEY_ENTER,
                PAUSE: tvKey.KEY_PAUSE,
                LEFT: tvKey.KEY_LEFT,
                UP: tvKey.KEY_UP,
                RIGHT: tvKey.KEY_RIGHT,
                DOWN: tvKey.KEY_DOWN,
                N0: tvKey.KEY_0,
                N1: tvKey.KEY_1,
                N2: tvKey.KEY_2,
                N3: tvKey.KEY_3,
                N4: tvKey.KEY_4,
                N5: tvKey.KEY_5,
                N6: tvKey.KEY_6,
                N7: tvKey.KEY_7,
                N8: tvKey.KEY_8,
                N9: tvKey.KEY_9,
                RED: tvKey.KEY_RED,
                GREEN: tvKey.KEY_GREEN,
                YELLOW: tvKey.KEY_YELLOW,
                BLUE: tvKey.KEY_BLUE,
                REW: tvKey.KEY_RW,
                STOP: tvKey.KEY_STOP,
                PLAY: tvKey.KEY_PLAY,
                FF: tvKey.KEY_FF,
                RETURN: tvKey.KEY_RETURN,
                CH_UP: tvKey.KEY_CH_UP,
                CH_DOWN: tvKey.KEY_CH_DOWN,
                TOOLS: tvKey.KEY_TOOLS,
                VOL_UP: tvKey.KEY_VOL_UP,
                VOL_DOWN: tvKey.KEY_VOL_DOWN
            }
          }  else {
              this.keys = sf.key;
          }
          var self = this;

          document.body.onkeydown = function ( event ) {
            var keyCode = event.keyCode;

            switch ( keyCode ) {
              case self.keys.RETURN:
              case self.keys.EXIT:
              case 147:
              case 261:
                self.blockNavigation(event);
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
            if(isNotSF){
                try {
                    this.pluginAPI.setOnScreenSaver();
                } catch (e) {
                    $$log("enableScreenSaver exception [" + e.code + "] name: " + e.name
                          + " message: " + e.message);
                }
                return;
            }
            time = time || false;
            sf.service.setScreenSaver(true, time);
        },

        /**
         * Disable screensaver
         */
        disableScreenSaver: function () {
            if(isNotSF){
                try {
                    this.pluginAPI.setOffScreenSaver();
                } catch (e) {
                    $$log("disableScreenSaver exception [" + e.code + "] name: " + e.name
                          + " message: " + e.message);
                }
                return;
            }
            sf.service.setScreenSaver(false);
        },

        exit: function () {
            if (isNotSF){
                this.widgetAPI.sendExitEvent();
                return;
            }
            sf.core.exit(false);
        },

        sendReturn: function () {
            if (isNotSF){
                this.widgetAPI.sendReturnEvent();
                return;
            }
            sf.core.exit(true);
        },

        blockNavigation: function (e) {
            if (isNotSF){
                this.widgetAPI.blockNavigation(e);
                return;
            }
            sf.key.preventDefault();
        }
    });

})(this);