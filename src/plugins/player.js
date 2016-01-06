/**
 * Player plugin for smartbox
 */

(function (window) {

    var updateInterval, curAudio = 0;


    /**
     * emulates events after `play` method called
     * @private
     * @param self Player
     */
    var stub_play = function (self) {
        self.state = "play";
        updateInterval = setInterval(function () {
            self.trigger("update");
            self.videoInfo.currentTime += 0.5;
            if (self.videoInfo.currentTime >= self.videoInfo.duration) {
                self.trigger("complete");
            }
        }, 500);
    }

    var inited = false;

    var Player = window.Player = {
        isInit: function(){
            return inited;
        },
        name: 'base',
        /**
         * Inserts player object to DOM and do some init work
         * @examples
         * Player._init(); // run it after SB.ready
         */
        _init: function () {
            //no need to do anything because just stub
        },
        /**
         * current player state ["play", "stop", "pause"]
         */
        state: 'stop',

        getError: function (){
          return this._error();
        },

        setError: function (error){
          this._setError(error);
        },

        /**
         * Runs some video
         * @param {Object} options {url: "path", type: "hls", from: 0
         * }
         * @examples
         *
         * Player.play({
         * url: "movie.mp4"
         * }); // => runs video
         *
         * Player.play({
         * url: "movie.mp4"
         * from: 20
         * }); // => runs video from 20 second
         *
         * Player.play({
         * url: "stream.m3u8",
         * type: "hls"
         * }); // => runs stream
         */
        play: function (options) {
            if (!this.isInit()) {
                this._init();
                inited = true;
            }

            if (typeof options == "string") {
                options = {
                    url: options
                }
            }
            if (options !== undefined) {
                this.stop();
                this.state = 'play';
                this._play(options);
            } else if (options === undefined && this.state === 'pause') {
                this.resume();
            }
        },
        _play: function () {
            var self = this;

            setTimeout(function () {
                self.trigger("ready");
                setTimeout(function () {
                    self.trigger("bufferingBegin");
                    setTimeout(function () {
                        self.videoInfo.currentTime = 0;
                        self.trigger("bufferingEnd");
                        stub_play(self);
                    }, 1000);
                }, 1000);
            }, 1000);

        },
        /**
         * Stop video playback
         * @param {Boolean} silent   if flag is set, player will no trigger "stop" event
         * @examples
         *
         * Player.stop(); // stop video
         *
         * App.onDestroy(function(){
         *      Player.stop(true);
         * });  // stop player and avoid possible side effects
         */
        stop: function (silent) {
            if (this.state != 'stop') {
                this._stop();
                if (!silent) {
                    this.trigger('stop');
                }
            }
            this.state = 'stop';
        },
        /**
         * Pause playback
         * @examples
         * Player.pause(); //paused
         */
        pause: function () {
          if (this.state === 'play') {
            this._pause();
            this.state = "pause";
            this.trigger('pause');
          }
        },
        /**
         * Resume playback
         * @examples
         * Player.pause(); //resumed
         */
        resume: function () {
            stub_play(this);
            this.trigger('resume');
        },
        /**
         * Toggles pause/resume
         * @examples
         *
         * Player.togglePause(); // paused or resumed
         */
        togglePause: function () {
            if (this.state == "play") {
                this.pause();
            } else {
                this.resume();
            }
        },
        _stop: function () {
            clearInterval(updateInterval);
        },
        /**
         * Converts time in seconds to readable string in format H:MM:SS
         * @param {Number} seconds time to convert
         * @returns {String} result string
         * @examples
         * Player.formatTime(PLayer.videoInfo.duration); // => "1:30:27"
         */
        formatTime: function (seconds) {
            var hours = Math.floor(seconds / (60 * 60));
            var divisor_for_minutes = seconds % (60 * 60);
            var minutes = Math.floor(divisor_for_minutes / 60);
            var divisor_for_seconds = divisor_for_minutes % 60;
            var seconds = Math.ceil(divisor_for_seconds);
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            return (hours ? hours + ':' : '') + minutes + ":" + seconds;
        },
        /**
         * Hash contains info about current video
         */
        videoInfo: {
            /**
             * Total video duration in seconds
             */
            duration: 0,
            /**
             * Video stream width in pixels
             */
            width: 0,
            /**
             * Video stream height in pixels
             */
            height: 0,
            /**
             * Current playback time in seconds
             */
            currentTime: 0
        },

        /**
         *
         * @param {Number} seconds time to seek
         * @examples
         * Player.seek(20); // seek to 20 seconds
         */
        seek: function (seconds) {
            var self = this;
            self.videoInfo.currentTime = seconds;
            self.pause();
            self.trigger("bufferingBegin");
            setTimeout(function () {
                self.trigger("bufferingEnd");
                self.resume();
            }, 500);
        },
        /**
         * For multi audio tracks videos
         */
        audio: {
            /**
             * Set audio track index
             * @param index
             */
            set: function (index) {
                curAudio = index;
            },
            /**
             * Returns list of supported language codes
             * @returns {Array}
             */
            get: function () {
                var len = 2;
                var result = [];
                for (var i = 0; i < len; i++) {
                    result.push(0);
                }
                return result;
            },
            /**
             * @returns {Number} index of current playing audio track
             */
            cur: function () {
                return curAudio;
            },
            toggle: function () {
                var l = this.get().length;
                var cur = this.cur();
                if (l > 1) {
                    cur++;
                    if (cur >= l) {
                        cur = 0;
                    }
                    this.set(cur);
                }
            }
        },
        subtitle: {
            /**
             * Set subtitle index
             * @param index
             */
            set: function (index) {
                curSubtitle = index;
            },
            /**
             * Returns list of available subtitles
             * @returns {Array}
             */
            get: function () {
                var len = 2;
                var result = [];
                for (var i = 0; i < len; i++) {
                    result.push(0);
                }
                return result;
            },
            /**
             * @returns {Number} index of current subtitles
             */
            cur: function () {
                return curSubtitle;
            },
            toggle: function () {
                var l = Player.subtitle.get().length;
                var cur = Player.subtitle.cur();
                if (l > 1) {
                    cur++;
                    if (cur >= l) {
                        cur = 0;
                    }
                    Player.subtitle.set(cur);
                }
            },
            text: function (time) {
                var data = Player.subtitle.data,
                    index = _.sortedIndex(data, {
                        time: time
                    }, function (value) {
                        return value.time;
                    });
                if (data[index - 1]) {
                    return data[index - 1].text;
                }
                return '';
            },
            data: [
                {
                    time: 0,
                    text: ''
                }
            ],
            /**
             * Load subtitles from remote file
             * @param url
             */
            url: function (url) {
                var extension = /\.([^\.]+)$/.exec(url)[1];
                // TODO Сделать универсальное выключение вшитых субтитров
                Player.subtitle.set(undefined);
                $.ajax({
                    url: url,
                    dataType: 'text',
                    success: function (data) {
                        var $subtitiles = $('#subtitles_view');
                        $(Player).off('.subtitles');
                        Player.subtitle.init = true;
                        Player.subtitle.remote = true;
                        Player.subtitle.parse[extension].call(Player, data);
                        $subtitiles.show();
                        var setSubtitlesText = function () {
                            $('#subtitles_text').html(Player.subtitle.text(parseInt(Player.videoInfo.currentTime) * 1000));
                        }
                        Player.on('update', setSubtitlesText);

                        if (!$subtitiles.length) {
                            $('body').append('<div id="subtitles_view" style="position: absolute; z-index: 1;"><div id="subtitles_text"></div></div>');
                            $subtitiles = $('#subtitles_view');
                            $subtitiles.css({
                                width: '1280px',
                                height: '720px',
                                left: '0px',
                                top: '0px'
                            });
                            $('#subtitles_text').css({
                                'position': 'absolute',
                                'text-align': 'center',
                                'width': '100%',
                                'left': '0',
                                'bottom': '50px',
                                'font-size': '24px',
                                'color': '#fff',
                                'text-shadow': '0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000',
                                'line-height': '26px'
                            });
                        }

                        var stopSubtitlesUpdate = function () {
                            $(Player).off('update', setSubtitlesText);
                            $(Player).off('stop', stopSubtitlesUpdate);
                            $subtitiles.hide();
                        }

                        Player.on('stop', stopSubtitlesUpdate);
                    }
                });
            },
            parse: {
                smi: function (data) {
                    data = data.split(/\s*<sync/i);
                    data.shift();
                    Player.subtitle.data = _.map(data, function (value) {
                        var match = /[\s\S]*start=(\d+)[\s\S]*<p[^>]*>([\s\S]*)<spanid/i.exec(value);
                        if (match) {
                            return {
                                time: parseInt(match[1], 10),
                                text: match[2]
                            };
                        }
                    });
                },
                srt: function (data) {
                    data = data.split('\r\n\r\n');
                    var self = Player.subtitle;

                    self.data = [];
                    var parseTime = function (time) {
                        var matches = time.match(/(\d{2}):(\d{2}):(\d{2}),(\d+)/);
                        return parseInt(matches[1], 10) * 3600000 +
                            parseInt(matches[2], 10) * 60000 +
                            parseInt(matches[3], 10) * 1000 +
                            parseInt(matches[4], 10);
                    };

                    _.each(data, function (value) {
                        if (!value) {
                            return;
                        }
                        var rows = value.split('\n');

                        var timeRow = rows[1].split(' --> '),
                            timeStart, timeEnd, text;
                        rows.splice(0, 2);
                        timeStart = parseTime(timeRow[0]);
                        timeEnd = parseTime(timeRow[1]);

                        self.data.push({
                            time: timeStart,
                            text: rows.join('<br/>')
                        });
                        self.data.push({
                            time: timeEnd,
                            text: ''
                        });
                    });
                    self.data.unshift({
                        time: 0,
                        text: ''
                    });
                }
            }
        }
    };


    var extendFunction, eventProto, cloneFunction;
    //use underscore, or jQuery extend function
    if (window._ && _.extend) {
        extendFunction = _.extend;
        cloneFunction = _.clone;
    } else if (window.$ && $.extend) {
        extendFunction = $.extend;
        cloneFunction = $.clone;
    }


    if (window.EventEmitter) {
        eventProto = EventEmitter.prototype;
    } else if (window.Backbone) {
        eventProto = Backbone.Events;
    } else if (window.Events) {
        eventProto = Events.prototype;
    }

    Player.extend = function (proto) {
        extendFunction(this, proto);
    };

    Player.extend(eventProto);

    window.html5Player = function () {
        var plClone = cloneFunction(Player);
        var playerObj = extendFunction(plClone, {
             multiplyBy: 0,
            jumpStep: 10,
            jumpInter: null,
            name: 'html5',
            _init: function () {
                var self = this;
                var ww = '100%';
                var wh = '100%';


                this.$video_container = $('<video id="smart_player" style="position: absolute; left: 0; top: 0;width: ' + ww + '; height: ' + wh + ';"></video>');
                var video = this.$video_container[0];
                $('body').append(this.$video_container);

                this.$video_container.on('loadedmetadata', function () {
                    self.videoInfo.width = video.videoWidth;
                    self.videoInfo.height = video.videoHeight;
                    self.videoInfo.duration = video.duration;
                    self.trigger('ready');
                });


                this.$video_container.on('loadstart',function (e) {
                    self.trigger('bufferingBegin');
                }).on('playing',function () {
                        self.trigger('bufferingEnd');
                    }).on('timeupdate',function () {
                        if (self.state == 'play' && self.multiplyBy === 0) {
                            self.videoInfo.currentTime = video.currentTime;
                            self.trigger('update');
                        }
                    }).on('ended', function () {
                        self.state = "stop";
                        self.trigger('complete');
                    });
                self.mediaSource = new window.MediaSource();
                self.mediaSource.addEventListener('sourceopen', _onSourceOpen);
                this.$video_container.attr('src', URL.createObjectURL(self.mediaSource));

                function _onSourceOpen() {
                    self.sourceBuffer = self.mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64000d,mp4a.40.2"');
                }

                function _onFragmentDataLoad(data) {
                    self.sourceBuffer.appendBuffer(data);
                }
                this.$video_container.on('abort canplay canplaythrough canplaythrough durationchange emptied ended error loadeddata loadedmetadata loadstart mozaudioavailable pause play playing ratechange seeked seeking suspend volumechange waiting', function (e) {
                    //console.log(e.type);
                });

                /*
                 abort 	Sent when playback is aborted; for example, if the media is playing and is restarted from the beginning, this event is sent.
                 canplay 	Sent when enough data is available that the media can be played, at least for a couple of frames.  This corresponds to the CAN_PLAY readyState.
                 canplaythrough 	Sent when the ready state changes to CAN_PLAY_THROUGH, indicating that the entire media can be played without interruption, assuming the download rate remains at least at the current level. Note: Manually setting the currentTime will eventually fire a canplaythrough event in firefox. Other browsers might not fire this event.
                 durationchange 	The metadata has loaded or changed, indicating a change in duration of the media.  This is sent, for example, when the media has loaded enough that the duration is known.
                 emptied 	The media has become empty; for example, this event is sent if the media has already been loaded (or partially loaded), and the load() method is called to reload it.
                 ended 	Sent when playback completes.
                 error 	Sent when an error occurs.  The element's error attribute contains more information. See Error handling for details.
                 loadeddata 	The first frame of the media has finished loading.
                 loadedmetadata 	The media's metadata has finished loading; all attributes now contain as much useful information as they're going to.
                 loadstart 	Sent when loading of the media begins.
                 mozaudioavailable 	Sent when an audio buffer is provided to the audio layer for processing; the buffer contains raw audio samples that may or may not already have been played by the time you receive the event.
                 pause 	Sent when playback is paused.
                 play 	Sent when playback of the media starts after having been paused; that is, when playback is resumed after a prior pause event.
                 playing 	Sent when the media begins to play (either for the first time, after having been paused, or after ending and then restarting).
                 progress 	Sent periodically to inform interested parties of progress downloading the media. Information about the current amount of the media that has been downloaded is available in the media element's buffered attribute.
                 ratechange 	Sent when the playback speed changes.
                 seeked 	Sent when a seek operation completes.
                 seeking 	Sent when a seek operation begins.
                 suspend 	Sent when loading of the media is suspended; this may happen either because the download has completed or because it has been paused for any other reason.
                 timeupdate 	The time indicated by the element's currentTime attribute has changed.
                 volumechange 	Sent when the audio volume changes (both when the volume is set and when the muted attribute is changed).
                 waiting 	Sent when the requested operation (such as playback) is delayed pending the completion of another operation (such as a seek).
                 */
            },
            isInit: function(){
                return $('#smart_player').length > 0;
            },
            _play: function (options) {
                this.$video_container.attr('src', options.url);
                if (options.resume && options.resume > 0){
                    this.seek(options.resume);
                }
                this.$video_container[0].play();
            },
            _stop: function () {
                console.log('>>>>>>> _stop base');
                this.$video_container[0].pause();
                this.$video_container[0].src = '';
            },
            pause: function () {
                this.$video_container[0].pause();
                this.state = "pause";
                this.trigger('pause');
            },
            resume: function () {
                this.$video_container[0].play();
                this.state = "play";
                this.trigger('resume');
            },
            jumpBackwardVideo: function(){
                clearTimeout(this.jumpInter);
                this.pause();

                var t = this.jumpStep;
                var jump = Math.floor(this.videoInfo.currentTime - t);
                if (this.videoInfo.currentTime < 0){
                    return;
                }
                this.seek(jump);
            },
            jumpForwardVideo: function () {
                clearTimeout(this.jumpInter);
                this.pause();

                var jump = Math.floor(this.videoInfo.currentTime + this.jumpStep);
                this.seek(jump);
            },
            seek: function(jump){
                var self = this;
                self.videoInfo.currentTime = jump;
                self.trigger('update');
                self.multiplyBy += 1;
                self.jumpInter = setTimeout(function(self) {

                    try {
                        self.$video_container[0].currentTime = self.videoInfo.currentTime;
                        self.resume();
                        self.multiplyBy = 0;
                    } catch (e) {
                        self.multiplyBy = 0;
                    }
                }, 1000, self);
            },
            audio: {
                //https://bugzilla.mozilla.org/show_bug.cgi?id=744896
                set: function (index) {

                },
                get: function () {
                    return [];
                },
                cur: function () {
                    return 0;
                }
            },
            subtitle: {
                set: function (index) {
                    if (Player.$video_container[0].textTracks) {
                        var subtitles = _.filter(Player.$video_container[0].textTracks, function (i) {
                            return i.kind === 'subtitles';
                        });
                        if (subtitles.length) {
                            _.each(subtitles, function (self, i) {
                                if (self.mode === "showing") {
                                    self.mode = "disabled";
                                }
                                else if (i == index) {
                                    self.mode = "showing";
                                }
                            });
                            return true;
                        }
                    }
                    return false;
                },
                get: function () {
                    if (Player.$video_container[0].textTracks) {
                        var subtitles = _.filter(Player.$video_container[0].textTracks, function (i) {
                            return i.kind === 'subtitles';
                        });
                        if (subtitles.length) {
                            return _.map(subtitles, function (self) {
                                return {index: subtitles.indexOf(self), language: self.language};
                            });
                        }
                    }
                    return false;
                },
                cur: function () {
                    var cur = -1;
                    if (Player.$video_container[0].textTracks) {
                        var subtitles = _.filter(Player.$video_container[0].textTracks, function (i) {
                            return i.kind === 'subtitles';
                        });
                        if (subtitles.length) {
                            _.each(subtitles, function (self, i) {
                                if (self.mode === "showing") {
                                    cur = i;
                                    return false;
                                }
                            });
                        }
                    }
                    return cur;
                },
                toggle: function () {
                    var l = Player.subtitle.get().length;
                    var cur = Player.subtitle.cur();
                    if (l > 1) {
                        cur++;
                        if (cur >= l) {
                            cur = -1;
                        }
                        Player.subtitle.set(cur);
                    }
                }
            }
        });
        return playerObj;
    }
}(this));