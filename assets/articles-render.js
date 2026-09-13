/* ==========================================================================
   Articles list page — reads PUBLISHED articles from Supabase and renders:
   - hero filter pills (auto-generated from the practice areas actually
     present among published articles)
   - the "Trending Articles" list (featured articles if any are marked
     featured, otherwise the 3 most recent)
   - the "Insights across every practice area" grid (everything else)

   Adding a new article no longer touches this file, or any file — it's all
   driven by what's in the `articles` table with status = 'published'.
   ========================================================================== */
(function () {
  const trendingListEl = document.getElementById("trendingList");
  const trendingEmptyEl = document.getElementById("trendingEmpty");
  const trendingCountEl = document.getElementById("trendingCount");
  const insightsGridEl = document.getElementById("insightsGrid");
  const pillsEl = document.getElementById("filterTabs");

  if (!trendingListEl || !window.supabaseClient) return;

  function trendingItemHTML(article) {
    const href = `article.html?slug=${encodeURIComponent(article.slug)}`;
    return `
    <a href="${href}" class="trending-item" data-tag="${article.tag}">
      <div class="trending-item-text">
        <span class="article-tag">${article.tag}</span>
        <h3>${article.title}</h3>
        <p>${article.excerpt}</p>
        <span class="trending-item-link">Read Article →</span>
      </div>
      <div class="trending-item-media">
        <img src="${article.cover_url || "assets/lawyer-at-desk.jpg"}" alt="" />
      </div>
    </a>`;
  }

  function insightCardHTML(article) {
    const href = `article.html?slug=${encodeURIComponent(article.slug)}`;
    return `
      <a href="${href}" class="insight-card"data-tag="${article.tag}">
        <div class="insight-card-media">
          <img src="${article.cover_url || "assets/lawyer-at-desk.jpg"}" alt="" />
        </div>
        <span class="article-tag">${article.tag}</span>
        <h3>${article.title}</h3>
        <p>${article.excerpt}</p>
        <span class="insight-card-link">Read Article →</span>
      </a>`;
  }

  function renderAll(articles, activeTag) {
    const filtered =
      activeTag === "all"
        ? articles
        : articles.filter((a) => a.tag === activeTag);

    // Trending: featured articles first (if any), otherwise the 3 most recent.
    const featured = filtered.filter((a) => a.featured);
    const trending = (featured.length ? featured : filtered).slice(0, 3);
    const rest = filtered.filter((a) => !trending.includes(a));

    trendingCountEl.textContent = `[${trending.length}]`;
    trendingListEl.innerHTML = trending.map(trendingItemHTML).join("");
    trendingEmptyEl.style.display = filtered.length ? "none" : "block";
    if (filtered.length === 0) trendingListEl.appendChild(trendingEmptyEl);

    const insightsSectionEl = document.getElementById("insightsSection");

    if (rest.length > 0) {
      insightsGridEl.innerHTML = rest.map(insightCardHTML).join("");
      if (insightsSectionEl) insightsSectionEl.style.display = "";
    } else {
      insightsGridEl.innerHTML = "";
      if (insightsSectionEl) insightsSectionEl.style.display = "none";
    }
  }

  function wirePills(articles) {
    if (!pillsEl) return;
    const tags = Array.from(new Set(articles.map((a) => a.tag)));

    pillsEl.innerHTML =
      `<a href="#" class="filter-pill active" data-tag="all">All</a>` +
      tags
        .map(
          (tag) =>
            `<a href="#" class="filter-pill" data-tag="${tag}">${tag}</a>`,
        )
        .join("");

    pillsEl.addEventListener("click", (e) => {
      const pill = e.target.closest(".filter-pill");
      if (!pill) return;
      e.preventDefault();
      pillsEl
        .querySelectorAll(".filter-pill")
        .forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      renderAll(articles, pill.dataset.tag);
    });
  }

  async function init() {
    const { data, error } = await window.supabaseClient
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("publish_date", { ascending: false });

    if (error) {
      console.error("Articles feed error:", error);
      trendingListEl.innerHTML = `<p class="articles-empty">Couldn't load articles right now. Please refresh the page.</p>`;
      return;
    }

    wirePills(data);
    renderAll(data, "all");
  }

  init();
})();
