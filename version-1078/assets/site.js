(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector('.menu-toggle');
        if (!toggle) {
            return;
        }
        toggle.addEventListener('click', function () {
            document.body.classList.toggle('menu-open');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (!slides.length || !dots.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                stop();
                show(i);
                start();
            });
        });
        start();
    }

    function setupSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('.global-search'));
        if (!inputs.length || !Array.isArray(window.MOVIE_SEARCH_DATA || MOVIE_SEARCH_DATA)) {
            return;
        }
        var data = window.MOVIE_SEARCH_DATA || MOVIE_SEARCH_DATA;
        inputs.forEach(function (input) {
            var panel = input.parentElement.querySelector('.search-panel');
            if (!panel) {
                return;
            }
            input.addEventListener('input', function () {
                var q = input.value.trim().toLowerCase();
                if (!q) {
                    panel.classList.remove('open');
                    panel.innerHTML = '';
                    return;
                }
                var results = data.filter(function (item) {
                    return [item.title, item.year, item.region, item.type, item.genre, item.category, item.oneLine].join(' ').toLowerCase().indexOf(q) !== -1;
                }).slice(0, 12);
                panel.innerHTML = results.map(function (item) {
                    return '<a class="search-result" href="' + item.url + '">' +
                        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
                        '<span><strong>' + escapeHtml(item.title) + '</strong>' +
                        '<span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span>' +
                        '<p>' + escapeHtml(item.oneLine) + '</p></span></a>';
                }).join('');
                panel.classList.toggle('open', results.length > 0);
            });
            document.addEventListener('click', function (event) {
                if (!input.parentElement.contains(event.target)) {
                    panel.classList.remove('open');
                }
            });
        });
    }

    function setupPageFilter() {
        var filter = document.querySelector('.page-filter');
        var grid = document.querySelector('.filter-grid');
        if (!filter || !grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        filter.addEventListener('input', function () {
            var q = filter.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                card.style.display = text.indexOf(q) === -1 ? 'none' : '';
            });
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPageFilter();
    });
})();

function initMoviePlayer(sourceUrl, videoId, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hlsInstance = null;
    var loaded = false;

    if (!video || !overlay || !sourceUrl) {
        return;
    }

    function load() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function play() {
        load();
        overlay.classList.add('hidden');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                overlay.classList.remove('hidden');
            });
        }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener('play', function () {
        overlay.classList.add('hidden');
    });
    video.addEventListener('ended', function () {
        overlay.classList.remove('hidden');
    });
    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
