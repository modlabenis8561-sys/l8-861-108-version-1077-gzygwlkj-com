(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileMenu.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', isOpen);
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    selectAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            var frame = image.closest('.poster-frame, .category-card, .hero-poster-card, .rank-card, .info-card');
            if (frame) {
                frame.classList.add('image-error');
            }
            image.style.opacity = '0';
        });
    });

    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    var currentSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function startHeroTimer() {
        if (slides.length > 1) {
            heroTimer = window.setInterval(nextSlide, 6500);
        }
    }

    selectAll('[data-hero-next]').forEach(function (button) {
        button.addEventListener('click', function () {
            window.clearInterval(heroTimer);
            nextSlide();
            startHeroTimer();
        });
    });

    selectAll('[data-hero-prev]').forEach(function (button) {
        button.addEventListener('click', function () {
            window.clearInterval(heroTimer);
            showSlide(currentSlide - 1);
            startHeroTimer();
        });
    });

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            window.clearInterval(heroTimer);
            showSlide(index);
            startHeroTimer();
        });
    });

    showSlide(0);
    startHeroTimer();

    var filterBar = document.querySelector('[data-filter-bar]');

    if (filterBar) {
        var keywordInput = filterBar.querySelector('[data-filter-keyword]');
        var yearSelect = filterBar.querySelector('[data-filter-year]');
        var regionSelect = filterBar.querySelector('[data-filter-region]');
        var cards = selectAll('[data-movie-card]');

        function filterCards() {
            var keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
            var year = yearSelect && yearSelect.value || '';
            var region = regionSelect && regionSelect.value || '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-genre')).toLowerCase();
                var matchedKeyword = !keyword || haystack.indexOf(keyword) >= 0;
                var matchedYear = !year || card.getAttribute('data-year') === year;
                var matchedRegion = !region || card.getAttribute('data-region').indexOf(region) >= 0;
                var visible = matchedKeyword && matchedYear && matchedRegion;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    visibleCount += 1;
                }
            });

            var empty = document.querySelector('[data-empty-state]');
            if (empty) {
                empty.style.display = visibleCount ? 'none' : 'block';
            }
        }

        [keywordInput, yearSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filterCards);
                control.addEventListener('change', filterCards);
            }
        });

        filterCards();
    }

    var searchRoot = document.querySelector('[data-search-page]');

    if (searchRoot) {
        var searchInput = searchRoot.querySelector('[data-search-input]');
        var resultGrid = searchRoot.querySelector('[data-search-results]');
        var emptyState = searchRoot.querySelector('[data-search-empty]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var movies = [];

        function movieCard(movie) {
            return [
                '<a class="movie-card" href="' + movie.url + '" data-movie-card data-title="' + escapeHtml(movie.title) + '" data-year="' + movie.year + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '" data-tags="' + escapeHtml(movie.tags.join(' ')) + '">',
                '    <div class="poster-frame" data-title="' + escapeHtml(movie.title) + '">',
                '        <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
                '        <span class="corner-badge">' + escapeHtml(movie.category) + '</span>',
                '        <span class="poster-overlay"><span class="play-symbol">▶</span></span>',
                '    </div>',
                '    <h3 class="movie-card-title">' + escapeHtml(movie.title) + '</h3>',
                '    <div class="card-meta"><span>' + movie.year + '</span><span>·</span><span>' + escapeHtml(movie.region) + '</span></div>',
                '    <p class="card-line">' + escapeHtml(movie.one_line) + '</p>',
                '</a>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function renderSearch() {
            var query = (searchInput.value || '').trim().toLowerCase();
            var filtered = movies.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.tags.join(' '), movie.one_line].join(' ').toLowerCase();
                return !query || text.indexOf(query) >= 0;
            }).slice(0, 180);

            resultGrid.innerHTML = filtered.map(movieCard).join('');
            emptyState.style.display = filtered.length ? 'none' : 'block';
        }

        if (searchInput) {
            searchInput.value = initialQuery;
            searchInput.addEventListener('input', renderSearch);
        }

        fetch('assets/data/movies.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (payload) {
                movies = payload.movies || [];
                renderSearch();
            })
            .catch(function () {
                emptyState.style.display = 'block';
            });
    }
}());
