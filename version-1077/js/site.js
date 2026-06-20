(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }

        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var previous = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        show(0);
        restart();
    }

    function setupFiltering() {
        var input = document.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
        var count = document.querySelector("[data-result-count]");
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));

        if (!cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var queryFromUrl = params.get("q");
        if (input && queryFromUrl) {
            input.value = queryFromUrl;
        }

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function matchesSelects(card) {
            return selects.every(function (select) {
                var key = select.getAttribute("data-filter-select");
                var wanted = normalize(select.value);
                if (!wanted || !key) {
                    return true;
                }
                return normalize(card.getAttribute("data-" + key)) === wanted;
            });
        }

        function apply() {
            var query = normalize(input ? input.value : "");
            var shown = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var visible = (!query || haystack.indexOf(query) !== -1) && matchesSelects(card);
                card.classList.toggle("is-hidden", !visible);
                if (visible) {
                    shown += 1;
                }
            });

            if (count) {
                count.textContent = String(shown);
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }

        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });

        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector("[data-play-button]");
            var status = shell.querySelector("[data-player-status]");
            var source = shell.getAttribute("data-src");
            var hlsInstance = null;
            var initialized = false;

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function loadAndPlay() {
                if (!video || !source) {
                    setStatus("播放源暂不可用");
                    return;
                }

                shell.classList.add("is-playing");
                setStatus("正在加载高清播放源...");

                if (!initialized) {
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = source;
                        initialized = true;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            setStatus("播放源加载完成");
                            video.play().catch(function () {
                                setStatus("浏览器阻止自动播放，请再次点击视频播放");
                            });
                        });
                        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                setStatus("播放源加载失败，请稍后重试");
                            }
                        });
                        initialized = true;
                    } else {
                        setStatus("当前浏览器不支持 HLS 播放");
                        return;
                    }
                }

                video.play().then(function () {
                    setStatus("正在播放");
                }).catch(function () {
                    setStatus("请再次点击视频播放");
                });
            }

            if (button) {
                button.addEventListener("click", loadAndPlay);
            }

            if (video) {
                video.addEventListener("play", function () {
                    shell.classList.add("is-playing");
                    setStatus("正在播放");
                });
                video.addEventListener("pause", function () {
                    setStatus("已暂停");
                });
                video.addEventListener("error", function () {
                    setStatus("播放出错，请检查网络或播放源");
                });
                video.addEventListener("emptied", function () {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }
                });
            }
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHeroSlider();
        setupFiltering();
        setupPlayers();
    });
})();
