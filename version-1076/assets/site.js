(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    if (toggle) {
        toggle.addEventListener('click', function () {
            document.body.classList.toggle('nav-open');
        });
    }

    var navSearch = document.querySelector('[data-nav-search]');
    if (navSearch) {
        navSearch.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = navSearch.querySelector('input');
            var value = input ? input.value.trim() : '';
            var url = 'search.html';
            if (navSearch.getAttribute('data-depth') === 'inner') {
                url = '../search.html';
            }
            if (value) {
                url += '?q=' + encodeURIComponent(value);
            }
            window.location.href = url;
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-tab]'));
    if (slides.length && tabs.length) {
        var current = 0;
        var activate = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            tabs.forEach(function (tab, tabIndex) {
                tab.classList.toggle('is-active', tabIndex === index);
            });
        };
        tabs.forEach(function (tab, index) {
            tab.addEventListener('click', function () {
                activate(index);
            });
        });
        window.setInterval(function () {
            activate((current + 1) % slides.length);
        }, 5200);
    }
})();

function prepareMoviePlayer(videoId, source, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var attached = false;
    var hlsInstance = null;

    if (!video) {
        return;
    }

    function attachSource() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function startPlayback() {
        attachSource();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}

function initSearchPage() {
    var grid = document.getElementById('searchGrid');
    if (!grid || typeof MOVIE_INDEX === 'undefined') {
        return;
    }

    var keyword = document.getElementById('filterKeyword');
    var region = document.getElementById('filterRegion');
    var type = document.getElementById('filterType');
    var year = document.getElementById('filterYear');
    var title = document.getElementById('searchResultTitle');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';

    if (keyword && q) {
        keyword.value = q;
    }

    function card(movie) {
        return [
            '<a class="movie-card" href="' + movie.url + '">',
            '    <div class="poster">',
            '        <span class="poster-badge">' + movie.year + '</span>',
            '        <img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '">',
            '        <span class="poster-type">' + escapeHtml(movie.type) + '</span>',
            '        <div class="poster-overlay"><span class="play-dot">▶</span></div>',
            '    </div>',
            '    <h2 class="movie-title">' + escapeHtml(movie.title) + '</h2>',
            '    <p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>',
            '</a>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function render() {
        var k = keyword ? keyword.value.trim().toLowerCase() : '';
        var r = region ? region.value : '';
        var t = type ? type.value : '';
        var y = year ? year.value : '';
        var result = MOVIE_INDEX.filter(function (movie) {
            var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
            return (!k || text.indexOf(k) !== -1) &&
                (!r || movie.region === r) &&
                (!t || movie.type === t) &&
                (!y || movie.year === y);
        });
        var visible = result.slice(0, 240);
        grid.innerHTML = visible.length ? visible.map(card).join('') : '<div class="empty-state">没有找到匹配影片</div>';
        if (title) {
            title.textContent = result.length ? '为你匹配到相关影片' : '换个关键词继续发现影片';
        }
    }

    [keyword, region, type, year].forEach(function (item) {
        if (item) {
            item.addEventListener('input', render);
            item.addEventListener('change', render);
        }
    });

    render();
}
