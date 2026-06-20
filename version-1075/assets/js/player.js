(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var frames = document.querySelectorAll('[data-player-source]');
    frames.forEach(function (frame) {
      var video = frame.querySelector('video');
      var overlay = frame.querySelector('.player-overlay');
      var message = frame.querySelector('[data-player-message]');
      var source = frame.getAttribute('data-player-source');
      var title = frame.getAttribute('data-player-title') || '影片';
      var hlsInstance = null;

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function loadAndPlay() {
        if (!video || !source) {
          setMessage('当前页面没有可用播放源。');
          return;
        }

        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        setMessage('正在载入：' + title);

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(function () {
            setMessage('浏览器已载入播放源，请手动点击视频播放按钮。');
          });
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              setMessage('播放源已就绪，请手动点击视频播放按钮。');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('播放加载失败，请稍后重试或更换浏览器。');
            }
          });
          return;
        }

        video.src = source;
        setMessage('当前浏览器可能不支持 HLS 播放，请使用支持 m3u8 的浏览器。');
      }

      if (overlay) {
        overlay.addEventListener('click', loadAndPlay);
      }
    });
  });
})();
