/* ==========================================================================
   Timi Ogunyemi & Co. — shared site script
   Smooth scroll + parallax + scroll-linked effects: Locomotive Scroll v5
   (built on Lenis). No GSAP / ScrollTrigger in this build.
   ========================================================================== */
/* ---------------- Page loader (first visit only) ---------------- */
const INTRO_KEY = "ogunyemiIntroPlayed";
const hasPlayedIntro = sessionStorage.getItem(INTRO_KEY) === "1";
const pageLoader = document.getElementById("pageLoader");

if (hasPlayedIntro) {
  // Already seen the intro this session (e.g. navigated here from another
  // page) — skip straight to the settled state, no loader, no stagger delay.
  document.documentElement.classList.add("is-loaded", "intro-skip");
  if (pageLoader) pageLoader.remove();
} else {
  document.documentElement.classList.add("is-loading");
  window.addEventListener("load", () => {
    setTimeout(() => {
      document.documentElement.classList.remove("is-loading");
      document.documentElement.classList.add("is-loaded");
      sessionStorage.setItem(INTRO_KEY, "1");
      if (pageLoader) {
        pageLoader.classList.add("is-hidden");
        pageLoader.addEventListener(
          "transitionend",
          () => pageLoader.remove(),
          { once: true },
        );
      }
    }, 1300);
  });
}

(function () {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const header = document.getElementById("siteHeader");
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");
  const navBackdrop = document.getElementById("navBackdrop");

  /* ---------------- Mobile nav ---------------- */
  function closeNav() {
    primaryNav.classList.remove("open");
    navBackdrop.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("nav-open-lock");
  }
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = primaryNav.classList.toggle("open");
      navBackdrop.classList.toggle("open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.documentElement.classList.toggle("nav-open-lock", isOpen);
    });
    navBackdrop.addEventListener("click", closeNav);
    primaryNav
      .querySelectorAll("a")
      .forEach((a) => a.addEventListener("click", closeNav));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && primaryNav.classList.contains("open")) {
        closeNav();
      }
    });
  }

  /* ---------------- Locomotive Scroll v5 ---------------- */
  let scroll = null;
  if (!prefersReducedMotion && window.Lenis && window.locomotiveScroll) {
    // The UMD build expects a lowercase `window.lenis` global (bridged in the page head).
    scroll = new window.locomotiveScroll({
      lenisOptions: {
        lerp: 0.1,
        duration: 1.2,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
      },
    });

    let lastY = 0;
    scroll.lenisInstance.on("scroll", ({ scroll: y }) => {
      const goingDown = y > lastY;
      // Header: hide on sustained downward scroll past a threshold, show on scroll up.
      if (y > 140 && goingDown) {
        header.classList.add("header--hidden");
      } else if (!goingDown) {
        header.classList.remove("header--hidden");
      }
      header.classList.toggle("scrolled", y > 40);
      lastY = y;
    });

    window.addEventListener("load", () => scroll.update && scroll.update());
  } else {
    // Reduced motion or library missing: plain scroll listener, no parallax/no hidden header surprises.
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 40);
    };
    document.addEventListener("scroll", onScroll);
    onScroll();
  }

  /* ---------------- Active nav link on section view ---------------- */
  const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
  const sections = navLinks
    .map((link) => document.getElementById(link.getAttribute("data-nav-link")))
    .filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove("active"));
            const match = navLinks.find(
              (l) => l.getAttribute("data-nav-link") === entry.target.id,
            );
            if (match) match.classList.add("active");
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
  }

  /* ---------------- Consultation form (front-end only demo) ---------------- */
  const form = document.getElementById("consultForm");
  if (form) {
    const success = document.getElementById("formSuccess");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      success.style.display = "block";
      form.querySelectorAll("input, textarea").forEach((el) => (el.value = ""));
      success.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "nearest",
      });
    });
  }

  /* ---------------- Global floating WhatsApp button ---------------- */
  // Injected on every page that loads main.js — one place to update the
  // number or the message, rather than pasting a button into every file.
  const WHATSAPP_NUMBER = "2348000000000";
  const WHATSAPP_MESSAGE =
    "Hi, I'd like to speak with someone at Timi Ogunyemi & Co.";
  const waLink = document.createElement("a");
  waLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  waLink.className = "whatsapp-float";
  waLink.target = "_blank";
  waLink.rel = "noopener";
  waLink.setAttribute("aria-label", "Chat with us on WhatsApp");
  waLink.innerHTML = `
    ${prefersReducedMotion ? "" : '<span class="whatsapp-float-pulse" aria-hidden="true"></span>'}
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16.02 3C9.4 3 4 8.4 4 15.02c0 2.4.68 4.65 1.86 6.56L4 29l7.6-1.99a11.9 11.9 0 0 0 4.42.85h.01c6.62 0 12.02-5.4 12.02-12.02C28.05 8.4 22.65 3 16.02 3Zm0 21.86h-.01a9.9 9.9 0 0 1-5.05-1.39l-.36-.21-3.76.99 1-3.66-.24-.38a9.87 9.87 0 0 1-1.52-5.19c0-5.46 4.45-9.9 9.94-9.9 2.65 0 5.14 1.03 7.02 2.9a9.85 9.85 0 0 1 2.9 7.01c0 5.46-4.45 9.9-9.92 9.9Zm5.44-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47a8.9 8.9 0 0 1-1.64-2.04c-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.48 1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
    </svg>`;
  document.body.appendChild(waLink);
})();
