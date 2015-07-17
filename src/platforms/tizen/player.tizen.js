SB.readyForPlatform('tizen', function () {
    Player.extend({
        usePlayerObject: true,
        ready: false,
        videoInfoReady: false,
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
        _init: function () {
        },
        seek: function (time) {
        },

        OnRenderingComplete: function () {
        },
        OnBufferingStart: function () {
        },
        OnBufferingComplete: function () {
        },
        OnCurrentPlayTime: function (millisec) {
            if (this.state == 'play') {
                alert(millisec / 1000);
                this.videoInfo.currentTime = millisec / 1000;
                this.trigger('update');
            }
        },
        updateDuration: function(){
            if (this.state == 'play') {
            	var duration = webapis.avplay.getDuration();
                duration = Math.ceil(duration / 1000);
	            this.videoInfo.duration = duration;
                this.trigger('update');
            }
        },
        __play: function(url){
            $('#av-cnt').show();
            this._open(url);
            this._prepare();
            try {
                webapis.avplay.play();
            } catch (e) {
                $$log("Current state: " + webapis.avplay.getState());
                $$log(e);
            }
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
                //to dos
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
                    },
                    onbufferingprogress : function(percent) {
                        //this.updateLoading(percent);
                    },
                    onbufferingcomplete : function() {
                        if (!self.ready){
                            self.trigger('ready');
                            self.ready = true;
                        }
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
                        $$log("Stream Completed");
                        //You should write stop code in onstreamcompleted.
                        self.ready = false;
                        webapis.avplay.pause();
                        webapis.avplay.seekTo(0);
                    }
                });
                //reset duration
                this.updateDuration();
            }
            catch(e){
                $$log("Current state: " + webapis.avplay.getState());
                $$log("Exception: " + e.name);
            }
        },
        _hideVideo: function() {
            console.log("Current state: " + webapis.avplay.getState());
            console.log('Hide video');
            try{
                var avcnt = $('#av-cnt');
                avcnt.hide();
                console.log("Current state: " + webapis.avplay.getState());
            }catch(e){
                console.log("Current state: " + webapis.avplay.getState());
                console.log(e);
            }
        },
        _stop: function () {
            this.ready = false;
            try {
                webapis.avplay.close();
            } catch (e) {
                $$log("Current state: " + webapis.avplay.getState());
                $$log(e);
            }
            $('#av-cnt').hide();
        },
        pause: function () {
            $$log('tizen pause');
        },
        resume: function () {
            $$log('tizen resume');
        }
    });
});