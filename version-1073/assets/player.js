(function () {
  function initializePlayer(url) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("player-overlay");
    var shell = document.getElementById("player-shell");
    var hls = null;
    var ready = false;

    if (!video || !overlay || !url) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function start() {
      prepare();
      overlay.classList.add("is-hidden");
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", start);
    if (shell) {
      shell.addEventListener("click", function (event) {
        if (event.target === video && video.paused) {
          start();
        }
      });
    }
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.currentTime || video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initializePlayer = initializePlayer;
})();
