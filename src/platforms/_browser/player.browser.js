SB.readyForPlatform('browser', function(){
    var player = Session.get('playerplugin');
    if (true){
     //(true){
      Player.extend({
        initialized: false,
        isInit: function(){
            return this.initialized;
        },
        _init: function(){
          var self = this;

          App.loadJS(Settings.rootUrl + 'cdn/js/lib/video.js', function () {
            App.State.set({'videojs': "success"});
            videojs("smart_player", {}, function(){
              self.$vid_obj = videojs("smart_player");
              self.$vid_obj.on('loadeddata', function(){
                  self.state = 'playing';
                  // self.show();
                  self.trigger('ready');
                  self.updateDuration();
              });

              self.$vid_obj.on('timeupdate', function(){
                self.state = 'play';
                self.videoInfo.currentTime = this.currentTime();
                self.trigger('update');
              });
              self.$vid_obj.on('ended', function(){
                self.trigger('complete');
              });

              // setInterval(function(){
              //   console.log(self.$vid_obj.bufferedPercent());
              // }, 100);


            });
          });
          this.initialized = true;
        },
        paused: function(){
          return this.$vid_obj.paused();
        },
        resume: function(){
          if (this.paused()){
            this.$vid_obj.play();
            this.state = 'playing'
            this.trigger('resume');
          }
        },
        playPause: function(){
          if (this.paused()){
            this.resume();
          } else {
            this.pause();
          }
        },
        getDuration: function(){
          return this.$vid_obj.duration();
        },
        seekTo: function(_toSec){
          this.resume();
          this.$vid_obj.currentTime(_toSec);
        },
        getCurrentTime: function(){
          return this.$vid_obj.currentTime();
        },
        getState: function(){
          if (this.paused()){
            this.state = 'paused';
            return this.state
          }
          return this.state;
        },
        pause: function(){
          if (!this.paused()){
            this.$vid_obj.pause();
            this.trigger('pause');
          }
        },
        play: function(streamObj){
            this.state = 'waiting';
            this.$vid_obj.src([{type: "application/x-mpegURL", src:streamObj.url}]);
            this.$vid_obj.play();
        },
        stop: function(){
          if (this.state === 'waiting'){
            return;
          }
          this.$vid_obj.pause();
          this.trigger('stop');
        },
        updateDuration: function(){
            var duration = this.getDuration();
            this.videoInfo.duration = duration;
            this.trigger('update');
        },
      });
    }
    else {
      Player.extend({
        initialized: false,
        isInit: function(){
            return this.initialized;
        },
        _init: function(){
          var self = this;

          App.loadJS(Settings.rootUrl + 'cdn/js/lib/jwplayer.js', function () {
            jwplayer.key="GG9AVO9zDsfRP2cih914AACaVj2Q+R/zfE9x35eLJbk=";
            if (App.State){
                App.State.set({'videojs': "success"});
            }
           self.initialized = true;
          });
        },
        getState: function(){
          return jwplayer('smart_player').getState();
        },
        paused: function(){
          return this.getState() === 'paused';
        },
        resume: function(){
          if (this.paused()){
            this.player.play();
            this.trigger('resume');
          }
        },
        getDuration: function(){
          var _dur = jwplayer('smart_player').getDuration();
          return _dur;
        },
        seekTo: function(_toSec){
          this.pause();
          this.player.seek(_toSec);
          this.resume();
        },
        getCurrentTime: function(){
          var _pos = jwplayer('smart_player').getPosition();
          return _pos;
        },
        pause: function(){
          if (!this.paused()){
            this.player.pause();
            this.state = 'paused'
            this.trigger('pause');
          }
          else {
            this.resume();
          }
        },
        play: function(streamObj){
            var self = this;
            this.state = 'waiting';
            self.player = jwplayer('smart_player').setup ({
                file: streamObj.url,
                autostart: true,
                width: "100%",
                height: "100%"
            });

            self.player.on('play', function(){
               this.setMute(false);
               self.state = 'playing';
               // self.show();
               self.trigger('ready');
            });
            // self.player.on('loadeddata', function(){
            //
            // });
        },
        stop: function(){
          if (this.state === 'waiting'){
            return;
          }
          this.player.pause();
          // this.$vid_obj.src({});
          this.trigger('stop');
        }
      });
  }
});
