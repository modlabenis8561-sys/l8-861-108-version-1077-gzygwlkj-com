(function () {
    var body = document.body;
    var navToggle = document.querySelector('[data-nav-toggle]');

    if (navToggle) {
        navToggle.addEventListener('click', function () {
            body.classList.toggle('nav-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;

        var showSlide = function (index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('hero-slide-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === activeIndex);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }
    }

    var filterInput = document.querySelector('[data-card-filter]');
    var cardList = document.querySelector('[data-card-list]');

    if (filterInput && cardList) {
        var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));
        filterInput.addEventListener('input', function () {
            var value = filterInput.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region')
                ].join(' ').toLowerCase();
                card.hidden = value !== '' && haystack.indexOf(value) === -1;
            });
        });
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

    players.forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-player-button]');
        var source = shell.getAttribute('data-video-src');
        var attached = false;

        var attachSource = function () {
            if (attached || !video || !source) {
                return;
            }
            attached = true;

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        };

        var startPlayback = function () {
            attachSource();
            if (button) {
                button.hidden = true;
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    if (button) {
                        button.hidden = false;
                    }
                });
            }
        };

        if (button && video) {
            button.addEventListener('click', startPlayback);
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                }
            });
        }
    });

    var searchResults = document.querySelector('[data-search-results]');
    var searchSummary = document.querySelector('[data-search-summary]');
    var searchInput = document.querySelector('[data-search-input]');

    if (searchResults && window.MOVIE_SEARCH_DATA) {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var data = window.MOVIE_SEARCH_DATA;

        if (searchInput) {
            searchInput.value = query;
        }

        var normalized = query.toLowerCase();
        var matches = data.filter(function (item) {
            if (!normalized) {
                return true;
            }
            return item.searchText.toLowerCase().indexOf(normalized) !== -1;
        }).slice(0, 120);

        if (searchSummary) {
            searchSummary.textContent = query ? '搜索：' + query : '输入关键词即可检索影视内容';
        }

        if (!matches.length) {
            searchResults.innerHTML = '<div class="surface-card">没有找到匹配内容</div>';
            return;
        }

        searchResults.innerHTML = matches.map(function (item) {
            return [
                '<article class="movie-card">',
                '    <a class="poster-link" href="' + item.url + '">',
                '        <img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy" />',
                '        <span class="poster-shade"></span>',
                '        <span class="poster-badge">' + escapeHtml(item.category) + '</span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
                '        <p class="movie-meta">' + escapeHtml(item.meta) + '</p>',
                '        <p class="movie-one-line">' + escapeHtml(item.desc) + '</p>',
                '        <a class="card-action" href="' + item.url + '">立即观看</a>',
                '    </div>',
                '</article>'
            ].join('');
        }).join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
})();
