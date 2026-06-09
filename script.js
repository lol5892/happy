// ============================================================
//  Мирону 1 годик — интерактив
// ============================================================

// ---------- Обратный отсчёт до 20 июня 2026, 15:00 ----------
(function countdown() {
  const target = new Date("2026-06-20T15:00:00").getTime();
  const els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins: document.getElementById("cd-mins"),
    secs: document.getElementById("cd-secs"),
  };
  const box = document.getElementById("countdown");
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
    const interval = parseInt(carousel.dataset.interval, 10) || 1500;
    let index = 0;
    setInterval(() => {
      slides[index].classList.remove("is-active");
      index = (index + 1) % slides.length;
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

  function photoSrc(name) {
    return "photos/" + name.split("/").map(encodeURIComponent).join("/");
  }

  function buildGroup(list, hidden) {
    const group = document.createElement("div");
    group.className = "gallery-marquee__group";
    if (hidden) group.setAttribute("aria-hidden", "true");
    list.forEach((name) => {
      const img = document.createElement("img");
      img.src = photoSrc(name);
      img.alt = name.replace(/\.[^.]+$/, "");
      img.loading = "lazy";
      group.appendChild(img);
    });
    return group;
  }

  track.appendChild(buildGroup(files, false));
  track.appendChild(buildGroup(files, true));
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
      open(e.target.src, e.target.alt);
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
