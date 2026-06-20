(function () {
    var frame = document.querySelector('.player-frame');
    var video = document.getElementById('movieVideo');
    var overlay = document.querySelector('.player-overlay');
    var url = window.CURRENT_STREAM_URL;
    var hls = null;

    if (!frame || !video || !overlay || !url) {
        return;
    }

    var attach = function () {
        if (frame.getAttribute('data-ready') === 'true') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }

        frame.setAttribute('data-ready', 'true');
    };

    var start = function () {
        attach();
        frame.classList.add('playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                frame.classList.remove('playing');
            });
        }
    };

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        } else {
            video.pause();
        }
    });
    video.addEventListener('play', function () {
        frame.classList.add('playing');
    });
    video.addEventListener('pause', function () {
        if (!video.ended) {
            frame.classList.remove('playing');
        }
    });
    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
