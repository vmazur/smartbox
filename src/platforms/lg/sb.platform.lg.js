/**
 * LG platform
 */

SB.createPlatform('lg', {
    platformUserAgent: 'netcast', // not used
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
        RETURN: 461,
        CH_UP: 33,
        CH_DOWN: 34
    },

    getMac: function () {
        return this.device.net_macAddress.replace(/:/g, '');
    },
    getCustomDeviceInfo: function(){
        return navigator.userAgent;
    },
    shortDevInfo: function(){
        if (!SB.config.modelName){
          return navigator.userAgent + (navigator.productSub?('|' + navigator.productSub):'');
        }
        return SB.config.modelName + '|'+ SB.config.firmwareVersion + '|'+ SB.config.sdkVersion;
    },
    getSDI: $.noop,

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

        if(navigator.userAgent.indexOf('NetCast.TV') != -1 || navigator.userAgent.indexOf('Web0S') != -1){
            this.initWebos();
            return true;
        }
        // fake lg, set true

        return false;
    },
    initWebos: function(){
        document.addEventListener('webOSLaunch', function(inData) {
            webOS.service.request("luna://com.webos.service.sm", {
                method: "deviceid/getIDs",
                parameters: {
                    "idType": ["LGUDID"]
                },
                onSuccess: function (inResponse) {
                    var resp = JSON.stringify(inResponse);
                    for (var i = 0; i < resp.idList.length; i++) {
                        SB.config.device_id = (SB.config.device_id?SB.config.device_id:'') + ((i===0)?'':':') + resp.idList[i].idValue;
                    }
                    //console.log("Result: " + JSON.stringify(inResponse));
                    // To-Do something
                },
                onFailure: function (inError) {
                    console.log("Failed to get system ID information");
                    console.log("[" + inError.errorCode + "]: " + inError.errorText);
                    //console.log(self.CONFIG.device_id);
                    SB.config.device_id = null;

                    return;
                }
            });
            webOS.service.request("luna://com.webos.service.tv.systemproperty", {
              method: "getSystemInfo",
              parameters: {
                  "keys": ["modelName", "firmwareVersion", "UHD", "sdkVersion"]
              },
              onComplete: function (inResponse) {
                  var isSucceeded = inResponse.returnValue;

                  if (isSucceeded){
                      // console.log("Result: " + JSON.stringify(inResponse));
                      SB.config.modelName = inResponse.modelName;
                      SB.config.firmwareVersion = inResponse.firmwareVersion;
                      SB.config.sdkVersion = inResponse.sdkVersion;
                      // To-Do something
                  } else {
                      console.log("Failed to get TV device information");
                      // To-Do something
                      return;
                  }
              }
          });
        }, true);
    },
    getDuid: function(){
        return SB.config.device_id;
    },
    setPlugins: function () {
        $$log('>>>>>>>> setPlugins sb.platform.lg');
        SB.config.logKey = 'green';
        //this._listenGestureEvent();
        window._localStorage = window.localStorage;
        $('body').append('<object type="application/x-netcast-info" id="device" width="0" height="0"></object>');
        this.device = $('#device')[0];

        this.modelCode = this.device.version;
        this.productCode = this.device.modelName;

        this.getDUID();


        //Log.show('default');
        setInterval(function () {
            //Log.show('default');
            var usedMemorySize;
            if (window.NetCastGetUsedMemorySize) {
                usedMemorySize = window.NetCastGetUsedMemorySize();
            }
            //Log.state(Math.floor(usedMemorySize * 100 / (1024 * 1024)) / 100, 'memory', 'profiler');
        }, 5000);


        if (Player && Player.setPlugin) {
            Player.setPlugin();
        }
    },
    sendReturn: function () {
        if (Player) {
            Player.stop(true);
        }
        window.NetCastBack();
    },

    exit: function () {
        Player && Player.stop(true);
        Bugsnag.notify("Exit lg application", "<<< Exit lg application >>>");
        try {
            window.NetCastExit();
        } catch(e) {}
        try {
            webOS.platformBack();
        } catch(e) {}
    },
    enableNetworkCheck: function(cntx, cb, t){},
    getUsedMemory: function () {
        return window.NetCastGetUsedMemorySize();
    },
    getChildlockPin: function () {
        return 1234;
    }
});
