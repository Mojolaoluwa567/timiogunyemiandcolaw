/* ==========================================================================
   Articles feed — reads assets/data/articles.json and renders:
   - filter tabs (auto-generated from the tags actually present in the data)
   - the article card feed, filterable by tag
   - the sidebar's "Browse by Practice Area" tag list
   - the sidebar's "Editor's Picks" (any article with "featured": true)

   Adding a new article to articles.json (via the admin panel or by hand)
   is all that's needed — nothing here needs to change.
   ========================================================================== */
(function () {
  const DATA_URL = "assets/data/articles.json";

  const feedEl = document.getElementById("articlesFeed");
  const emptyEl = document.getElementById("articlesEmpty");
  const tabsEl = document.getElementById("filterTabs");
  const sidebarTagsEl = document.getElementById("sidebarTags");
  const sidebarPicksEl = document.getElementById("sidebarPicks");

  // Not every page that loads this script needs every element (e.g. a future
  // "related articles" widget elsewhere) — bail only if the core feed is missing.
  if (!feedEl) return;

  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function cardHTML(article) {
    const href = `article.html?slug=${encodeURIComponent(article.slug)}`;
    return `
      <article class="article-card" data-scroll data-tag="${article.tag}">
        <a href="${href}" class="article-card-media">
          <img src="${article.cover}" alt="" />
        </a>
        <div class="article-card-body">
          <span class="article-tag">${article.tag}</span>
          <h3><a href="${href}">${article.title}</a></h3>
          <p>${article.excerpt}</p>
          <div class="article-meta">
            <span>By ${article.author}</span>
            <span class="dot">•</span>
            <span>${article.readTime}</span>
          </div>
        </div>
      </article>`;
  }

  function pickHTML(article) {
    const href = `article.html?slug=${encodeURIComponent(article.slug)}`;
    return `
      <a href="${href}" class="sidebar-pick">
        <img src="${article.cover}" alt="" />
        <div>
          <span class="pick-tag">${article.tag}</span>
          <span class="pick-title">${article.title}</span>
        </div>
      </a>`;
  }

  function renderFeed(articles, activeTag) {
    const filtered =
      activeTag === "all" ? articles : articles.filter((a) => a.tag === activeTag);

    feedEl.innerHTML = filtered.map(cardHTML).join("");

    if (emptyEl) emptyEl.style.display = filtered.length ? "none" : "block";
    if (filtered.length === 0 && emptyEl) feedEl.appendChild(emptyEl);
  }

  function wireTabs(articles) {
    if (!tabsEl) return;
    const tags = Array.from(new Set(articles.map((a) => a.tag)));

    tabsEl.innerHTML =
      `<a href="#" class="filter-tab active" data-tag="all">All</a>` +
      tags
        .map((tag) => `<a href="#" class="filter-tab" data-tag="${tag}">${tag}</a>`)
        .join("");

    tabsEl.addEventListener("click", (e) => {
      const tab = e.target.closest(".filter-tab");
      if (!tab) return;
      e.preventDefault();
      tabsEl.querySelectorAll(".filter-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderFeed(articles, tab.dataset.tag);
    });
  }

  function renderSidebarTags(articles) {
    if (!sidebarTagsEl) return;
    const tags = Array.from(new Set(articles.map((a) => a.tag)));
    sidebarTagsEl.innerHTML = tags
      .map((tag) => `<a href="#" class="sidebar-tag" data-tag="${tag}">${tag}</a>`)
      .join("");

    sidebarTagsEl.addEventListener("click", (e) => {
      const link = e.target.closest(".sidebar-tag");
      if (!link) return;
      e.preventDefault();
      const targetTab = tabsEl && tabsEl.querySelector(`[data-tag="${CSS.escape(link.dataset.tag)}"]`);
      if (targetTab) {
        targetTab.click();
        tabsEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  function renderPicks(articles) {
    if (!sidebarPicksEl) return;
    const picks = articles.filter((a) => a.featured).slice(0, 3);
    // Fall back to the 3 most recent articles if nothing is marked featured yet.
    const list = picks.length ? picks : articles.slice(0, 3);
    sidebarPicksEl.innerHTML = list.map(pickHTML).join("");
  }

  fetch(DATA_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${DATA_URL}: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      const articles = data.articles || [];
      // Newest first
      articles.sort((a, b) => new Date(b.date) - new Date(a.date));

      renderFeed(articles, "all");
      wireTabs(articles);
      renderSidebarTags(articles);
      renderPicks(articles);
    })
    .catch((err) => {
      console.error("Articles feed error:", err);
      feedEl.innerHTML = `<p class="articles-empty">Couldn't load articles right now. Please refresh the page.</p>`;
    });

  // Exposed for article.html to reuse the same date formatter.
  window.__articlesFormatDate = formatDate;
})();
