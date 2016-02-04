
define("browser.player", ["sb", "player", 'hls'], function(SB, _Player, Hls){
    SB.readyForPlatform('browser', function(){
        window.Player = window.html5Player();

        window.Player.extend({
            hls: null,
            _play: function (options) {
                var self = this;
                if(Hls && Hls.isSupported()) {
                    this.hls = new Hls();
                    window._hls = this.hls;
                    var video = this.$video_container[0];
                    this.hls.loadSource( options.url);
                    this.hls.attachMedia(video);
                    this.hls.on(Hls.Events.MANIFEST_PARSED,function() {
                        if (options.resume && options.resume > 0){
                            self.seek(options.resume);
                            return;
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
            },
            _stop: function () {
                if(Hls.isSupported() && this.hls){
                    this.hls.destroy();
                } else {
                    this.$video_container[0].pause();
                    this.$video_container[0].src = '';
                }
            }
        });
    });
    return Player;
});
