SB.readyForPlatform('tizen', function () {
    window.HTML5Player = window.html5Player();

        HTML5Player.extend({

        _play: function (options) {
            var self = this;
            if(window.Hls && Hls.isSupported()) {
                var hls = new Hls();
                var video = this.$video_container[0];
                hls.loadSource( options.url);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED,function() {
                    if (options.resume && options.resume > 0){
                        self.seek(options.resume);
                    }
                  video.play();
              });
            } else  {
                this.$video_container.attr('src', options.url);
                if (options.resume && options.resume > 0){
                    this.seek(options.resume);
                }
                this.$video_container[0].play();
            }
        }
    });

    Player.extend({
        name: 'AVPlayer',
        usePlayerObject: true,
        ready: false,
        videoInfoReady: false,
        jumpStep: 30,
        jumpInter: null,
        inited: false,
        setVideoInfo: function(cb, url, options){
            var self = this;
            tizen.systeminfo.getPropertyValue("DISPLAY", function(e){
                if (!e) {
                    width = 0;
                    height = 0;
                } else {
                    width = e.resolutionWidth;
                    height = e.resolutionHeight;
                }
                self.videoInfo.width = width * 1;
                self.videoInfo.height = height * 1;
                self.videoInfoReady = true;
                cb.apply(self, [url, options]);
            });
        },
        _init: function () {},
        getCurrentTime: function(){
            try{
                return webapis.avplay.getCurrentTime()/1000;
            } catch (e){

            }
            return 0;
        },
        jumpForwardVideo: function(jumpSpeed) {
            clearTimeout(this.jumpInter);
            var self = this;
            self.pause();
            this.state = 'seeking';
            var jumpto = Math.floor(self.videoInfo.currentTime + jumpSpeed*self.jumpStep);
            if (self.videoInfo.duration < jumpto){
                self.trigger('killit');
                return;
            }
            self.videoInfo.currentTime = jumpto;
            var jumpfor = Math.floor(jumpto - self.getCurrentTime());

            self.trigger('update');
            self.jumpInter = setTimeout(function(me) {
                try {
                    webapis.avplay.jumpForward(jumpfor*1000, function () {
                        me.resume();
                    }, function (error) {
                    });
                } catch (e) {
                    console.log(e.message);
                }
            }, 1000, self);
        },
        /**
         * jump backward
         * @param time millisecond
         */
        jumpBackwardVideo: function(jumpSpeed) {
            clearTimeout(this.jumpInter);
            var self = this;
            self.pause();
            this.state = 'seeking';
            var jumpto = Math.floor(self.videoInfo.currentTime - jumpSpeed*self.jumpStep);
            self.videoInfo.currentTime = jumpto;
            var jumpfor = Math.floor(self.getCurrentTime() - self.videoInfo.currentTime);
            if (jumpto < 0){
                this.videoInfo.currentTime = 0;
                webapis.avplay.jumpBackward(self.getCurrentTime()*1000);
                self.resume();
                return;
            }
            self.videoInfo.currentTime = jumpto;
            self.trigger('update');
            self.jumpInter = setTimeout(function() {
                try {
                    webapis.avplay.jumpBackward(jumpfor*1000, function () {
                        self.resume();
                    }, function () {
                    });
                } catch (e) {

                }
            }, 1000, self);
        },
        OnCurrentPlayTime: function (millisec) {
            this.currentTime = millisec / 1000;
            this.state = 'play';
            this.videoInfo.currentTime = millisec / 1000;
            this.trigger('update');
        },
        updateDuration: function(){
            var duration = this.getDuration();
            duration = Math.ceil(duration / 1000);
            this.videoInfo.duration = duration;
            this.trigger('update');
        },
        getDuration: function(){
            return webapis.avplay.getDuration();
        },
        ___play: function(options){
            var self = this;
            SB.disableScreenSaver();
            if (options && options.resume > 0){
                try{
                    webapis.avplay.seekTo(options.resume*1000,
                        function(){
                            webapis.avplay.play();
                            //self.state = 'play';
                        },
                        function(){
                            $$log('ERROR: resumed');
                        });

                }catch (e){
                    console.log(e);
                }
            }else{
                try {
                    webapis.avplay.play();
                    //self.state = 'play';
                } catch (e) {
                    $$log("Current state: " + webapis.avplay.getState());
                    $$log(e);
                }
            }


        },
        play: function(options){
            //console.log('>>>>>>> play options', options)
            if (!this.inited) {
                this._init();
                this.inited = true;
            }
            if (this.state === 'seeking'){
                this.trigger('update');
                return;
            }
            if(webapis.avplay.getState() == "PAUSED" || webapis.avplay.getState() == "READY"){
                this.resume();
            } else if (options !== undefined) {
                this._play(options);
            }
        },
        __play: function(url, options){
            $('#av-cnt').show();
            this._open(url);
            this._prepare();
            this.___play(options);
        },
        _play: function(options){
            var url = options.url;
            if (!this.videoInfoReady){
                this.setVideoInfo(this.__play, url, options)
            } else {
                this.__play(url, options);
            }
        },
        _prepare: function() {
            try{
                webapis.avplay.prepare();
                var avPlayerObj = document.getElementById("av-player");
                $('#av-player').show();
                avPlayerObj.style.width = this.videoInfo.width + "px";
			    avPlayerObj.style.height = this.videoInfo.height + "px";
                webapis.avplay.setDisplayRect(avPlayerObj.offsetLeft, avPlayerObj.offsetTop, avPlayerObj.offsetWidth, avPlayerObj.offsetHeight);

                var defRatioMode = "PLAYER_DISPLAY_MODE_ZOOM_16_9";
                var currentRatio = Math.round(this.videoInfo.width/this.videoInfo.height * 100) / 100;
                if (currentRatio == Math.round(4/3 * 100) / 100){
                    defRatioMode = "PLAYER_DISPLAY_MODE_ZOOM_THREE_QUARTERS";
                }
                webapis.avplay.setDisplayMethod(defRatioMode);
                this.updateDuration();
            }
            catch(e){
                $$log("Current state: " + webapis.avplay.getState());
                $$log(e);
            }
        },

        //getTimeStr: function(){
        //  var currentdate = new Date();
        //  return currentdate.getDate() + "/"
        //        + (currentdate.getMonth()+1)  + "/"
        //        + currentdate.getFullYear() + " @ "
        //        + currentdate.getHours() + ":"
        //        + currentdate.getMinutes() + ":"
        //        + currentdate.getSeconds();
        //},
        _open: function (url) {
            var self = this;
            window.playerTizen = self;
            try{
                webapis.avplay.open(url);
                webapis.avplay.setListener({
                     onbufferingstart : function() {
                         //$$log(self.getTimeStr() + '=> onbufferingstart');
                         //console.log(self.getTimeStr() + '=> onbufferingstart');
                         self.trigger('bufferingBegin');
                    },
                    onbufferingprogress : function(percent) {
                        //$$log(percent);
                        //console.log(percent);
                        //this.updateLoading(percent);
                    },
                    onbufferingcomplete : function() {
                        if (!self.ready){
                            self.trigger('ready');
                            self.ready = true;
                        }
                        //$$log(self.getTimeStr() + '=>bufferingEnd');
                        //console.log(self.getTimeStr() + '=>bufferingEnd');
                        self.trigger('bufferingEnd');
                    },
                    oncurrentplaytime : function(currentTime) {
                        self.OnCurrentPlayTime(currentTime);
                    },
                    onevent : function(eventType, eventData) {
                    },
                    onerror : function(eventType) {
                        self.trigger('player:error', url, eventType);
                        $$log("error type : " + eventType);
                    },
                    onsubtitlechange : function(duration, text, data3, data4) {
                    },
                    ondrmevent : function(drmEvent, drmData) {
                    },
                    onstreamcompleted : function() {
                        self.trigger('complete');
                    }
                });
                this.updateDuration();
            }
            catch(e){
                $$log("Current state: " + webapis.avplay.getState());
                $$log("Exception: " + e.name);
            }
        },
        close: function(){
            this.ready = false;
            try {
                webapis.avplay.close();
            } catch (e) {
                $$log("Current state: " + webapis.avplay.getState());
                $$log(e);
            }
        },
        stop: function () {
            SB.enableScreenSaver();
            this.close();
            this.trigger('stop');
            this.state = 'stop';
            $('#av-cnt').hide();
        },
        pause: function () {
            if(webapis.avplay.getState() === "PAUSED"){
                return;
            }
            SB.enableScreenSaver();
            if(webapis.avplay.getState() === "PLAYING"){
                try {
                     webapis.avplay.pause();
                     this.trigger('pause');
                } catch (e) {
                     $$log("Current state: " + webapis.avplay.getState());
                     $$log(e.message);
                }
            }
        },
        resume: function () {
            this.___play();
            this.trigger('resume');
        }
    });


});