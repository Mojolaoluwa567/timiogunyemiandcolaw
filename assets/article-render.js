/* ==========================================================================
   Single article template renderer.
   Reads ?slug= from the URL, fetches the matching row from Supabase, and
   populates the page. One HTML file serves every article — new articles
   need nothing added here, only a new row in the `articles` table
   (created through the admin dashboard).

   ?preview=1 lets a logged-in admin view a draft before publishing it —
   ordinary visitors always only see published articles (enforced both
   here and by the database's Row Level Security policies).
   ========================================================================== */
(function () {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const isPreview = params.get("preview") === "1";

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
      <a href="${href}" class="article-related-card">
        <div class="article-related-media">
          <img src="${article.cover_url || "assets/lawyer-at-desk.jpg"}" alt="" />
        </div>
        <span class="article-tag">${article.tag}</span>
        <h3>${article.title}</h3>
      </a>`;
  }

  if (!slug || !window.supabaseClient) {
    showNotFound();
    return;
  }

  async function fetchArticle() {
    let query = window.supabaseClient
      .from("articles")
      .select("*")
      .eq("slug", slug);
    // Ordinary visitors only ever see published articles — RLS enforces
    // this server-side too, but filtering here avoids a confusing
    // "not found" vs "exists but hidden" distinction in the UI logic.
    if (!isPreview) query = query.eq("status", "published");
    const { data, error } = await query.maybeSingle();
    return { data, error };
  }

  async function fetchRelated(tag, excludeSlug) {
    const { data } = await window.supabaseClient
      .from("articles")
      .select("*")
      .eq("status", "published")
      .eq("tag", tag)
      .neq("slug", excludeSlug)
      .order("publish_date", { ascending: false })
      .limit(3);
    return data || [];
  }

  async function init() {
    const { data: article, error } = await fetchArticle();

    if (error || !article) {
      showNotFound();
      return;
    }

    // ---- Draft banner when previewing ----
    if (isPreview && article.status === "draft") {
      const banner = document.createElement("div");
      banner.textContent =
        "PREVIEW — this article is still a draft and is not visible to site visitors.";
      banner.style.cssText =
        "position:sticky;top:0;z-index:50;background:#e0b84c;color:#1a1300;text-align:center;padding:10px;font-family:var(--sans);font-weight:600;font-size:0.85rem;";
      document.body.prepend(banner);
    }

    // ---- Head ----
    document.title = `${article.title} — Timi Ogunyemi & Co.`;
    const descEl = document.getElementById("pageDescription");
    if (descEl) descEl.setAttribute("content", article.excerpt);

    // ---- Hero ----
    document.getElementById("articleTag").textContent = article.tag;
    document.getElementById("articleTitle").textContent = article.title;
    document.getElementById("articleAuthor").textContent =
      `By ${article.author}`;
    document.getElementById("articleDate").textContent = formatDate(
      article.publish_date,
    );
    document.getElementById("articleReadTime").textContent = article.read_time;

    const coverImg = document.getElementById("articleCover");
    coverImg.src = article.cover_url || "assets/lawyer-at-desk.jpg";
    coverImg.alt = article.title;

    // ---- Body ----
    // article.body is HTML produced by the admin dashboard's rich-text
    // editor (Quill), written only by the firm's own logged-in team — not
    // arbitrary third-party input — so rendering it directly is safe here.
    document.getElementById("articleBody").innerHTML = article.body;

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

    // ---- Related articles ----
    const relatedEl = document.getElementById("relatedArticles");
    if (relatedEl) {
      const related = await fetchRelated(article.tag, article.slug);
      relatedEl.innerHTML = related.map(relatedCardHTML).join("");
    }

    // Reveal the real content, hide the not-found state.
    if (contentEl) contentEl.style.display = "block";
    if (notFoundEl) notFoundEl.style.display = "none";
  }

  init().catch((err) => {
    console.error("Article render error:", err);
    showNotFound();
  });
})();
