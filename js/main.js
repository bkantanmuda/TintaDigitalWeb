/* ============================================================
   TINTA DIGITAL — main.js
   1) FAQ accordion  2) Filter printable  3) Menu mobile
   4) Nav aktif + reveal on scroll  5) Form -> WhatsApp
   6) Back-to-top + tahun dinamis
   ============================================================ */
(function () {
  'use strict';

  var WA_NUMBER = '6281226099132';

  /* ---------- 1. FAQ accordion (satu terbuka) ---------- */
  var faqBtns = document.querySelectorAll('.faq-btn');
  faqBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isExpanded = btn.getAttribute('aria-expanded') === 'true';
      var content = btn.nextElementSibling;
      var icon = btn.querySelector('.material-symbols-outlined');

      faqBtns.forEach(function (other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          if (other.nextElementSibling) other.nextElementSibling.classList.add('hidden');
          var oi = other.querySelector('.material-symbols-outlined');
          if (oi) { oi.textContent = 'add'; oi.classList.remove('rotate-45'); }
        }
      });

      if (isExpanded) {
        btn.setAttribute('aria-expanded', 'false');
        if (content) content.classList.add('hidden');
        if (icon) { icon.textContent = 'add'; icon.classList.remove('rotate-45'); }
      } else {
        btn.setAttribute('aria-expanded', 'true');
        if (content) content.classList.remove('hidden');
        if (icon) { icon.textContent = 'close'; icon.classList.add('rotate-45'); }
      }
    });
  });

  /* ---------- 2. Filter katalog printable ---------- */
  var filterBtns = document.querySelectorAll('#printable-filter-group button');
  var cards = document.querySelectorAll('#printable-grid .printable-card');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) {
        b.classList.remove('bg-primary-container', 'text-on-primary');
        b.classList.add('bg-surface-container', 'text-on-surface-variant');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('bg-primary-container', 'text-on-primary');
      btn.classList.remove('bg-surface-container', 'text-on-surface-variant');
      btn.setAttribute('aria-pressed', 'true');

      var f = btn.getAttribute('data-filter');
      cards.forEach(function (card) {
        var cats = card.getAttribute('data-category') || '';
        var show = f === 'all' || cats.split(/\s+/).indexOf(f) !== -1 || cats.indexOf(f) !== -1;
        card.classList.toggle('hidden', !show);
      });
    });
  });

  /* ---------- 3. Menu mobile (hamburger) ---------- */
  var menuBtn = document.getElementById('menu-btn');
  var menuIcon = document.getElementById('menu-icon');
  var mobileMenu = document.getElementById('mobile-menu');
  function setMenu(open) {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.classList.toggle('hidden', !open);
    mobileMenu.classList.toggle('hidden-menu', !open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    if (menuIcon) menuIcon.textContent = open ? 'close' : 'menu';
    document.body.classList.toggle('overflow-hidden', false); // menu dropdown, body tetap scroll
  }
  if (menuBtn && mobileMenu) {
    mobileMenu.classList.add('hidden-menu');
    menuBtn.addEventListener('click', function () {
      setMenu(mobileMenu.classList.contains('hidden'));
    });
    mobileMenu.querySelectorAll('.mobile-link').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* ---------- 4. Nav aktif + reveal on scroll ---------- */
  var navLinks = document.querySelectorAll('a[data-nav]');
  var sections = ['beranda', 'layanan', 'printable', 'portofolio', 'tentang', 'faq', 'pesan']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (a) {
            a.classList.toggle('nav-active', a.getAttribute('data-nav') === en.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(function (s) { navObs.observe(s); });

    // Reveal: kartu & judul muncul halus saat scroll
    var revealTargets = document.querySelectorAll(
      '#layanan .group, #tentang .group, #landing-page-showcase .grid > div, ' +
      '#printable-grid .printable-card, #portofolio .group, #faq-accordion-group > div'
    );
    revealTargets.forEach(function (el) { el.classList.add('reveal'); });
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('revealed'); revObs.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { revObs.observe(el); });
  }

  /* ---------- 5. Form cepat -> WhatsApp ---------- */
  var form = document.getElementById('order-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nama = (document.getElementById('order-nama') || {}).value || '';
      var kebutuhan = (document.getElementById('order-kebutuhan') || {}).value || '';
      var pesan = (document.getElementById('order-pesan') || {}).value || '';
      var err = document.getElementById('order-error');
      nama = nama.trim(); pesan = pesan.trim();
      var valid = nama.length > 1 && pesan.length > 3;
      if (err) err.classList.toggle('hidden', valid);
      if (!valid) return;
      var text = 'Halo TINTA DIGITAL! Saya ' + nama +
        ' (' + kebutuhan + '). ' + pesan;
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  }

  /* ---------- 6. Back-to-top + tahun ---------- */
  var btt = document.getElementById('back-to-top');
  if (btt) {
    window.addEventListener('scroll', function () {
      btt.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });
    btt.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
