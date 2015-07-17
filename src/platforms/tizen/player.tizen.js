SB.readyForPlatform('tizen', function () {
    Player.extend({
        usePlayerObject: true,
        _init: function () {

        },
        seek: function (time) {
            $$log('tizen do seek')
        },
        onEvent: function (event, arg1, arg2) {

            // alert('playerEvent: ' + event);
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
                    //this.OnBufferingProgress(arg1);
                    break;
                case 12:
                    this.OnBufferingComplete();
                    break;
                case 11:
                    this.OnBufferingStart();
                    break;
            }
        },
        OnRenderingComplete: function () {
            $$log('tizen OnRenderingComplete');
        },
        OnStreamInfoReady: function () {
            $$log('tizen OnStreamInfoReady');
        },
        OnBufferingStart: function () {
            $$log('tizen OnBufferingStart');
        },
        OnBufferingComplete: function () {
            $$log('tizen OnBufferingComplete');
        },
        OnCurrentPlayTime: function (millisec) {
            $$log('tizen OnCurrentPlayTime');
        },
        _play: function (options) {
            $$log('tizen _play');
        },
        _stop: function () {
            $$log('tizen _stop');
        },
        pause: function () {
            $$log('tizen pause');
        },
        resume: function () {
            $$log('tizen resume');
        },
        doPlugin: function () {
            $$log('tizen doPlugin');
        }
    });
});