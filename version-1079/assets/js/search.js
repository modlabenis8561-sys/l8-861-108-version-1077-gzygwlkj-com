(function () {
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var title = document.getElementById('searchTitle');
    var data = window.SEARCH_MOVIES || [];

    if (!input || !results || !title || !data.length) {
        return;
    }

    var escapeHtml = function (value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    };

    var card = function (movie) {
        return '<article class="movie-card">' +
            '<a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="poster-shade"></span>' +
            '<span class="play-badge">▶</span>' +
            '<em>' + escapeHtml(movie.year) + '</em>' +
            '</a>' +
            '<div class="movie-card-body">' +
            '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
            '</div>' +
            '</article>';
    };

    var render = function () {
        var keyword = input.value.trim().toLowerCase();
        var items;

        if (keyword === '') {
            items = data.slice(0, 96);
            title.textContent = '精选影片';
        } else {
            items = data.filter(function (movie) {
                var content = [
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' ').toLowerCase();
                return content.indexOf(keyword) !== -1;
            }).slice(0, 120);
            title.textContent = '搜索结果';
        }

        results.innerHTML = items.map(card).join('');
    };

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;
    input.addEventListener('input', render);
    render();
})();
