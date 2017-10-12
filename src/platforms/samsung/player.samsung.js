SB.readyForPlatform('samsung', function () {
    var curAudio = 0,
        curSubtitle = 0;


    var safeApply = function (self, method, args) {
        try {
            switch (args.length) {
                case 0:
                    return self[method]();
                case 1:
                    return self[method](args[0]);
                case 2:
                    return self[method](args[0], args[1]);
                case 3:
                    return self[method](args[0], args[1], args[2]);
                case 4:
                    return self[method](args[0], args[1], args[2], args[3]);
                case 5:
                    return self[method](args[0], args[1], args[2], args[3], args[4]);
                case 6:
                    return self[method](args[0], args[1], args[2], args[3], args[4], args[5]);
                case 7:
                    return self[method](args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
                case 8:
                    return self[method](args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);

            }
        } catch (e) {
            $$log(e);
            throw e;
        }
    }
    Player.extend({
        jumpStep: 30,
        jumpInter: null,
        usePlayerObject: true,
        error: 'none',
        inited: false,
        isInit: function(){
          return this.inited;
        },
        _init: function () {
            var self = this;
            //document.body.onload=function(){
            if (self.usePlayerObject) {
                //self.$plugin = $('<object id="pluginPlayer" border=0 classid="clsid:SAMSUNG-INFOLINK-PLAYER" style="position: absolute; left: 0; top: 0; width: 1280px; height: 720px;"></object>');
                self.plugin = document.getElementById('pluginPlayer');
                $('body').append(self.$plugin);


            } else {
                self.plugin = sf.core.sefplugin('Player');
            }


            if (!self.plugin) {
                throw new $$log('failed to set plugin');
            }

            self.plugin.OnStreamInfoReady = 'Player.OnStreamInfoReady';
            self.plugin.OnRenderingComplete = 'Player.OnRenderingComplete';
            self.plugin.OnCurrentPlayTime = 'Player.OnCurrentPlayTime';
            self.plugin.OnCurrentPlaybackTime = 'Player.OnCurrentPlayTime';
            self.plugin.OnBufferingStart = 'Player.OnBufferingStart';
            self.plugin.OnBufferingProgress = 'Player.OnBufferingProgress';
            self.plugin.OnConnectionFailed = 'Player.OnConnectionFailed';
            self.plugin.OnAuthenticationFailed = 'Player.OnAuthenticationFailed';
            self.plugin.OnStreamNotFound = 'Player.OnStreamNotFound';
            self.plugin.OnRenderError = 'Player.OnRenderError';
            self.plugin.OnNetworkDisconnected = 'Player.OnNetworkDisconnected';

            this.plugin.OnConnectionFailed = 'Player.OnConnectionFailed';
            this.plugin.OnNetworkDisconnected = 'Player.OnNetworkDisconnected';
            this.plugin.OnRenderError = 'Player.OnRenderError';

            self.plugin.OnEvent = 'Player.onEvent';
            //}

        },
        OnConnectionFailed: function(){
            $$log('ERROR: OnConnectionFailed');
            Bugsnag.notify('ERROR: OnConnectionFailed', SB.platformName);
        },
        OnNetworkDisconnected: function(){
            $$log('ERROR: OnNetworkDisconnected');
            Bugsnag.notify('ERROR: OnNetworkDisconnected', SB.platformName);
        },
        OnRenderError: function(){
            $$log('ERROR: OnRenderError');
            Bugsnag.notify('ERROR: OnRenderError', SB.platformName);
        },
        jumpForwardVideo: function(jumpSpeed) {
            clearTimeout(this.jumpInter);
            var self = this;
            if (this.state === 'playing'){
                self.pause();
            }
            this.state = 'seeking';
            var jumpto = Math.floor(self.videoInfo.currentTime + jumpSpeed*self.jumpStep);
            if (self.videoInfo.duration < jumpto){
                self.trigger('killit');
                return;
            }
            self.videoInfo.currentTime = jumpto;
            var jumpfor = Math.floor(self.videoInfo.currentTime - self.currentTime);
            self.trigger('update');
            self.jumpInter = setTimeout(function(me) {
                me.doJump.call(me, 'JumpForward', jumpfor);
            }, 1000, self);

        },
        jumpBackwardVideo: function(jumpSpeed) {
            clearTimeout(this.jumpInter);
            var self = this;
            if (this.state === 'playing'){
                self.pause();
            }

            this.state = 'seeking';
            var jumpto = Math.floor(self.videoInfo.currentTime - jumpSpeed*self.jumpStep);
            self.videoInfo.currentTime = jumpto;
            var jumpfor = Math.floor(self.currentTime - self.videoInfo.currentTime);
            if (jumpto < 0){
                this.videoInfo.currentTime = 0;
                self.doJump.call(self, 'JumpBackward', jumpfor);
                return;
            }

            self.trigger('update');
            self.jumpInter = setTimeout(function(me) {
                me.doJump.call(me, 'JumpBackward', jumpfor);
            }, 1000, self);
        },
        doJump: function(fn, jumpfor){
            this.doPlugin(fn, jumpfor);
            this.resume();
            this.trigger('update');
        },

        seekTo: function (time) {
           var self = this;

           if (time <= 0) {
               time = 0;
           }
           var jump = Math.floor(time - this.videoInfo.currentTime - 1);

           clearTimeout(this.jumpInter);

           if (jump < 0) {
               this.doJump.call(self, 'JumpBackward', -jump);
           }
           else{
             this.doJump.call(self, 'JumpForward', jump);
           }
        },
        onEvent: function (event, arg1, arg2) {

            switch (event) {
                case 9:
                    this.OnStreamInfoReady();
                    break;

                case 4:
                    //this.onError();
                    break;

                case 8:
                    this.OnRenderingComplete();
                    break;
                case 14:
                    this.OnCurrentPlayTime(arg1);
                    break;
                case 13:
                    this.OnBufferingProgress(arg1);
                    break;
                case 12:
                    this.OnBufferingComplete();
                    break;
                case 11:
                    this.OnBufferingStart();
                    break;
            }
        },
        OnBufferingProgress: function(perc){
          this.trigger('onbufferingprogress', perc);
        },
        OnRenderingComplete: function () {
            this.trigger('complete');
        },
        getDuration: function(){
          return this.videoInfo.duration;
        },
        OnStreamInfoReady: function () {
            var duration, width, height, resolution;

            try {
                duration = this.doPlugin('GetDuration');
            } catch (e) {
                alert('######## ' + e.message);
            }

            duration = Math.ceil(duration / 1000);
            //this.jumpLength = Math.floor(this.duration / 30);

            if (this.usePlayerObject) {
                width = this.doPlugin('GetVideoWidth');
                height = this.doPlugin('GetVideoHeight');
            } else {
                resolution = this.doPlugin('GetVideoResolution');
                if (resolution == -1) {
                    width = 0;
                    height = 0;
                } else {
                    var arrResolution = resolution.split('|');
                    width = arrResolution[0];
                    height = arrResolution[1];
                }
            }

            this.videoInfo.duration = duration;
            this.videoInfo.width = width * 1;
            this.videoInfo.height = height * 1;
            this.trigger('ready');
        },
        OnBufferingStart: function () {
            this.trigger('bufferingBegin');
        },
        OnBufferingComplete: function () {
            // this.trigger('ready');
            this.trigger('bufferingEnd');
        },
        getCurrentTime: function(){
            return this.currentTime || 0;
        },
        OnCurrentPlayTime: function (millisec) {
            this.currentTime = millisec / 1000;
            if (this.state === 'playing') {
                this.videoInfo.currentTime = millisec / 1000;
                this.trigger('update');
            }
        },
        OnConnectionFailed: function () {
          this.error = 'player_error';
        },

        OnAuthenticationFailed: function () {
          this.error = 'player_error';
        },

        OnStreamNotFound: function () {
          this.error = 'player_error';
        },

        OnRenderError: function () {
          this.error = 'player_error';
        },

        OnNetworkDisconnected: function () {
          this.error = 'player_error';
        },

        _error: function() {
            return this.error;
        },

        _setError: function(error) {
            this.error = error;
        },
        playPause: function(){
          if (this.state ===  'playing'){
            this.pause();
          } else if (this.state === 'paused'){
            this.resume();
          }
        },
        play: function (options) {
          var self = this;
          if (this.state === 'seeking'){
              return;
          }
          SB.disableScreenSaver();
          var url = options.url;
          // switch (options.type) {
              // case 'hls':
                  url += '|COMPONENT=HLS'
          // }
          this.doPlugin('InitPlayer', url);
          if (options.resume > 0){
              this.doPlugin('ResumePlay', url, options.resume);
              this.state = 'playing';
          } else {
              if (this.state === 'playing'){
                  this.doPlugin('Stop');
              }
              setTimeout(function(){
                self.doPlugin('InitPlayer', url);
                self.doPlugin('StartPlayback');
                if (self.state === 'paused'){
                  self.resume();
                } else {
                  self.state = 'playing';
                }
              }, 100);

          }
        },
        stop: function () {
           $$log('>>>>>>>> player STOP');
            SB.enableScreenSaver();
            this.doPlugin('Stop');
            this.trigger('stop');
            this.state = 'stop';
        },
        pause: function () {
            SB.enableScreenSaver();
            this.doPlugin('Pause');
            this.state = 'paused';
            this.trigger('pause');
        },
        resume: function () {
            SB.disableScreenSaver();
            this.doPlugin('Resume');
            this.state = 'playing';
            this.trigger('resume');
        },
        doPlugin: function () {
            var result,
                plugin = this.plugin,
                methodName = arguments[0],
                args = Array.prototype.slice.call(arguments, 1, arguments.length) || [];
            if (this.usePlayerObject) {


                result = safeApply(plugin, methodName, args);

            }
            else {
                if (methodName.indexOf('Buffer') != -1) {
                    methodName += 'Size';
                }
                args.unshift(methodName);
                result = safeApply(plugin, 'Execute', args);
            }

            return result;
        },
        audio: {
            set: function (index) {
                /*one is for audio*/
                //http://www.samsungdforum.com/SamsungDForum/ForumView/f0cd8ea6961d50c3?forumID=63d211aa024c66c9
                Player.doPlugin('SetStreamID', 1, index);
                curAudio = index;
            },
            get: function () {
                /*one is for audio*/
                var len = Player.doPlugin('GetTotalNumOfStreamID', 1);

                var result = [];
                for (var i = 0; i < len; i++) {
                    result.push(Player.doPlugin('GetStreamLanguageInfo', 1, i));
                }
                return result;
            },
            cur: function () {
                return curAudio;
            }
        },
        subtitle: {
            set: function (index) {
                Player.doPlugin('SetStreamID', 5, index);
                curSubtitle = index;
            },
            get: function () {
                var len = Player.doPlugin('GetTotalNumOfStreamID', 5);

                var result = [];
                for (var i = 0; i < len; i++) {
                    result.push(Player.doPlugin('GetStreamLanguageInfo', 5, i));
                }
                return result;
            },
            cur: function () {
                return curSubtitle;
            }
        }
    });
});
