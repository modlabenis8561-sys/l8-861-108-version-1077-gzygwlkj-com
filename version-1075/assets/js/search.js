(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function cardTemplate(movie) {
    return '' +
      '<article class="movie-card">' +
      '  <a class="poster-link" href="video/' + encodeURIComponent(movie.id) + '.html" aria-label="观看' + escapeHtml(movie.title) + '">' +
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '    <span class="poster-mask">▶</span>' +
      '    <span class="category-pill">' + escapeHtml(movie.genre || movie.region) + '</span>' +
      '  </a>' +
      '  <div class="movie-card-body">' +
      '    <h3><a href="video/' + encodeURIComponent(movie.id) + '.html">' + escapeHtml(movie.title) + '</a></h3>' +
      '    <p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.year) + '</p>' +
      '    <p class="movie-one-line">' + escapeHtml(movie.oneLine) + '</p>' +
      '  </div>' +
      '</article>';
  }

  ready(function () {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');
    var title = document.querySelector('[data-search-title]');
    var movies = window.MOVIE_DATA || [];

    if (!form || !input || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function render(value) {
      var keyword = (value || '').trim().toLowerCase();
      var matched = movies.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(' ').toLowerCase();
        return !keyword || haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);

      results.innerHTML = matched.map(cardTemplate).join('');
      if (count) {
        count.textContent = matched.length + ' 部';
      }
      if (title) {
        title.textContent = keyword ? '搜索结果：' + value : '推荐影片';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var nextQuery = input.value.trim();
      var nextUrl = nextQuery ? 'search.html?q=' + encodeURIComponent(nextQuery) : 'search.html';
      window.history.replaceState({}, '', nextUrl);
      render(nextQuery);
    });

    input.addEventListener('input', function () {
      render(input.value);
    });

    render(query);
  });
})();
