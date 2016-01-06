/**
 * Browser platform description
 */
SB.createPlatform('browser', {
    keys: {
        RIGHT: 39,
        LEFT: 37,
        DOWN: 40,
        UP: 38,
        RETURN: 27,//esc
        EXIT: 46,//delete
        TOOLS: 32,//space
        FF: 33,//page up
        RW: 34,//page down
        NEXT: 107,//num+
        PREV: 109,//num-
        ENTER: 13,
        RED: 65,//A
        GREEN: 66,//B
        YELLOW: 67,//C
        BLUE: 68,//D
        CH_UP: 221, // ]
        CH_DOWN: 219, // [
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
        PRECH: 45,//ins
        SMART: 36,//home
        PLAY: 97,//numpad 1
        STOP: 98,//numpad 2
        PAUSE: 99,//numpad 3
        SUBT: 76,//l,
        INFO: 73,//i
        REC: 82,//r,
        VOL_UP: 190,
        VOL_DOWN: 188,
        MUTE: 191
    },
    volumeLevel: 0,
    detect: function () {
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
        return true;
    },
    exit: function () {
    },
    getCustomDeviceInfo: function(){
        return this.getNativeDUID();
    },
    setPlugins: function(){
        window._localStorage = window.localStorage;
    },
    setVolumeUp: function(){
        if (this.volumeLevel >100){
            return 100;
        }
        this.volumeLevel += 1;
        return this.volumeLevel;
    },
    setVolumeDown: function(){
        if (this.volumeLevel === 0){
            return 0;
        }
        this.volumeLevel -= 1;
        return this.volumeLevel;
    },
    setMute: function(){
        this.volumeLevel = 0;
    },
    enableScreenSaver: function(){},
    disableScreenSaver: function(){},
    getNativeDUID: function () {
        if (navigator.userAgent.indexOf('Chrome') != -1) {
            this.DUID = 'CHROMEISFINETOO';
        } else {
            this.DUID = 'FIREFOXISBEST';
        }
        return this.DUID;
    },
    enableNetworkCheck: function(cntx, cb, t){
        var interv = t || 500;
        this.internetCheck = setInterval(this.cyclicInternetConnectionCheck, interv, cntx, cb);
    },
    setRelatetPlatformCSS: function(rootUrl){
        var cssUrl = rootUrl + 'css/resolution/default.css';
        $('head').append('<link rel="stylesheet" href="' + cssUrl + '" type="text/css" />');
    },
    cyclicInternetConnectionCheck: function(cntx, cb){
         var xhr = new ( window.ActiveXObject || XMLHttpRequest )( "Microsoft.XMLHTTP" );
         xhr.open( "HEAD", "//" + window.location.hostname + "/?rand=" + Math.floor((1 + Math.random()) * 0x10000), false );

         try {
             xhr.send();
             cb.apply(cntx, [( xhr.status >= 200 && (xhr.status < 300 || xhr.status === 304) )]);
         } catch (error) {
             cb.apply(cntx, [false]);
         }
    }
});
