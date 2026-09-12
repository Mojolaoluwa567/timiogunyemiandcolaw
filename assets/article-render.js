/* ==========================================================================
   Single article template renderer.
   Reads ?slug= from the URL, fetches assets/data/articles.json, finds the
   matching entry, and populates the page. One HTML file serves every
   article — new articles need nothing added here, only a new entry in
   articles.json (via the admin panel or by hand).
   ========================================================================== */
(function () {
  const DATA_URL = "assets/data/articles.json";

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const notFoundEl = document.getElementById("articleNotFound");
  const contentEl = document.getElementById("articleContent");

  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function showNotFound() {
    if (notFoundEl) notFoundEl.style.display = "block";
    if (contentEl) contentEl.style.display = "none";
  }

  function relatedCardHTML(article) {
    const href = `article.html?slug=${encodeURIComponent(article.slug)}`;
    return `
      <a href="${href}" class="article-related-card" data-scroll>
        <div class="article-related-media">
          <img src="${article.cover}" alt="" />
        </div>
        <span class="article-tag">${article.tag}</span>
        <h3>${article.title}</h3>
      </a>`;
  }

  if (!slug) {
    showNotFound();
    return;
  }

  fetch(DATA_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${DATA_URL}: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      const articles = data.articles || [];
      const article = articles.find((a) => a.slug === slug);
      if (!article) {
        showNotFound();
        return;
      }

      // ---- Head ----
      document.title = `${article.title} — Timi Ogunyemi & Co.`;
      const descEl = document.getElementById("pageDescription");
      if (descEl) descEl.setAttribute("content", article.excerpt);

      // ---- Hero ----
      document.getElementById("articleTag").textContent = article.tag;
      document.getElementById("articleTitle").textContent = article.title;
      document.getElementById("articleAuthor").textContent = `By ${article.author}`;
      document.getElementById("articleDate").textContent = formatDate(article.date);
      document.getElementById("articleReadTime").textContent = article.readTime;

      const coverImg = document.getElementById("articleCover");
      coverImg.src = article.cover;
      coverImg.alt = article.title;

      // ---- Body ----
      // The admin panel's editor writes Markdown; older/manually-added
      // entries may already be plain HTML. marked() safely passes raw HTML
      // blocks through unchanged, so both formats render correctly either
      // way. article.body is trusted content written by the firm's own
      // team — not arbitrary third-party input — so rendering it directly
      // is safe here.
      const bodyEl = document.getElementById("articleBody");
      if (window.marked) {
        bodyEl.innerHTML = window.marked.parse(article.body);
      } else {
        // marked.js failed to load (e.g. blocked) — fall back to raw output
        // rather than showing nothing.
        bodyEl.innerHTML = article.body;
      }

      // ---- Share links ----
      const pageUrl = window.location.href;
      const linkedin = document.getElementById("shareLinkedIn");
      const twitter = document.getElementById("shareTwitter");
      const copyLink = document.getElementById("shareCopy");

      if (linkedin) {
        linkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
      }
      if (twitter) {
        twitter.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(article.title)}`;
      }
      if (copyLink) {
        copyLink.addEventListener("click", (e) => {
          e.preventDefault();
          navigator.clipboard.writeText(pageUrl).then(() => {
            const original = copyLink.textContent;
            copyLink.textContent = "Copied!";
            setTimeout(() => (copyLink.textContent = original), 1800);
          });
        });
      }

      // ---- Related articles: same tag, excluding this one, up to 3 ----
      const relatedEl = document.getElementById("relatedArticles");
      if (relatedEl) {
        let related = articles.filter(
          (a) => a.tag === article.tag && a.slug !== article.slug,
        );
        if (related.length < 3) {
          const others = articles.filter(
            (a) => a.slug !== article.slug && !related.includes(a),
          );
          related = related.concat(others).slice(0, 3);
        } else {
          related = related.slice(0, 3);
        }
        relatedEl.innerHTML = related.map(relatedCardHTML).join("");
      }

      // Reveal the real content, hide the not-found state.
      if (contentEl) contentEl.style.display = "block";
      if (notFoundEl) notFoundEl.style.display = "none";
    })
    .catch((err) => {
      console.error("Article render error:", err);
      showNotFound();
    });
})();
