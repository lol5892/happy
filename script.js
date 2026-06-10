// ============================================================
//  Мирону 1 годик — интерактив
// ============================================================

// Всегда открывать сайт с hero, а не с прошлой позиции прокрутки
(function initScroll() {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  function scrollToTopUnlessHash() {
    if (!location.hash) window.scrollTo(0, 0);
  }

  scrollToTopUnlessHash();
  window.addEventListener("pageshow", scrollToTopUnlessHash);
})();

function photoPath(name) {
  return "photos/" + name.split("/").map(encodeURIComponent).join("/");
}

function thumbPath(name) {
  const base = name.replace(/\.[^.]+$/, "");
  return "photos/thumbs/" + encodeURIComponent(base + ".jpg");
}

// ---------- Обратный отсчёт до 20 июня 2026, 15:00 ----------
(function countdown() {
  const target = new Date("2026-06-20T15:00:00").getTime();
  const els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins: document.getElementById("cd-mins"),
    secs: document.getElementById("cd-secs"),
  };
  const box = document.getElementById("countdown-timer");
  const done = document.getElementById("cd-done");

  function pad(n) { return String(n).padStart(2, "0"); }

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      if (box) box.style.display = "none";
      if (done) done.hidden = false;
      clearInterval(timer);
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (els.days)  els.days.textContent  = d;
    if (els.hours) els.hours.textContent = pad(h);
    if (els.mins)  els.mins.textContent  = pad(m);
    if (els.secs)  els.secs.textContent  = pad(s);
  }

  tick();
  const timer = setInterval(tick, 1000);
})();

// ---------- Появление блоков при прокрутке ----------
(function reveals() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach((el) => io.observe(el));
})();

// ---------- Карусель в «Нашей истории» ----------
(function timelineCarousels() {
  document.querySelectorAll(".tl-carousel").forEach((carousel) => {
    const slides = carousel.querySelectorAll(".tl-carousel__img");
    if (slides.length < 2) return;

    slides.forEach((slide) => {
      if (slide.classList.contains("is-active")) return;
      const src = slide.getAttribute("src");
      if (!src) return;
      slide.dataset.deferredSrc = src;
      slide.removeAttribute("src");
    });

    function ensureLoaded(slide) {
      if (slide.dataset.deferredSrc && !slide.getAttribute("src")) {
        slide.src = slide.dataset.deferredSrc;
      }
    }

    const interval = parseInt(carousel.dataset.interval, 10) || 1500;
    let index = 0;
    setInterval(() => {
      slides[index].classList.remove("is-active");
      index = (index + 1) % slides.length;
      ensureLoaded(slides[index]);
      ensureLoaded(slides[(index + 1) % slides.length]);
      slides[index].classList.add("is-active");
    }, interval);
  });
})();

// ---------- Галерея — все фото из photos/ ----------
(function galleryMarquee() {
  const track = document.getElementById("gallery-track");
  const dataEl = document.getElementById("gallery-data");
  if (!track || !dataEl) return;

  let files = [];
  try {
    files = JSON.parse(dataEl.textContent);
  } catch {
    track.innerHTML = "<p class=\"gallery-error\">Не удалось загрузить фото галереи.</p>";
    return;
  }

  if (!files.length) return;

  const section = document.getElementById("gallery");
  if (!section) return;

  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  const MAX_CONCURRENT = isMobile ? 2 : 4;
  let loading = 0;
  const queue = [];

  function pumpQueue() {
    while (loading < MAX_CONCURRENT && queue.length) {
      const { img, src } = queue.shift();
      loading += 1;
      const done = () => {
        loading -= 1;
        img.classList.remove("is-loading");
        pumpQueue();
      };
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
      img.src = src;
    }
  }

  function queueLoad(img) {
    const src = img.dataset.src;
    if (!src || img.dataset.loaded) return;
    img.dataset.loaded = "1";
    img.classList.add("is-loading");
    queue.push({ img, src });
    pumpQueue();
  }

  function createImg(name) {
    const img = document.createElement("img");
    img.alt = name.replace(/\.[^.]+$/, "");
    img.decoding = "async";
    img.dataset.src = thumbPath(name);
    img.dataset.full = photoPath(name);
    img.classList.add("is-loading");
    return img;
  }

  function buildGroup(list, hidden) {
    const group = document.createElement("div");
    group.className = "gallery-marquee__group";
    if (hidden) group.setAttribute("aria-hidden", "true");
    list.forEach((name) => group.appendChild(createImg(name)));
    return group;
  }

  let imgObserver = null;

  function watchImages(root) {
    if (!("IntersectionObserver" in window)) {
      root.querySelectorAll("img[data-src]").forEach((img) => queueLoad(img));
      return;
    }
    if (!imgObserver) {
      imgObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            queueLoad(entry.target);
            imgObserver.unobserve(entry.target);
          });
        },
        { rootMargin: "120px" }
      );
    }
    root.querySelectorAll("img[data-src]").forEach((img) => imgObserver.observe(img));
  }

  function mountGallery() {
    track.appendChild(buildGroup(files, false));
    watchImages(track);

    if (isMobile) return;

    const addClone = () => {
      const clone = buildGroup(files, true);
      track.appendChild(clone);
      watchImages(clone);
    };
    if ("requestIdleCallback" in window) {
      requestIdleCallback(addClone, { timeout: 8000 });
    } else {
      setTimeout(addClone, 4000);
    }
  }

  if (!("IntersectionObserver" in window)) {
    mountGallery();
    return;
  }

  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    mountGallery();
  }, { rootMargin: "150px" });

  io.observe(section);
})();

// ---------- Лайтбокс галереи ----------
(function galleryLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = lightbox?.querySelector(".lightbox-close");
  const marquee = document.querySelector(".gallery-marquee");
  if (!lightbox || !lightboxImg || !marquee) return;

  function open(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add("is-open"));
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => {
      if (!lightbox.classList.contains("is-open")) {
        lightbox.hidden = true;
        lightboxImg.removeAttribute("src");
      }
    }, 300);
  }

  marquee.addEventListener("click", (e) => {
    if (e.target instanceof HTMLImageElement && e.target.closest(".gallery-marquee__group")) {
      open(e.target.dataset.full || e.target.src, e.target.alt);
    }
  });

  closeBtn?.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("is-open")) close();
  });
})();

// ---------- RSVP ----------
(function rsvp() {
  const form = document.getElementById("rsvp-form");
  if (!form) return;
  const result = document.getElementById("rsvp-result");
  const nameInput = document.getElementById("rsvp-name");
  const guestsInput = document.getElementById("rsvp-guests");
  const buttons = form.querySelectorAll("button[data-answer]");
  let sending = false;

  function showResult(text) {
    result.textContent = text;
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function setSending(state) {
    sending = state;
    buttons.forEach((btn) => {
      btn.disabled = state;
      btn.style.opacity = state ? "0.7" : "";
    });
  }

  async function notifyTelegram(name, answer, guests) {
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, answer, guests }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (sending) return;

      const name = (nameInput.value || "").trim();
      if (!name) {
        nameInput.focus();
        nameInput.style.borderColor = "#e98b8b";
        return;
      }
      nameInput.style.borderColor = "";

      const answer = btn.dataset.answer;
      const guests = Math.max(1, parseInt(guestsInput.value, 10) || 1);

      setSending(true);
      await notifyTelegram(name, answer, guests);
      setSending(false);

      if (answer === "yes") {
        showResult(`Ура, ${name}! Ждём вас (${guests}) на празднике Мироши 🎉🎈`);
        confettiBurst();
      } else {
        showResult(`${name}, будем скучать! Спасибо, что дал(а) знать 💙`);
      }
    });
  });
})();

// ---------- Простое конфетти на «Буду!» ----------
function confettiBurst() {
  const colors = ["#f6c338", "#bcdcf5", "#2f73b3", "#ffe39a", "#8ec3ec"];
  const count = 80;
  for (let i = 0; i < count; i++) {
    const c = document.createElement("span");
    c.style.cssText = `
      position: fixed; z-index: 9999; top: 40%; left: 50%;
      width: 10px; height: 14px; pointer-events: none;
      background: ${colors[i % colors.length]};
      border-radius: 2px;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(c);
    const angle = Math.random() * Math.PI * 2;
    const dist = 120 + Math.random() * 260;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist - 120;
    c.animate(
      [
        { transform: "translate(-50%,-50%) rotate(0deg)", opacity: 1 },
        { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${Math.random() * 720}deg)`, opacity: 0 },
      ],
      { duration: 1100 + Math.random() * 700, easing: "cubic-bezier(.2,.7,.3,1)" }
    ).onfinish = () => c.remove();
  }
}
