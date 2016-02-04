define("browser.localstorage", ["sb"], function(SB){
    SB.readyForPlatform('browser', function () {
        window._localStorage = window.localStorage;
    });
    return SB;
});