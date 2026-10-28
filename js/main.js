/* ============================================================
   TINTA DIGITAL — main.js
   1) FAQ accordion
   2) Dynamic Printable Catalog from Google Sheets API v4
   3) Menu mobile (hamburger)
   4) Nav aktif + reveal on scroll
   5) Form -> WhatsApp
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

  /* ---------- 2. Dynamic Printable Catalog from Google Sheets ---------- */
  var lastLoadedProducts = null;
  var isFetching = false;

  function formatPrice(harga) {
    if (harga === null || harga === undefined || harga === '') return '';
    var str = String(harga).trim();
    var digitsOnly = str.replace(/[^\d]/g, '');
    if (digitsOnly) {
      var num = parseInt(digitsOnly, 10);
      if (!isNaN(num)) {
        try {
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
          }).format(num);
        } catch (e) {
          return 'Rp ' + num.toLocaleString('id-ID');
        }
      }
    }
    return str;
  }

  function isValidUrl(string) {
    if (!string) return false;
    var str = String(string).trim();
    return /^https?:\/\//i.test(str) || /^Thumbnail\//i.test(str) || /^assets\//i.test(str);
  }

  function getFallbackThumbnail(nama) {
    var lower = String(nama || '').toLowerCase();
    if (lower.indexOf('a-z') !== -1) return 'Thumbnail/belajar huruf A-Z.jpg';
    if (lower.indexOf('hewan') !== -1 && lower.indexOf('huruf') !== -1) return 'Thumbnail/Belajar Huruf - Nama Hewan.jpg';
    if (lower.indexOf('pertambahan') !== -1 || lower.indexOf('pengurangan') !== -1 || lower.indexOf('berhitung') !== -1) return 'Thumbnail/Belajar Pertambahan dan Pengurangan.jpeg';
    if (lower.indexOf('perkalian') !== -1 || lower.indexOf('pembagian') !== -1) return 'Thumbnail/Belajar Perkalian dan Pembagian.jpeg';
    if (lower.indexOf('laut') !== -1) return 'Thumbnail/Mewarnai Hewan Laut.jpeg';
    if (lower.indexOf('bundle') !== -1 && (lower.indexOf('matematika') !== -1 || lower.indexOf('angka') !== -1)) return 'Thumbnail/Bundle Belajar Matematika.jpeg';
    if (lower.indexOf('bundle') !== -1) return 'Thumbnail/Bundle Belajar Menulis.jpeg';
    if (lower.indexOf('mewarnai') !== -1) return 'Thumbnail/Mewarnai Hewan Laut.jpeg';
    return 'Thumbnail/belajar huruf A-Z.jpg';
  }

  function parseGoogleSheetsRows(rows) {
    if (!rows || !rows.length) return [];

    var headers = (rows[0] || []).map(function (h) {
      return String(h || '').trim().toLowerCase();
    });

    var namaIdx = headers.indexOf('nama');
    var hargaIdx = headers.indexOf('harga');
    var sampulIdx = headers.indexOf('sampul');
    var linkIdx = headers.indexOf('link');
    var descIdx = headers.indexOf('deskripsi');
    var katIdx = headers.indexOf('kategori');
    var badgeIdx = headers.indexOf('badge');

    // Fallback column positions if standard headers aren't explicitly named
    if (namaIdx === -1) namaIdx = 1;
    if (hargaIdx === -1) hargaIdx = 2;
    if (sampulIdx === -1) sampulIdx = 3;
    if (linkIdx === -1) linkIdx = 4;

    var products = [];

    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if (!row || !row.length) continue;

      var rawNama = row[namaIdx] ? String(row[namaIdx]).trim() : '';
      if (!rawNama) continue; // Skip empty rows

      var rawHarga = hargaIdx !== -1 && row[hargaIdx] ? String(row[hargaIdx]).trim() : '';
      var rawSampul = sampulIdx !== -1 && row[sampulIdx] ? String(row[sampulIdx]).trim() : '';
      var rawLink = linkIdx !== -1 && row[linkIdx] ? String(row[linkIdx]).trim() : '';
      var rawDesc = descIdx !== -1 && row[descIdx] ? String(row[descIdx]).trim() : '';
      var rawKat = katIdx !== -1 && row[katIdx] ? String(row[katIdx]).trim() : '';
      var rawBadge = badgeIdx !== -1 && row[badgeIdx] ? String(row[badgeIdx]).trim() : '';

      var sampul = isValidUrl(rawSampul) ? rawSampul : getFallbackThumbnail(rawNama);

      var categoryTags = [];
      if (rawKat) {
        categoryTags = rawKat.toLowerCase().split(/[,\s]+/);
      } else {
        var lowerNama = rawNama.toLowerCase();
        if (lowerNama.indexOf('bundle') !== -1) categoryTags.push('bundle');
        if (lowerNama.indexOf('mewarnai') !== -1) categoryTags.push('mewarnai');
        if (lowerNama.indexOf('huruf') !== -1 || lowerNama.indexOf('menulis') !== -1 || lowerNama.indexOf('a-z') !== -1) categoryTags.push('huruf');
        if (lowerNama.indexOf('angka') !== -1 || lowerNama.indexOf('berhitung') !== -1 || lowerNama.indexOf('matematika') !== -1 || lowerNama.indexOf('pertambahan') !== -1 || lowerNama.indexOf('perkalian') !== -1) categoryTags.push('angka');
        if (lowerNama.indexOf('tracing') !== -1 || lowerNama.indexOf('menulis') !== -1 || lowerNama.indexOf('a-z') !== -1) categoryTags.push('tracing');
        if (categoryTags.length === 0) categoryTags.push('aktivitas');
      }

      var categoryLabel = 'Printable Anak';
      if (categoryTags.indexOf('bundle') !== -1 && categoryTags.indexOf('angka') !== -1) categoryLabel = 'Bundle & Angka';
      else if (categoryTags.indexOf('bundle') !== -1 && categoryTags.indexOf('tracing') !== -1) categoryLabel = 'Bundle & Tracing';
      else if (categoryTags.indexOf('tracing') !== -1 && categoryTags.indexOf('huruf') !== -1) categoryLabel = 'Tracing & Huruf';
      else if (categoryTags.indexOf('mewarnai') !== -1) categoryLabel = 'Mewarnai';
      else if (categoryTags.indexOf('huruf') !== -1) categoryLabel = 'Mengenal Huruf';
      else if (categoryTags.indexOf('angka') !== -1) categoryLabel = 'Mengenal Angka';

      var badge = rawBadge;
      if (!badge) {
        var lowerN = rawNama.toLowerCase();
        if (lowerN.indexOf('bundle') !== -1) badge = 'Paket Hemat';
        else if (lowerN.indexOf('a-z') !== -1) badge = 'Bestseller';
      }

      var desc = rawDesc;
      if (!desc) {
        var lN = rawNama.toLowerCase();
        if (lN.indexOf('a-z') !== -1) desc = 'Modul latihan interaktif tracing dan mengenal huruf A sampai Z lengkap untuk melatih motorik halus anak.';
        else if (lN.indexOf('hewan') !== -1 && lN.indexOf('huruf') !== -1) desc = 'Mengenal huruf alfabet dipadukan dengan nama dan gambar hewan lucu untuk mengasah kosa kata anak.';
        else if (lN.indexOf('pertambahan') !== -1 || lN.indexOf('pengurangan') !== -1 || lN.indexOf('berhitung') !== -1) desc = 'Lembar kerja berhitung pertambahan dan pengurangan dasar dengan visual interaktif yang mudah dipahami.';
        else if (lN.indexOf('perkalian') !== -1 || lN.indexOf('pembagian') !== -1) desc = 'Modul latihan dasar perkalian dan pembagian matematika untuk melatih logika dan pemahaman berhitung.';
        else if (lN.indexOf('mewarnai') !== -1) desc = 'Buku aktivitas mewarnai beraneka gambar lucu dengan garis tebal yang ramah untuk anak-anak.';
        else if (lN.indexOf('bundle') !== -1 && lN.indexOf('matematika') !== -1) desc = 'Paket hemat komplit belajar matematika anak, dari pengenalan angka, penjumlahan, hingga perkalian.';
        else if (lN.indexOf('bundle') !== -1) desc = 'Paket hemat komplit modul latihan menulis, tracing garis, dan mengenal huruf untuk kesiapan belajar anak.';
        else desc = 'Materi aktivitas edukatif kreatif yang dirancang penuh kasih untuk menstimulasi motorik halus dan imajinasi anak.';
      }

      var validLink = /^https?:\/\//i.test(rawLink) ? rawLink : '';

      products.push({
        id: row[0] || String(i),
        nama: rawNama,
        harga: rawHarga,
        formattedHarga: formatPrice(rawHarga),
        sampul: sampul,
        fallbackSampul: getFallbackThumbnail(rawNama),
        link: validLink,
        isValidLink: Boolean(validLink),
        categoryTags: categoryTags,
        categoryLabel: categoryLabel,
        badge: badge,
        deskripsi: desc
      });
    }

    return products;
  }

  function createProductCard(product) {
    var card = document.createElement('div');
    card.className = 'printable-card bg-surface-container-lowest rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between';
    card.setAttribute('data-category', product.categoryTags.join(' '));

    var topWrapper = document.createElement('div');
    topWrapper.className = 'space-y-4';

    var imgWrapper = document.createElement('div');
    imgWrapper.className = 'relative overflow-hidden rounded-lg aspect-[4/3] bg-surface-container';

    var img = document.createElement('img');
    img.className = 'w-full h-full object-cover';
    img.alt = product.nama + ' - Tinta Digital';
    img.src = product.sampul;
    img.loading = 'lazy';
    img.onerror = function () {
      if (this.src !== product.fallbackSampul) {
        this.src = product.fallbackSampul;
      }
    };

    imgWrapper.appendChild(img);

    if (product.badge) {
      var badgeSpan = document.createElement('span');
      badgeSpan.className = 'absolute top-3 left-3 bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-2.5 py-1 rounded-full shadow-sm font-bold';
      badgeSpan.textContent = product.badge;
      imgWrapper.appendChild(badgeSpan);
    }

    topWrapper.appendChild(imgWrapper);

    var textContent = document.createElement('div');

    var metaRow = document.createElement('div');
    metaRow.className = 'flex items-center justify-between gap-2';

    var catSpan = document.createElement('span');
    catSpan.className = 'font-label-sm text-label-sm text-secondary uppercase font-semibold';
    catSpan.textContent = product.categoryLabel;
    metaRow.appendChild(catSpan);

    if (product.formattedHarga) {
      var priceSpan = document.createElement('span');
      priceSpan.className = 'font-label-sm text-label-sm text-primary font-bold bg-surface-container-high px-2.5 py-0.5 rounded-full';
      priceSpan.textContent = product.formattedHarga;
      metaRow.appendChild(priceSpan);
    }

    textContent.appendChild(metaRow);

    var titleEl = document.createElement('h3');
    titleEl.className = 'font-title-md text-title-md text-primary font-bold mt-1.5';
    titleEl.textContent = product.nama;
    textContent.appendChild(titleEl);

    var descEl = document.createElement('p');
    descEl.className = 'font-body-sm text-body-sm text-on-surface-variant mt-1.5';
    descEl.textContent = product.deskripsi;
    textContent.appendChild(descEl);

    topWrapper.appendChild(textContent);
    card.appendChild(topWrapper);

    var btnWrapper = document.createElement('div');
    btnWrapper.className = 'pt-5 mt-4 flex items-center justify-end';

    if (product.isValidLink) {
      var linkBtn = document.createElement('a');
      linkBtn.className = 'inline-flex items-center gap-1.5 bg-primary-container text-on-primary font-label-lg text-label-lg px-4 py-2 rounded-lg hover:bg-primary transition-colors';
      linkBtn.href = product.link;
      linkBtn.target = '_blank';
      linkBtn.rel = 'noopener noreferrer';

      var btnText = document.createElement('span');
      btnText.textContent = 'Kunjungi Produk';

      var btnIcon = document.createElement('span');
      btnIcon.className = 'material-symbols-outlined text-[16px]';
      btnIcon.textContent = 'open_in_new';

      linkBtn.appendChild(btnText);
      linkBtn.appendChild(btnIcon);
      btnWrapper.appendChild(linkBtn);
    }

    card.appendChild(btnWrapper);
    return card;
  }

  function applyCurrentFilter() {
    var activeBtn = document.querySelector('#printable-filter-group button.bg-primary-container') ||
                    document.querySelector('#printable-filter-group button[data-filter="all"]');
    var f = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
    var currentCards = document.querySelectorAll('#printable-grid .printable-card');
    currentCards.forEach(function (card) {
      var cats = card.getAttribute('data-category') || '';
      var show = f === 'all' || cats.split(/\s+/).indexOf(f) !== -1 || cats.indexOf(f) !== -1;
      card.classList.toggle('hidden', !show);
    });
  }

  function showLoadingState() {
    var grid = document.getElementById('printable-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (var i = 0; i < 3; i++) {
      var skel = document.createElement('div');
      skel.className = 'bg-surface-container-lowest rounded-xl p-4 shadow-sm animate-pulse space-y-4';
      skel.innerHTML = '<div class="rounded-lg aspect-[4/3] bg-surface-container-high"></div>' +
        '<div class="h-4 bg-surface-container-high rounded w-1/3"></div>' +
        '<div class="h-6 bg-surface-container-high rounded w-3/4"></div>' +
        '<div class="h-12 bg-surface-container-high rounded w-full"></div>';
      grid.appendChild(skel);
    }
  }

  function showErrorState(msg) {
    var grid = document.getElementById('printable-grid');
    if (!grid) return;
    grid.innerHTML = '';
    var errBox = document.createElement('div');
    errBox.className = 'col-span-full p-8 text-center bg-surface-container-lowest rounded-xl shadow-sm space-y-3';

    var icon = document.createElement('span');
    icon.className = 'material-symbols-outlined text-[36px] text-error';
    icon.textContent = 'warning';
    errBox.appendChild(icon);

    var text = document.createElement('p');
    text.className = 'font-body-md text-body-md text-on-surface-variant max-w-md mx-auto';
    text.textContent = msg || 'Gagal memuat produk dari Google Sheets. Silakan periksa koneksi internet Anda.';
    errBox.appendChild(text);

    var retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.className = 'inline-flex items-center gap-2 bg-primary-container text-on-primary font-label-lg text-label-lg px-5 py-2.5 rounded-lg hover:bg-primary transition-colors mt-2';
    retryBtn.innerHTML = '<span>Coba Lagi</span><span class="material-symbols-outlined text-[18px]">refresh</span>';
    retryBtn.onclick = function () {
      fetchCatalogFromGoogleSheets();
    };
    errBox.appendChild(retryBtn);

    grid.appendChild(errBox);
  }

  function showEmptyState() {
    var grid = document.getElementById('printable-grid');
    if (!grid) return;
    grid.innerHTML = '';
    var emptyBox = document.createElement('div');
    emptyBox.className = 'col-span-full p-8 text-center bg-surface-container-lowest rounded-xl shadow-sm space-y-2';
    emptyBox.innerHTML = '<span class="material-symbols-outlined text-[36px] text-secondary">inventory_2</span>' +
      '<p class="font-body-md text-body-md text-on-surface-variant">Belum ada produk printable yang tersedia saat ini.</p>';
    grid.appendChild(emptyBox);
  }

  function renderCatalog(products) {
    var grid = document.getElementById('printable-grid');
    if (!grid) return;

    if (!products || !products.length) {
      showEmptyState();
      return;
    }

    grid.innerHTML = '';
    products.forEach(function (prod) {
      var cardEl = createProductCard(prod);
      grid.appendChild(cardEl);
    });

    applyCurrentFilter();

    if ('IntersectionObserver' in window) {
      var newCards = grid.querySelectorAll('.printable-card');
      newCards.forEach(function (el) { el.classList.add('reveal'); });
      var revObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('revealed');
            revObs.unobserve(en.target);
          }
        });
      }, { threshold: 0.1 });
      newCards.forEach(function (el) { revObs.observe(el); });
    }
  }

  function fetchCatalogFromGoogleSheets() {
    if (isFetching) return;
    isFetching = true;

    var cfg = window.GOOGLE_SHEETS_CONFIG || {};
    var spreadsheetId = cfg.spreadsheetId || '1eJ3JTVPHyv7I6VAxVVpdJVQ2yzyV26UD5MLGtcQdxSg';
    var sheetName = cfg.sheetName || 'Sheet1';
    var range = cfg.range || 'A1:Z100';
    var apiKey = cfg.apiKey || 'AIzaSyBW5fhgcToqT0Resjd0qJ3F9pIo-3ZbT5g';

    var url = 'https://sheets.googleapis.com/v4/spreadsheets/' +
              encodeURIComponent(spreadsheetId) +
              '/values/' + encodeURIComponent(sheetName + '!' + range) +
              '?key=' + encodeURIComponent(apiKey);

    if (!lastLoadedProducts) {
      showLoadingState();
    }

    fetch(url)
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Google Sheets API response status: ' + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        isFetching = false;
        var rows = data.values || [];
        var products = parseGoogleSheetsRows(rows);
        lastLoadedProducts = products;
        renderCatalog(products);
      })
      .catch(function (err) {
        isFetching = false;
        console.error('TINTA DIGITAL — Google Sheets Catalog Error:', err);
        if (!lastLoadedProducts) {
          showErrorState('Gagal memuat katalog produk dari Google Sheets.');
        }
      });
  }

  // Filter Pill Listeners
  var filterBtns = document.querySelectorAll('#printable-filter-group button');
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

      applyCurrentFilter();
    });
  });

  // Initial fetch on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchCatalogFromGoogleSheets);
  } else {
    fetchCatalogFromGoogleSheets();
  }

  // Auto-refresh periodically (60 seconds)
  var refreshMs = (window.GOOGLE_SHEETS_CONFIG && window.GOOGLE_SHEETS_CONFIG.refreshIntervalMs) || 60000;
  setInterval(fetchCatalogFromGoogleSheets, refreshMs);

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
    document.body.classList.toggle('overflow-hidden', false);
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

    var revealTargets = document.querySelectorAll(
      '#layanan .group, #tentang .group, #landing-page-showcase .grid > div, ' +
      '#portofolio .group, #faq-accordion-group > div'
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
