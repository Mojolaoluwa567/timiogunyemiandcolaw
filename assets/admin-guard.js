/* ==========================================================================
   Admin auth guard.
   Include this on every admin page EXCEPT the login page itself.
   Redirects to the login page if there's no active session, and wires up
   any element with [data-logout] to sign the user out.
   ========================================================================== */
(async function () {
  const { data } = await window.supabaseClient.auth.getSession();

  if (!data.session) {
    window.location.href = "index.html";
    return;
  }

  // Reveal the page now that we know the user is authenticated — pages
  // start with <body style="display:none"> to avoid a flash of admin UI
  // before the redirect can happen.
  document.body.style.display = "";

  const emailEl = document.querySelector("[data-user-email]");
  if (emailEl) emailEl.textContent = data.session.user.email;

  document.querySelectorAll("[data-logout]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      await window.supabaseClient.auth.signOut();
      window.location.href = "index.html";
    });
  });

  // If the session expires or the user logs out in another tab, bounce
  // back to login rather than leaving them on a broken admin page.
  window.supabaseClient.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      window.location.href = "index.html";
    }
  });
})();
