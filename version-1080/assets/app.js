(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        stop();
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-card-search]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
      var activeValue = "all";
      function apply() {
        var query = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type")
          ].join(" "));
          var type = normalize(card.getAttribute("data-type"));
          var typeOk = activeValue === "all" || type === normalize(activeValue);
          var queryOk = !query || haystack.indexOf(query) !== -1;
          card.classList.toggle("is-hidden", !(typeOk && queryOk));
        });
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeValue = button.getAttribute("data-filter-value") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });
      apply();
    });
  }

  function initSearchQuery() {
    var input = document.querySelector("[data-autofocus-query]");
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var value = params.get("q");
    if (value) {
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-player-button]");
      var source = shell.getAttribute("data-play");
      var prepared = false;
      function prepare() {
        if (prepared || !video || !source) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      function play() {
        prepare();
        shell.classList.add("is-playing");
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }
      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("play", function () {
          shell.classList.add("is-playing");
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchQuery();
    initPlayers();
  });
})();
