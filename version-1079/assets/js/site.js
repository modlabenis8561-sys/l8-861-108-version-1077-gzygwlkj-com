(function () {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            var isOpen = panel.hasAttribute('hidden') === false;
            if (isOpen) {
                panel.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
            } else {
                panel.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
            }
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        var start = function () {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute('data-hero-dot')));
                start();
            });
        });

        start();
    }

    var localFilter = document.querySelector('[data-local-filter]');
    var filterList = document.querySelector('[data-filter-list]');
    if (localFilter && filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
        localFilter.addEventListener('input', function () {
            var keyword = localFilter.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var content = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-year') || ''
                ].join(' ').toLowerCase();
                card.hidden = keyword !== '' && content.indexOf(keyword) === -1;
            });
        });
    }
})();
