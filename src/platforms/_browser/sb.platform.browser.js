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
        PLAY: 49,
        PAUSE: 50,
        N3: 51,
        N4: 52,
        N5: 53,
        N6: 54,
        N7: 55,
        N8: 56,
        N9: 57,
        PRECH: 45,//ins
        SMART: 36,//home
        N1: 97,//1
        STOP: 98,//numpad 2
        N2: 99,//2
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
        this.browser = this.get_browser();
        return true;
    },
    get_browser: function() {
        var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if(/trident/i.test(M[1])){
            tem=/\brv[ :]+(\d+)/g.exec(ua) || [];
            return {name:'IE',version:(tem[1]||'')};
            }
        if(M[1]==='Chrome'){
            tem=ua.match(/\bOPR|Edge\/(\d+)/)
            if(tem!=null)   {return {name:'Opera', version:tem[1]};}
            }
        M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
        if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
        return {
          name: M[0],
          version: M[1]
        };
    },
    exit: function () {
    },
    getCustomDeviceInfo: function(){

    },
    shortDevInfo: function(){
      return this.getDuid() + '|' + this.getVersion();
    },
    getDuid: function(){
      return this.browser?this.browser.name:'unknown';
    },
    getVersion: function(){
      return this.browser?this.browser.version:'unknown';
    },
    getFirmware: function(){
      return this.getVersion();
    },
    getCustomDeviceInfo: function(full){
        return "Duid:"+ this.getDuid() +';Version:' + this.getVersion() + ';Firmware:' + this.getFirmware()
               + ";ModelCode:" + this.getModelCode() + ";Model:" + this.getModel();
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
            this.DUID = 'CHROME';
        } else {
            this.DUID = 'FIREFOX';
        }
        return this.DUID;
    },
    enableNetworkCheck: function(cntx, cb, t){
        var interv = t || 500;
        this.internetCheck = setInterval(this.cyclicInternetConnectionCheck, interv, cntx, cb);
    },
    getRandomStr: function(){
        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    },
    setRelatetPlatformCSS: function(rootUrl, tema, isReplace, cb){
        var _resolutionObj = {width: 1280, height: 720};
        //var _resolutionObj = {width: 1920, height: 1080};
        var resolution = rootUrl + 'css/'+tema+'/resolution/'+_resolutionObj.width+'x'+_resolutionObj.height+'.css?' + this.getRandomStr();
        var main = rootUrl + 'css/' + tema + '/css.css?' + this.getRandomStr();
        var defaulRes = rootUrl + 'css/resolution/'+_resolutionObj.width+'x'+_resolutionObj.height+'.css?' + this.getRandomStr();
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
