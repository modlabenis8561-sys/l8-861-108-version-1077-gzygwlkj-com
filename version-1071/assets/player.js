(function () {
  window.initMoviePlayer = function (config) {
    var video = document.querySelector(config.selector);
    var overlay = document.querySelector(config.overlay);
    var button = document.querySelector(config.button);
    var loaded = false;
    var hls = null;

    if (!video) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(config.source);
        hls.attachMedia(video);
      } else {
        video.src = config.source;
      }
    }

    function playVideo() {
      loadVideo();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', function () {
        playVideo();
      });
    }

    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
