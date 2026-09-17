/* ==========================================================================
   Hero slideshow — one master timer drives everything: the background image
   (with a slow Ken Burns zoom), the headline, kicker, caption, and the
   quote panel all advance together. Nothing here needs to change if you
   later add a 4th slide — just add another object to HERO_SLIDES.
   ========================================================================== */
(function () {
  const HERO_SLIDES = [
    {
      kicker: "Trusted Guidance &nbsp;&middot;&nbsp; Strong Legal Protection",
      headline: "We Practice Law.<br />With<em>Purpose</em>.",
      caption:
        "Corporate counsel built for the moments that define a business.",
      quoteLabel: "OUR APPROACH",
      quote:
        "&ldquo;Where there is complexity, <em>there must be clarity.</em>&rdquo;",
    },
    {
      kicker: "Precision &nbsp;&middot;&nbsp; Principled Counsel",
      headline: "Judgment You Can <em>Rely On.</em>",
      caption:
        "From boardroom decisions to courtroom outcomes, we bring clarity to complexity.",
      quoteLabel: "LEGAL COUNSEL",
      quote:
        "&ldquo;Good counsel protects today <em>while preparing for tomorrow.</em>&rdquo;",
    },
    {
      kicker: "Integrity &nbsp;&middot;&nbsp; Enduring Standards",
      headline: "Built on Principle. <em>Proven in Practice.</em>",
      caption:
        "The values that shape our counsel don't change with the moment.",
      quoteLabel: "OUR PRINCIPLE",
      quote:
        "&ldquo;Strong legal strategy begins <em>with understanding.</em>&rdquo;",
    },
  ];

  const SLIDE_DURATION = 7000; // ms each slide stays visible
  const FADE_DURATION = 500; // ms for the text-fade transition

  const bgSlides = document.querySelectorAll(".hero-slide-img");
  const textStack = document.getElementById("heroTextStack");
  const kickerEl = document.getElementById("heroKickerText");
  const headlineEl = document.getElementById("heroHeadline");
  const captionEl = document.getElementById("heroCaption");
  const quoteNumberEl = document.getElementById("quoteNumber");
  const quoteLabelEl = document.getElementById("quoteLabel");
  const quoteTextEl = document.getElementById("quoteText");

  if (!bgSlides.length || !textStack) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let index = 0;

  function activateBg(i) {
    bgSlides.forEach((slide, si) => {
      slide.classList.toggle("active", si === i);
      // Restart the Ken Burns zoom on the newly active slide by removing
      // and re-adding the class after a reflow — CSS animations don't
      // replay just because a class is toggled back on unless the browser
      // is forced to notice the element changed.
      const img = slide.querySelector("img");
      if (si === i && img) {
        img.classList.remove("zooming");
        void img.offsetWidth; // force reflow
        img.classList.add("zooming");
      }
    });
  }

  function goToSlide(i) {
    const slide = HERO_SLIDES[i];

    // Fade the text stack + quote out
    textStack.classList.add("hero-fade");
    if (quoteTextEl) quoteTextEl.parentElement.classList.add("hero-fade");

    setTimeout(() => {
      if (kickerEl) kickerEl.innerHTML = slide.kicker;
      if (headlineEl) headlineEl.innerHTML = slide.headline;
      if (captionEl) captionEl.textContent = slide.caption;
      if (quoteNumberEl) {
        quoteNumberEl.textContent = `${String(i + 1).padStart(2, "0")} / ${String(HERO_SLIDES.length).padStart(2, "0")}`;
      }
      if (quoteLabelEl) quoteLabelEl.textContent = slide.quoteLabel;
      if (quoteTextEl) quoteTextEl.innerHTML = slide.quote;

      textStack.classList.remove("hero-fade");
      if (quoteTextEl) quoteTextEl.parentElement.classList.remove("hero-fade");
    }, FADE_DURATION);

    activateBg(i);
  }

  activateBg(0); // start the zoom on the first slide immediately

  if (!prefersReducedMotion) {
    setInterval(() => {
      index = (index + 1) % HERO_SLIDES.length;
      goToSlide(index);
    }, SLIDE_DURATION);
  }
})();
