(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isHidden = mobilePanel.hasAttribute('hidden');
      if (isHidden) {
        mobilePanel.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
      } else {
        mobilePanel.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var movieList = document.querySelector('[data-movie-list]');
  var searchInput = document.querySelector('[data-movie-search]');
  var regionSelect = document.querySelector('[data-region-filter]');
  var typeSelect = document.querySelector('[data-type-filter]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-genre-filter]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function getQueryValue() {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    } catch (error) {
      return '';
    }
  }

  if (searchInput && getQueryValue()) {
    searchInput.value = getQueryValue();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function applyFilters() {
    if (!movieList) {
      return;
    }

    var cards = Array.prototype.slice.call(movieList.querySelectorAll('.movie-card, .compact-card'));
    var keyword = normalize(searchInput ? searchInput.value : '');
    var region = regionSelect ? regionSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var genreButton = document.querySelector('[data-genre-filter].active');
    var genre = genreButton ? genreButton.getAttribute('data-genre-filter') : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year')
      ].join(' '));
      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesRegion = !region || card.getAttribute('data-region') === region;
      var matchesType = !type || card.getAttribute('data-type') === type;
      var matchesGenre = !genre || normalize(card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags')).indexOf(normalize(genre)) !== -1;
      var shouldShow = matchesKeyword && matchesRegion && matchesType && matchesGenre;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? 'none' : 'block';
    }
  }

  [searchInput, regionSelect, typeSelect].forEach(function (element) {
    if (element) {
      element.addEventListener('input', applyFilters);
      element.addEventListener('change', applyFilters);
    }
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (other) {
        other.classList.remove('active');
      });
      button.classList.add('active');
      applyFilters();
    });
  });

  applyFilters();
})();
