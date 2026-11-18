// main.js — navigation, scroll effects, and room card rendering.
(function () {
  document.getElementById('year').textContent = new Date().getFullYear();

  // ---- Fade in once everything is ready (avoids flash of unstyled content) ----
  window.addEventListener('load', () => {
    document.body.classList.remove('is-loading');
  });

  // ---- Sticky nav on scroll ----
  const nav = document.getElementById('site-nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Mobile nav toggle ----
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );

  // ---- Tideline: fills in as you scroll through the hero (signature element) ----
  const tideFill = document.querySelector('.tide-fill');
  const hero = document.querySelector('.hero');
  if (tideFill && hero) {
    const updateTide = () => {
      const progress = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
      // Scale the wave vertically from 0 (low tide) to 1 (high tide) as the user scrolls.
      tideFill.style.transform = `scaleY(${0.15 + progress * 0.85})`;
    };
    window.addEventListener('scroll', updateTide, { passive: true });
    updateTide();
  }

  // ---- Hero parallax: background drifts slower than the page as you scroll ----
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg && hero) {
    const updateParallax = () => {
      const offset = Math.min(window.scrollY, hero.offsetHeight);
      heroBg.style.transform = `translateY(${offset * 0.35}px) scale(1.05)`;
    };
    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();
  }

  // ---- Floating "Book Now" CTA: shows once the hero has scrolled past ----
  const floatCta = document.getElementById('float-cta');
  if (floatCta && hero) {
    const toggleFloatCta = () => {
      if (window.scrollY > hero.offsetHeight * 0.9) floatCta.classList.add('show');
      else floatCta.classList.remove('show');
    };
    window.addEventListener('scroll', toggleFloatCta, { passive: true });
    toggleFloatCta();
  }

  // ---- Scroll reveal ----
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => io.observe(el));

  // ---- Animated number counters (e.g. "3 Water features", "22 Rooms on-site") ----
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const countIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const duration = 900;
          const start = performance.now();
          function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          countIo.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => countIo.observe(el));
  }

  // ---- Lightbox gallery ----
  const galleryGrid = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('lightbox');
  if (galleryGrid && lightbox) {
    const cards = Array.from(galleryGrid.querySelectorAll('.amenity-card'));
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    let currentIndex = 0;

    function openLightbox(index) {
      currentIndex = (index + cards.length) % cards.length;
      const card = cards[currentIndex];
      lightboxImg.src = card.dataset.full || card.querySelector('img').src;
      lightboxImg.alt = card.querySelector('img').alt;
      lightboxCaption.textContent = card.dataset.lightboxCaption || '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    cards.forEach((card, index) => {
      card.addEventListener('click', () => openLightbox(index));
    });
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-prev').addEventListener('click', () => openLightbox(currentIndex - 1));
    document.getElementById('lightbox-next').addEventListener('click', () => openLightbox(currentIndex + 1));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') openLightbox(currentIndex - 1);
      if (e.key === 'ArrowRight') openLightbox(currentIndex + 1);
    });
  }

  // ---- FAQ accordion ----
  document.querySelectorAll('.faq-item').forEach((item) => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((other) => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // ---- Fetch rooms and render cards + booking select options ----
  async function loadRooms() {
    try {
      const res = await fetch('/api/rooms');
      const rooms = await res.json();
      window.__ROOMS__ = rooms; // shared with booking.js

      const grid = document.getElementById('room-grid');
      const select = document.getElementById('room_key');
      grid.innerHTML = '';
      select.innerHTML = '';

      rooms.forEach((room) => {
        const card = document.createElement('div');
        card.className = 'room-card reveal';
        const scarcityBadge =
          room.total_units <= 5
            ? `<span class="room-badge">Only ${room.total_units} units on-site</span>`
            : '';
        card.innerHTML = `
          <div class="room-media">
            <img src="${room.image_url}" alt="${room.name}" />
            ${scarcityBadge}
          </div>
          <div class="room-body">
            <h3>${room.name}</h3>
            <div class="room-price">&#8369;${room.price_per_night.toLocaleString()} <small>/ night</small></div>
            <div class="room-meta">Sleeps up to ${room.capacity} guests</div>
            <p>${room.description}</p>
            <a href="#booking" class="btn btn-dark btn-block" data-room-key="${room.room_key}">Book This Room</a>
          </div>
        `;
        grid.appendChild(card);
        io.observe(card);

        const opt = document.createElement('option');
        opt.value = room.room_key;
        opt.textContent = `${room.name} — \u20b1${room.price_per_night.toLocaleString()}/night`;
        select.appendChild(opt);
      });

      // Clicking "Book This Room" pre-selects that room in the booking form.
      grid.querySelectorAll('[data-room-key]').forEach((link) => {
        link.addEventListener('click', () => {
          select.value = link.dataset.roomKey;
        });
      });
    } catch (err) {
      console.error('Could not load rooms:', err);
      document.getElementById('room-grid').innerHTML =
        '<p>Room information is temporarily unavailable. Please check back shortly.</p>';
    }
  }

  loadRooms();
})();
