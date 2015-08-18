SB.readyForPlatform('tizen', function () {
    Player.extend({
        usePlayerObject: true,
        ready: false,
        videoInfoReady: false,
        multiplyBy: 0,
        inited: false,
        setVideoInfo: function(cb, url){
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
                cb.apply(self, [url]);
            });
        },
        _init: function () {},
        jumpForwardVideo: function() {
            var self = this;
            var t = 10;
            var jump = Math.floor(self.videoInfo.currentTime + t);

            self.videoInfo.currentTime = jump;
            self.trigger('update');
            self.multiplyBy += 1;
            self.jumpInter = setTimeout(function(self) {

                try {
                    var j = self.multiplyBy * 10 * 1000;
                    webapis.avplay.jumpForward(j, function () {
                        self.multiplyBy = 0;
                    }, function () {
                        self.multiplyBy = 0;
                    });
                } catch (e) {
                    self.multiplyBy = 0;
                }
            }, 1000, self);
        },
        /**
         * jump backward
         * @param time millisecond
         */
        jumpBackwardVideo: function() {
            var self = this;
            self.multiplyBy += 1;

            var t = 10;
            var jump = Math.floor(self.videoInfo.currentTime - t);
            self.videoInfo.currentTime = jump;
            self.trigger('update');
            self.jumpInter = setTimeout(function() {
                var j = self.multiplyBy * 10 * 1000;
                try {
                    webapis.avplay.jumpBackward(j, function () {
                        self.multiplyBy = 0;
                    }, function () {
                        self.multiplyBy = 0;
                    });
                } catch (e) {
                    self.multiplyBy = 0;
                }
            }, 1000, self);
        },
        seek: function (time) {
            if (time <= 0) {
                time = 0;
            }
            var jump = Math.floor(time - this.videoInfo.currentTime - 1);

            clearTimeout(this.jumpInter);

            if (jump < 0) {
                this.jumpBackwardVideo();
            }
            else{
                this.jumpForwardVideo();
            }
        },
        OnCurrentPlayTime: function (millisec) {
            if (this.multiplyBy > 0){
                return;
            }
            this.videoInfo.currentTime = millisec / 1000;
            this.trigger('update');

        },
        updateDuration: function(){
            var duration = webapis.avplay.getDuration();
            duration = Math.ceil(duration / 1000);
            this.videoInfo.duration = duration;
            this.trigger('update');
        },
        ___play: function(){
            try {
                webapis.avplay.play();
            } catch (e) {
                $$log("Current state: " + webapis.avplay.getState());
                $$log(e);
            }
        },
        play: function(options){
            if (!this.inited) {
                this._init();
                this.inited = true;
            }

            if(webapis.avplay.getState() == "PAUSED" || webapis.avplay.getState() == "READY"){
                this.resume();
            } else if (options !== undefined) {
                this.state = 'play';
                this._play(options);
            }
        },
        __play: function(url){
            $('#av-cnt').show();
            this._open(url);
            this._prepare();
            this.___play();
        },
        _play: function(options){
            var url = options.url;
            if (!this.videoInfoReady){
                this.setVideoInfo(this.__play, url)
            } else {
                this.__play(url);
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
                this.updateDuration();
            }
            catch(e){
                $$log("Current state: " + webapis.avplay.getState());
                $$log(e);
            }
        },

        _open: function (url) {
            var self = this;
            try{
                webapis.avplay.open(url);
                webapis.avplay.setListener({
                     onbufferingstart : function() {
                         self.trigger('bufferingBegin');
                    },
                    onbufferingprogress : function(percent) {
                        //this.updateLoading(percent);
                    },
                    onbufferingcomplete : function() {
                        if (!self.ready){
                            self.trigger('ready');
                            self.ready = true;
                        }
                        self.trigger('bufferingEnd');
                    },
                    oncurrentplaytime : function(currentTime) {
                        self.OnCurrentPlayTime(currentTime);
                    },
                    onevent : function(eventType, eventData) {
                    },
                    onerror : function(eventType) {
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
        stop: function () {
            this.ready = false;
            try {
                webapis.avplay.close();
            } catch (e) {
                $$log("Current state: " + webapis.avplay.getState());
                $$log(e);
            }
            this.trigger('stop');
            this.state = 'stop';
            $('#av-cnt').hide();
        },
        pause: function () {
            if(webapis.avplay.getState() == "PLAYING"){
                try {
                     webapis.avplay.pause();
                     this.trigger('pause');
                } catch (e) {
                     $$log("Current state: " + webapis.avplay.getState());
                     $$log(e);
                }
            }
        },
        resume: function () {
            this.___play();
            this.trigger('resume');
        }
    });
});