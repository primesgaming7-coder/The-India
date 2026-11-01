/* Small, dependency-free motion effects. Kept light for modest laptops. */
(() => {
  const progressBar = document.getElementById("progressBar");
  const revealItems = document.querySelectorAll(".reveal");
  const parallaxItems = document.querySelectorAll(".parallax");
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal elements once, then stop observing them to keep work low.
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // One shared requestAnimationFrame loop updates progress and parallax.
  // On reduced-motion settings, parallax is disabled.
  let ticking = false;
  const updateMotion = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) {
      progressBar.style.width = `${maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0}%`;
    }

    if (!reduceMotion && window.innerWidth > 700) {
      parallaxItems.forEach((item) => {
        const speed = Number(item.dataset.speed || 0.06);
        const rect = item.getBoundingClientRect();
        if (rect.bottom > -150 && rect.top < window.innerHeight + 150) {
          const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
          item.style.transform = `translate3d(0, ${offset}px, 0) scale(1.08)`;
        }
      });
    }
    ticking = false;
  };

  const requestMotionUpdate = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateMotion);
    }
  };
  window.addEventListener("scroll", requestMotionUpdate, { passive: true });
  window.addEventListener("resize", requestMotionUpdate);
  updateMotion();


  // Load the travel film only after a click to avoid wasting bandwidth on page load.
  const filmPoster = document.getElementById("filmPoster");
  const playFilm = document.getElementById("playFilm");
  const filmEmbed = document.getElementById("filmEmbed");
  if (filmPoster && playFilm && filmEmbed) {
    playFilm.addEventListener("click", () => {
      if (filmEmbed.childElementCount) return;
      const frame = document.createElement("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/wAD9uO9YAQw?autoplay=1&rel=0";
      frame.title = "Incredible India — Director's Cut travel film";
      frame.loading = "lazy";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      frame.allowFullscreen = true;
      filmEmbed.appendChild(frame);
      filmEmbed.hidden = false;
      filmPoster.classList.add("is-playing");
      playFilm.setAttribute("aria-label", "Travel film playing");
    });
  }

  // Small pointer tilt on desktop only. Disabled for touch and reduced-motion users.
  const tiltCards = document.querySelectorAll(".destination-card, .film-poster");
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    tiltCards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        if (card.classList.contains("is-playing")) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 3.5;
        const rotateX = (0.5 - y) * 3.5;
        card.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  // Accessible mobile navigation.
  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      document.body.classList.toggle("menu-open", isOpen);
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        document.body.classList.remove("menu-open");
      });
    });
  }
})();
