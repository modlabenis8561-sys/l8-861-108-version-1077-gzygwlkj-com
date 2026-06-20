(function () {
    var holder = document.querySelector('[data-video-player]');

    if (!holder || typeof movieVideoUrl !== 'string' || !movieVideoUrl) {
        return;
    }

    var video = holder.querySelector('video');
    var playButton = holder.querySelector('.play-overlay');
    var status = holder.querySelector('.player-status');
    var started = false;
    var hls = null;

    function setStatus(text) {
        if (status) {
            status.textContent = text;
        }
    }

    function requestPlay() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                setStatus('点击播放器继续观看');
            });
        }
    }

    function start() {
        if (!video) {
            return;
        }

        if (started) {
            requestPlay();
            return;
        }

        started = true;

        if (playButton) {
            playButton.classList.add('is-hidden');
        }

        setStatus('');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = movieVideoUrl;
            requestPlay();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(movieVideoUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                requestPlay();
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus('播放加载失败，请稍后重试');
                }
            });
            return;
        }

        video.src = movieVideoUrl;
        requestPlay();
    }

    if (playButton) {
        playButton.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}());
