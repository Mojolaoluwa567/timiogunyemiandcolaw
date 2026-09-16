/* Shows the homepage "Latest Insights" section only when published
   articles actually exist. Stays hidden otherwise, so the homepage never
   renders an empty heading. */
(function () {
  const sectionEl = document.getElementById("latestInsights");
  const gridEl = document.getElementById("latestInsightsGrid");
  if (!sectionEl || !gridEl || !window.supabaseClient) return;

  function cardHTML(a) {
    const href = `article.html?slug=${encodeURIComponent(a.slug)}`;
    return `
      <a href="${href}" class="latest-card">
        <div class="latest-card-media">
          <img src="${a.cover_url || "assets/lawyer-at-desk.jpg"}" alt="" />
        </div>
        <span class="article-tag">${a.tag}</span>
        <h3>${a.title}</h3>
        <p>${a.excerpt}</p>
        <span class="latest-card-link">Read Article →</span>
      </a>`;
  }

  window.supabaseClient
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("publish_date", { ascending: false })
    .limit(3)
    .then(({ data, error }) => {
      if (error || !data || data.length === 0) return; // stays hidden
      gridEl.innerHTML = data.map(cardHTML).join("");
      sectionEl.style.display = "";
    });
})();
