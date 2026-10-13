/* ═══ Script Block 1 ═══ */
/* ── Project Gallery Modal (Scroll View) ── */
    function openGallery(title, specsEncoded, galleryEncoded) {
      try {
        const specs = JSON.parse(decodeURIComponent(specsEncoded));
        const gallery = JSON.parse(decodeURIComponent(galleryEncoded));

        document.getElementById('modalTitle').textContent = title;

        const specLabels = {
          category: 'Project Type', status: 'Project Status',
          built_up_area: 'Built-Up Area', site_area: 'Site Area',
          towers: 'No. of Towers', units: 'No. of Units',
          unit_type: 'Unit Type', total_sqft: 'Total Sqft',
          budget: 'Budget', location: 'Location',
          special_features: 'Special Features'
        };

        let specHtml = '';
        Object.keys(specLabels).forEach(function (k) {
          if (specs[k]) {
            specHtml += '<div class="pm-spec">'
              + '<span class="pm-spec-label">' + specLabels[k] + '</span>'
              + '<span class="pm-spec-val">' + specs[k] + '</span>'
              + '</div>';
          }
        });
        document.getElementById('modalSpecs').innerHTML = specHtml;

        let mediaHtml = '';
        gallery.forEach(function (item, idx) {
          const rawUrl = item.video || item.image || '';
          const ytMatch = rawUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([\w\-]{11})/i);
          const ytId = ytMatch ? ytMatch[1] : null;

          let inner = '';
          if (ytId) {
            const autoplay = idx === 0 ? '&autoplay=1&mute=1' : '';
            inner = '<iframe src="https://www.youtube.com/embed/' + ytId + '?rel=0&modestbranding=1' + autoplay + '" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>';
          } else if (item.video && !item.image) {
            const autoplay = idx === 0 ? 'autoplay muted' : '';
            inner = '<video src="' + encodeURI(item.video) + '" controls loop playsinline ' + autoplay + '></video>';
          } else if (item.image) {
            inner = '<img src="' + encodeURI(item.image) + '" alt="" loading="lazy" onerror="this.style.opacity=0.3">';
          }

          if (inner) {
            let capHtml = item.caption ? '<div class="pm-caption">' + item.caption + '</div>' : '';
            mediaHtml += '<div class="pm-slide">' + inner + capHtml + '</div>';
          }
        });
        document.getElementById('modalMainMedia').innerHTML = mediaHtml;

        document.getElementById('projectModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
      } catch (e) {
        console.error('openGallery error:', e);
      }
    }

    function closeGallery() {
      document.getElementById('projectModal').style.display = 'none';
      document.body.style.overflow = '';
      document.getElementById('modalMainMedia').innerHTML = '';
    }

    document.getElementById('projectModal').addEventListener('click', function (e) {
      if (e.target === this || e.target.classList.contains('pm-wrap') || e.target.classList.contains('pm-left')) {
        closeGallery();
      }
    });

    document.addEventListener('keydown', function (e) {
      const m = document.getElementById('projectModal');
      if (m && m.style.display === 'block' && e.key === 'Escape') closeGallery();
    });

/* ═══ Script Block 2 ═══ */
window.addEventListener('load', () => { setTimeout(() => { document.getElementById('loader').classList.add('hide'); }, 1800); });
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursorRing');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px';
      cursor.classList.add('visible'); ring.classList.add('visible');
    });
    document.addEventListener('mouseleave', () => { cursor.classList.remove('visible'); ring.classList.remove('visible'); });
    function animateRing() { ringX += (mouseX - ringX) * 0.12; ringY += (mouseY - ringY) * 0.12; ring.style.left = ringX + 'px'; ring.style.top = ringY + 'px'; requestAnimationFrame(animateRing); }
    animateRing();
    document.querySelectorAll('a, button, .proj-card, .service-card').forEach(el => { el.addEventListener('mouseenter', () => { cursor.style.width = '20px'; cursor.style.height = '20px'; ring.style.width = '60px'; ring.style.height = '60px'; }); el.addEventListener('mouseleave', () => { cursor.style.width = '8px'; cursor.style.height = '8px'; ring.style.width = '36px'; ring.style.height = '36px'; }); });
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 50); });
    const observer = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } }); }, { threshold: 0.12 });
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', () => { let current = ''; sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) current = s.id; }); navLinks.forEach(a => { a.classList.remove('active'); if (a.getAttribute('href') === '#' + current) a.classList.add('active'); }); });
    document.getElementById('hamburger').addEventListener('click', () => document.getElementById('mobileMenu').classList.add('open'));
    document.getElementById('mobileClose').addEventListener('click', () => document.getElementById('mobileMenu').classList.remove('open'));
    function closeMobile() { document.getElementById('mobileMenu').classList.remove('open'); }
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter').toLowerCase();
        document.querySelectorAll('.cms-proj-card').forEach(card => {
          const cardCat = (card.getAttribute('data-cat') || '').toLowerCase();
          if (filter === 'all' || cardCat === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
    function handleSubmit(e) {
      e.preventDefault();

      /* ── helpers ── */
      function setValid(fgId) {
        const fg = document.getElementById(fgId);
        fg.classList.remove('has-error');
        fg.classList.add('is-valid');
      }
      function setError(fgId) {
        const fg = document.getElementById(fgId);
        fg.classList.remove('is-valid');
        fg.classList.add('has-error');
      }
      function clearState(fgId) {
        const fg = document.getElementById(fgId);
        fg.classList.remove('has-error', 'is-valid');
      }

      /* ── validate name ── */
      const name = document.getElementById('inp-name').value.trim();
      if (name.length < 2) { setError('fg-name'); } else { setValid('fg-name'); }

      /* ── validate phone: exactly 10 digits ── */
      const phone = document.getElementById('inp-phone').value.trim();
      const phoneOk = /^\d{10}$/.test(phone);
      if (!phoneOk) { setError('fg-phone'); } else { setValid('fg-phone'); }

      /* ── validate email: must have @ and end with .com ── */
      const email = document.getElementById('inp-email').value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.com$/i.test(email);
      if (!emailOk) { setError('fg-email'); } else { setValid('fg-email'); }

      /* ── if all pass, show success ── */
      const allOk = name.length >= 2 && phoneOk && emailOk;
      if (allOk) {
        const service = document.getElementById('inp-service').value.trim();
        const loc = document.getElementById('inp-location').value.trim();
        const details = document.getElementById('inp-details').value.trim();

        let message = `Hello G Architects!\n\nI would like to make an enquiry.\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Email:* ${email}`;
        if (service) message += `\n*Project Type:* ${service}`;
        if (loc) message += `\n*Location:* ${loc}`;
        if (details) message += `\n*Details:* ${details}`;

        const waUrl = `https://wa.me/919989991429?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');

        const btn = e.target.querySelector('.btn-submit');
        btn.textContent = 'Redirecting to WhatsApp...';
        btn.style.background = '#2a9d8f';
        setTimeout(() => {
          btn.textContent = 'Send Enquiry →';
          btn.style.background = '';
          ['fg-name', 'fg-phone', 'fg-email'].forEach(clearState);
          e.target.reset();
        }, 3000);
      }
    }

    /* ── live validation on phone: allow only digits, max 10 ── */
    document.addEventListener('DOMContentLoaded', function () {
      const phoneInp = document.getElementById('inp-phone');
      if (phoneInp) {
        phoneInp.addEventListener('input', function () {
          this.value = this.value.replace(/\D/g, '').slice(0, 10);
          const fg = document.getElementById('fg-phone');
          if (this.value.length === 0) {
            fg.classList.remove('has-error', 'is-valid');
          } else if (this.value.length === 10) {
            fg.classList.remove('has-error'); fg.classList.add('is-valid');
          } else {
            fg.classList.remove('is-valid'); fg.classList.add('has-error');
            document.getElementById('err-phone').textContent = this.value.length + '/10 digits entered.';
          }
        });
        phoneInp.addEventListener('keypress', function (e) {
          if (!/[0-9]/.test(e.key)) e.preventDefault();
        });
      }

      /* ── live validation on email ── */
      const emailInp = document.getElementById('inp-email');
      if (emailInp) {
        emailInp.addEventListener('blur', function () {
          const val = this.value.trim();
          if (!val) return;
          const fg = document.getElementById('fg-email');
          if (/^[^\s@]+@[^\s@]+\.com$/i.test(val)) {
            fg.classList.remove('has-error'); fg.classList.add('is-valid');
          } else {
            fg.classList.remove('is-valid'); fg.classList.add('has-error');
          }
        });
      }
    });
    setTimeout(() => { document.querySelectorAll('.hero-content .reveal, .hero-content .reveal-left, .hero-content .reveal-right').forEach(el => el.classList.add('visible')); }, 1900);

/* ═══ Script Block 3 ═══ */
if (window.netlifyIdentity) {
      window.netlifyIdentity.on('init', function (user) {
        if (!user) {
          window.netlifyIdentity.on('login', function () {
            document.location.href = '/admin/';
          });
        }
      });
    }

/* ═══ Script Block 4 ═══ */
// Testimonials horizontal scroll
    function scrollTesti(dir) {
      const grid = document.getElementById('reviews-dynamic-grid');
      if (!grid) return;
      const card = grid.querySelector('.testi-card');
      const scrollAmt = card ? card.offsetWidth + 32 : 400;
      grid.scrollBy({ left: dir * scrollAmt, behavior: 'smooth' });
    }

    // Blog horizontal scroll
    function scrollBlog(dir) {
      const grid = document.getElementById('blog-dynamic-grid');
      if (!grid) return;
      const card = grid.querySelector('.blog-card');
      const scrollAmt = card ? card.offsetWidth + 32 : 380;
      grid.scrollBy({ left: dir * scrollAmt, behavior: 'smooth' });
    }

    // Blog auto-scroll every 5 seconds
    (function startBlogAutoScroll() {
      const grid = document.getElementById('blog-dynamic-grid');
      if (!grid) return;
      let timer = setInterval(function () {
        const maxScroll = grid.scrollWidth - grid.clientWidth;
        if (grid.scrollLeft >= maxScroll - 10) {
          grid.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollBlog(1);
        }
      }, 5000);
      grid.addEventListener('mouseenter', function () { clearInterval(timer); });
      grid.addEventListener('mouseleave', function () {
        timer = setInterval(function () {
          const maxScroll = grid.scrollWidth - grid.clientWidth;
          if (grid.scrollLeft >= maxScroll - 10) {
            grid.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollBlog(1);
          }
        }, 5000);
      });
    })();

/* ═══ Script Block 5 ═══ */
// Mobile menu links — close menu on click
    document.querySelectorAll('.mobile-nav-link').forEach(function(link) {
      link.addEventListener('click', closeMobile);
    });

    // Testimonial scroll buttons
    var testiPrev = document.getElementById('testi-prev');
    var testiNext = document.getElementById('testi-next');
    if (testiPrev) testiPrev.addEventListener('click', function() { scrollTesti(-1); });
    if (testiNext) testiNext.addEventListener('click', function() { scrollTesti(1); });

    // Blog scroll buttons
    var blogPrev = document.getElementById('blog-prev');
    var blogNext = document.getElementById('blog-next');
    if (blogPrev) blogPrev.addEventListener('click', function() { scrollBlog(-1); });
    if (blogNext) blogNext.addEventListener('click', function() { scrollBlog(1); });

    // Gallery modal close button
    var pmClose = document.querySelector('.pm-close');
    if (pmClose) pmClose.addEventListener('click', closeGallery);

