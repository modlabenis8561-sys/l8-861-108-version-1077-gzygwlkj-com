(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        var open = mobileNav.classList.toggle('is-open');
        menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    initHeroCarousel();
    initFilterToolbar();
  });

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilterToolbar() {
    var toolbar = document.querySelector('[data-filter-toolbar]');
    var list = document.querySelector('[data-filter-list]');
    if (!toolbar || !list) {
      return;
    }

    var keywordInput = toolbar.querySelector('[data-filter-keyword]');
    var yearSelect = toolbar.querySelector('[data-filter-year]');
    var sortSelect = toolbar.querySelector('[data-filter-sort]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    var years = cards
      .map(function (card) { return card.getAttribute('data-year') || ''; })
      .filter(Boolean)
      .filter(function (value, index, array) { return array.indexOf(value) === index; })
      .sort(function (a, b) { return b.localeCompare(a, 'zh-Hans-CN'); });

    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });

    function apply() {
      var keyword = (keywordInput.value || '').trim().toLowerCase();
      var year = yearSelect.value;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || card.getAttribute('data-year') === year;
        card.classList.toggle('hidden-by-filter', !(matchedKeyword && matchedYear));
      });

      var sorted = cards.slice();
      if (sortSelect.value === 'year-desc') {
        sorted.sort(function (a, b) {
          return (b.getAttribute('data-year') || '').localeCompare(a.getAttribute('data-year') || '');
        });
      }
      if (sortSelect.value === 'title-asc') {
        sorted.sort(function (a, b) {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        });
      }
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    keywordInput.addEventListener('input', apply);
    yearSelect.addEventListener('change', apply);
    sortSelect.addEventListener('change', apply);
  }
})();
