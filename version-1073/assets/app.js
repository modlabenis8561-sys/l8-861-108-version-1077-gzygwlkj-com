(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var toggle = qs("[data-menu-toggle]");
    var nav = qs("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = qs("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = qsa(".hero-slide", root);
    var dots = qsa("[data-hero-dot]", root);
    var prev = qs("[data-hero-prev]", root);
    var next = qs("[data-hero-next]", root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function initFilterPages() {
    qsa("[data-filter-page]").forEach(function (panel) {
      var input = qs("[data-filter-input]", panel);
      var select = qs("[data-sort-select]", panel);
      var grid = qs("[data-card-grid]", panel);
      if (!grid) {
        return;
      }
      var cards = qsa(".movie-card", grid);

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = cards.filter(function (card) {
          var hay = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var matched = !query || hay.indexOf(query) !== -1;
          card.classList.toggle("is-hidden", !matched);
          return matched;
        });
        var sort = select ? select.value : "default";
        if (sort !== "default") {
          visible.sort(function (a, b) {
            if (sort === "year-desc" || sort === "year-asc") {
              var ay = Number(a.getAttribute("data-year").replace(/\D/g, "")) || 0;
              var by = Number(b.getAttribute("data-year").replace(/\D/g, "")) || 0;
              return sort === "year-desc" ? by - ay : ay - by;
            }
            return a.getAttribute("data-title").localeCompare(b.getAttribute("data-title"), "zh-Hans-CN");
          });
          visible.forEach(function (card) {
            grid.appendChild(card);
          });
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<a class=\"movie-card\" href=\"" + escapeHtml(movie.url) + "\" data-title=\"" + escapeHtml(movie.title) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-tags=\"" + escapeHtml((movie.tags || []).join(" ")) + "\">" +
      "<span class=\"movie-poster\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"poster-shade\"></span><span class=\"movie-year\">" + escapeHtml(movie.year) + "</span><span class=\"play-chip\">▶</span></span>" +
      "<span class=\"movie-card-body\"><strong>" + escapeHtml(movie.title) + "</strong><em>" + escapeHtml(movie.oneLine) + "</em><span class=\"movie-card-meta\"><b>" + escapeHtml(movie.region) + "</b><i>" + escapeHtml(movie.type) + "</i></span><span class=\"movie-card-tags\">" + tags + "</span></span></a>";
  }

  function initSearch() {
    var form = qs("[data-search-form]");
    var input = qs("[data-search-input]");
    var results = qs("[data-search-results]");
    var title = qs("[data-search-title]");
    var kicker = qs("[data-search-kicker]");
    if (!form || !input || !results) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;

    function render(value) {
      var key = value.trim().toLowerCase();
      var movies = window.SITE_MOVIES || [];
      var list = key ? movies.filter(function (movie) {
        return [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.category,
          movie.oneLine,
          (movie.tags || []).join(" ")
        ].join(" ").toLowerCase().indexOf(key) !== -1;
      }) : movies.slice(0, 24);
      if (title) {
        title.textContent = key ? "搜索结果" : "热门推荐";
      }
      if (kicker) {
        kicker.textContent = key ? "Search Results" : "Recommendation";
      }
      if (!list.length) {
        results.innerHTML = "<div class=\"empty-state\"><h2>未找到相关内容</h2><p>请尝试更换关键词或浏览分类片库。</p></div>";
        return;
      }
      results.innerHTML = list.slice(0, 120).map(movieCard).join("");
    }

    render(query);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var nextQuery = input.value.trim();
      var url = nextQuery ? "search.html?q=" + encodeURIComponent(nextQuery) : "search.html";
      window.history.pushState(null, "", url);
      render(nextQuery);
    });
  }

  function initRankTabs() {
    var root = qs("[data-rank-tabs]");
    if (!root) {
      return;
    }
    var buttons = qsa("[data-tab-button]", root);
    var panels = qsa("[data-tab-panel]", root);
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var name = button.getAttribute("data-tab-button");
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        panels.forEach(function (panel) {
          panel.classList.toggle("is-active", panel.getAttribute("data-tab-panel") === name);
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilterPages();
    initSearch();
    initRankTabs();
  });
})();
