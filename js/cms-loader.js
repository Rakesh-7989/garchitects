/**
 * G Architects — CMS Content Loader  v2
 * ─────────────────────────────────────
 * Fetches Markdown content from /content/{collection}/*.md
 * (via manifest.json for fast discovery) and renders it into
 * four live sections of index.html — no build step required.
 *
 * Targets:
 *   #blog-dynamic-grid      Design Journal section
 *   #reviews-dynamic-grid   Client Testimonials section
 *   #projects-dynamic-grid  Portfolio CMS row (+ #cms-projects-row reveal)
 *
 * Skeleton loaders (#blog-skeleton, #reviews-skeleton) are removed
 * once real content has loaded.
 */

(function () {
  'use strict';

  /* ── Marked.js loader ─────────────────────────────────────────────── */

  let _markedReady = false;
  const _markedCallbacks = [];

  function withMarked(cb) {
    if (_markedReady) return cb();
    _markedCallbacks.push(cb);
    if (_markedCallbacks.length > 1) return;
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/marked@9/marked.min.js';
    s.onload = function () {
      _markedReady = true;
      _markedCallbacks.forEach(fn => fn());
      _markedCallbacks.length = 0;
    };
    document.head.appendChild(s);
  }

  /* ── Front-matter parser ──────────────────────────────────────────── */

  function parseFrontMatter(raw) {
    const meta = {};
    let body   = raw;
    const m    = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) return { meta, body };
    body = m[2];

    try {
      if (window.jsyaml) {
        return { meta: window.jsyaml.load(m[1]) || {}, body };
      }
    } catch (e) {
      console.warn('js-yaml failed, falling back to manual parser', e);
    }

    const lines = m[1].split(/\r?\n/);
    let i = 0;
    while (i < lines.length) {
      const line  = lines[i];
      const colon = line.indexOf(':');
      if (colon === -1) { i++; continue; }

      const key = line.slice(0, colon).trim();
      let   val = line.slice(colon + 1).trim();

      // Read indented continuation lines
      while (i + 1 < lines.length && !lines[i + 1].includes(':') && !lines[i + 1].trim().startsWith('-') && lines[i + 1].startsWith(' ')) {
        val += ' ' + lines[i + 1].trim();
        i++;
      }

      if (val.startsWith('[')) {
        meta[key] = val.slice(1, val.lastIndexOf(']'))
          .split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
        i++; continue;
      }

      if (val === '' && i + 1 < lines.length && lines[i + 1].trim().startsWith('-')) {
        const arr = [];
        i++;
        while (i < lines.length && lines[i].trim().startsWith('-')) {
          let itemVal = lines[i].trim().slice(1).trim().replace(/^["']|["']$/g, '');
          // Array item continuation lines
          while (i + 1 < lines.length && !lines[i + 1].includes(':') && !lines[i + 1].trim().startsWith('-') && lines[i + 1].startsWith(' ')) {
            itemVal += ' ' + lines[i + 1].trim();
            i++;
          }
          // If it's a key-value object in the array (e.g. - image: url)
          const objColon = itemVal.indexOf(':');
          if (objColon !== -1 && !itemVal.startsWith('http')) {
            const objKey = itemVal.slice(0, objColon).trim();
            const objVal = itemVal.slice(objColon + 1).trim();
            const obj = {};
            obj[objKey] = objVal;
            // Hacky fallback for manual parser array objects
            if (i + 1 < lines.length && lines[i + 1].trim().startsWith('caption:')) {
               obj.caption = lines[i+1].slice(lines[i+1].indexOf(':')+1).trim();
               i++;
            }
            arr.push(obj);
          } else {
            arr.push(itemVal);
          }
          i++;
        }
        meta[key] = arr;
        continue;
      }

      val = val.replace(/^["']|["']$/g, '');
      if      (val === 'true')  val = true;
      else if (val === 'false') val = false;
      else if (val !== '' && !isNaN(Number(val))) val = Number(val);

      meta[key] = val;
      i++;
    }
    return { meta, body };
  }

  /* ── Fetch helpers ────────────────────────────────────────────────── */

  async function fetchText(url) {
    try {
      const r = await fetch(url);
      return r.ok ? r.text() : null;
    } catch { return null; }
  }

  async function fetchCollection(collection, fallback) {
    let files = fallback || [];
    try {
      // Add cache-busting timestamp to prevent stale manifests
      const r = await fetch('/content/' + collection + '/manifest.json?t=' + Date.now());
      if (r.ok) files = await r.json();
    } catch { /* use fallback */ }

    const results = await Promise.all(
      files.map(f =>
        fetchText('/content/' + collection + '/' + f + '?t=' + Date.now())
          .then(text => text ? { filename: f, ...parseFrontMatter(text) } : null)
      )
    );
    return results.filter(Boolean);
  }

  /* ── Scroll-reveal wiring ─────────────────────────────────────────── */

  function getObserver() {
    if (window._gaObserver) return window._gaObserver;
    const obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    window._gaObserver = obs;
    return obs;
  }

  function observeReveals(container) {
    const obs = getObserver();
    container.querySelectorAll('.reveal, .reveal-left, .reveal-right')
      .forEach(function(el) { obs.observe(el); });
  }

  /* ── Skeleton removal ─────────────────────────────────────────────── */

  function removeSkeleton(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  /* ════════════════════════════════════════════════════════════════════
     RENDERER — BLOG / ARTICLES
     Target: #blog-dynamic-grid
  ════════════════════════════════════════════════════════════════════ */

  async function renderBlog() {
    const grid = document.getElementById('blog-dynamic-grid');
    if (!grid) return;

    const fallback = ['2025-01-15-the-art-of-designing-a-modern-villa.md'];
    const items    = await fetchCollection('articles', fallback);
    const live     = items
      .filter(function(i) { return i.meta.published !== false; })
      .sort(function(a, b) { return new Date(b.meta.date || 0) - new Date(a.meta.date || 0); });

    removeSkeleton('blog-skeleton');

    if (!live.length) {
      grid.innerHTML = '<p style="color:#666;padding:2rem 0;">No articles published yet.</p>';
      return;
    }

    const delays = ['delay-1', 'delay-2', 'delay-3'];

    grid.innerHTML = live.map(function(item, i) {
      const m    = item.meta;
      const slug = item.filename.replace(/\.md$/, '');
      const date = m.date
        ? new Date(m.date).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })
        : '';

      const imgEl = m.featured_image
        ? '<div class="blog-card-img" style="background-image:url(\'' + m.featured_image + '\')"></div>'
        : '<div class="blog-card-img blog-card-img--placeholder"></div>';

      return [
        '<article class="blog-card reveal ' + delays[i % 3] + '" data-category="' + (m.category || '') + '">',
          '<a href="/articles/' + slug + '.html">',
            imgEl,
            '<div class="blog-card-body">',
              '<span class="label">' + (m.category || 'Design Journal') + '</span>',
              '<h3 class="blog-card-title">' + (m.title || '') + '</h3>',
              '<p class="blog-card-excerpt">' + (m.excerpt || '') + '</p>',
              '<div class="blog-card-meta">',
                '<span class="blog-card-author">' + (m.author || 'G Architects') + '</span>',
                date ? '<span class="blog-card-date">' + date + '</span>' : '',
              '</div>',
            '</div>',
          '</a>',
        '</article>'
      ].join('');
    }).join('');

    observeReveals(grid);
  }

  /* ════════════════════════════════════════════════════════════════════
     RENDERER — CLIENT REVIEWS / TESTIMONIALS
     Target: #reviews-dynamic-grid
     Uses .testi-card markup to match existing site CSS perfectly.
  ════════════════════════════════════════════════════════════════════ */

  async function renderReviews() {
    const grid = document.getElementById('reviews-dynamic-grid');
    if (!grid) return;

    withMarked(async function() {
      const fallback = ['rajesh-priya-mehta.md'];
      const items    = await fetchCollection('reviews', fallback);
      const live     = items
        .filter(function(i) { return i.meta.published !== false; })
        .sort(function(a, b) { return (a.meta.order || 99) - (b.meta.order || 99); });

      removeSkeleton('reviews-skeleton');

      if (!live.length) {
        grid.innerHTML = '<p style="color:#666;padding:2rem 0;">No reviews yet.</p>';
        return;
      }

      const delays = ['delay-1', 'delay-2', 'delay-3', 'delay-4'];

      grid.innerHTML = live.map(function(item, i) {
        const m        = item.meta;
        const bodyHtml = (window.marked ? window.marked.parse(item.body || '') : (item.body || ''))
          .replace(/<p>/g, '<p class="testi-text">');

        const initials = (m.client_name || 'C').split(/\s+/).map(function(w) { return w[0]; }).slice(0, 2).join('');
        const avatar   = m.photo
          ? '<img src="' + encodeURI(m.photo) + '" alt="' + (m.client_name || '') + '" onerror="this.style.display=\'none\';this.parentElement.textContent=\'' + initials + '\';">'
          : '<span>' + initials + '</span>';

        const starStr = '★'.repeat(Math.max(1, Math.min(5, m.rating || 5)));

        return [
          '<div class="testi-card reveal ' + delays[i % 4] + '">',
            '<div class="testi-stars">' + starStr + '</div>',
            '<div class="testi-quote">\u201C</div>',
            bodyHtml,
            '<div class="testi-author">',
              '<div class="testi-avatar">' + avatar + '</div>',
              '<div>',
                '<div class="testi-name">' + (m.client_name || '') + '</div>',
                m.project_type ? '<div class="testi-role">' + m.project_type + '</div>' : '',
              '</div>',
            '</div>',
          '</div>'
        ].join('');
      }).join('');

      observeReveals(grid);
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     RENDERER — PROJECTS
     Target: #projects-dynamic-grid + #cms-projects-row visibility
  ════════════════════════════════════════════════════════════════════ */

  async function renderProjects() {
    const grid = document.getElementById('projects-dynamic-grid');
    const row  = document.getElementById('cms-projects-row');
    if (!grid) return;

    const fallback = ['meridian-residence.md'];
    const items    = await fetchCollection('projects', fallback);
    const sorted   = items.sort(function(a, b) { return (a.meta.order || 99) - (b.meta.order || 99); });

    if (!sorted.length) return;

    if (row) row.style.display = '';

    const delays   = ['delay-1', 'delay-2', 'delay-3'];
    const catLabel = function(c) { return c ? c.charAt(0).toUpperCase() + c.slice(1) : ''; };

    grid.innerHTML = sorted.map(function(item, i) {
      const m   = item.meta;
      const bgStyle = m.cover_image ? 'background-image:url(\'' + encodeURI(m.cover_image) + '\')' : '';
      
      const safeTitle = encodeURIComponent(m.title || '').replace(/'/g, "%27");
      
      const specs = {
        category: catLabel(m.category),
        status: m.status,
        built_up_area: m.built_up_area,
        site_area: m.site_area,
        towers: m.towers,
        units: m.units,
        unit_type: m.unit_type,
        total_sqft: m.total_sqft,
        budget: m.budget,
        location: m.location,
        special_features: m.special_features
      };
      const safeSpecs = encodeURIComponent(JSON.stringify(specs)).replace(/'/g, "%27");
      
      let galleryArr = m.gallery || [];
      if (!galleryArr.length && m.cover_image) {
        galleryArr = [{ image: m.cover_image, caption: m.title }];
      }
      const safeGallery = encodeURIComponent(JSON.stringify(galleryArr)).replace(/'/g, "%27");
      
      const onClickStr = 'onclick="openGallery(decodeURIComponent(\'' + safeTitle + '\'), \'' + safeSpecs + '\', \'' + safeGallery + '\')"';

      return [
        '<div class="cms-proj-card reveal ' + delays[i % 3] + '" data-cat="' + (m.category || '') + '" ' + onClickStr + '>',
          '<div class="proj-img" style="' + bgStyle + '"></div>',
          '<div class="proj-info">',
            '<span class="label">' + catLabel(m.category) + '</span>',
            '<h3 class="proj-name">' + (m.title || '') + '</h3>',
            '<p class="proj-desc">' + (m.description || '') + '</p>',
            m.location ? '<span class="proj-location">' + m.location + (m.year ? ' · ' + m.year : '') + '</span>' : '',
          '</div>',
        '</div>'
      ].join('');
    }).join('');

    observeReveals(grid);
  }

  /* ── Init ─────────────────────────────────────────────────────────── */

  function init() {
    renderBlog();
    renderReviews();
    renderProjects();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
