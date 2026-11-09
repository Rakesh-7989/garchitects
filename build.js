const fs = require('fs');
const path = require('path');
const marked = require('./js/vendor/marked.min.js');

const collections = ['articles', 'projects', 'services', 'reviews'];
const baseDir = path.join(__dirname, 'content');

console.log("Generating manifest files...");

for (const col of collections) {
  const dir = path.join(baseDir, col);
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    continue;
  }

  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .sort();

  const manifestPath = path.join(dir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2));
  console.log(`Updated ${manifestPath} with ${files.length} items.`);
}

// ═══ STATIC ARTICLE GENERATOR ═══
function parseFrontMatter(raw) {
  const meta = {};
  let body = raw;
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta, body };
  body = match[2];

  match[1].split(/\r?\n/).forEach(line => {
    const colon = line.indexOf(':');
    if (colon === -1) return;
    const key = line.slice(0, colon).trim();
    let val = line.slice(colon + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    meta[key] = val;
  });
  return { meta, body };
}

const articlesDir = path.join(__dirname, 'articles');
if (!fs.existsSync(articlesDir)) {
  fs.mkdirSync(articlesDir, { recursive: true });
}

const articlesContentDir = path.join(baseDir, 'articles');
if (fs.existsSync(articlesContentDir)) {
  const articleFiles = fs.readdirSync(articlesContentDir).filter(f => f.endsWith('.md'));
  console.log(`Generating ${articleFiles.length} static article pages...`);

  const sitemapUrls = [
    'https://garchitects.in/',
    'https://garchitects.in/articles.html'
  ];

  articleFiles.forEach(file => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(articlesContentDir, file), 'utf8');
    const { meta, body } = parseFrontMatter(raw);

    const title = meta.title || 'Design Journal | G Architects';
    const excerpt = meta.excerpt || 'Insights and perspectives from G Architects studio.';
    const category = meta.category || 'Architecture';
    const author = meta.author || 'G Architects Team';
    const image = meta.featured_image || '/images1/uploads/COMPANY%20LOGO.png';
    const dateStr = meta.date ? new Date(meta.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
    const wordCount = body.trim().split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min read';

    const contentHtml = marked.parse(body);

    const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | G Architects</title>
  <meta name="description" content="${excerpt.replace(/"/g, '&quot;')}">
  <link rel="canonical" href="https://garchitects.in/articles/${slug}.html">
  <meta property="og:title" content="${title.replace(/"/g, '&quot;')} | G Architects">
  <meta property="og:description" content="${excerpt.replace(/"/g, '&quot;')}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://garchitects.in/articles/${slug}.html">
  <meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}">
  <meta name="twitter:description" content="${excerpt.replace(/"/g, '&quot;')}">
  <meta name="twitter:image" content="${image}">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#C9A96E">
  <link rel="stylesheet" href="/fonts/fonts.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${title.replace(/"/g, '\\"')}",
    "description": "${excerpt.replace(/"/g, '\\"')}",
    "image": "${image}",
    "author": {
      "@type": "Organization",
      "name": "${author}"
    },
    "publisher": {
      "@type": "Organization",
      "name": "G Architects",
      "logo": {
        "@type": "ImageObject",
        "url": "https://garchitects.in/images1/uploads/COMPANY%20LOGO.png"
      }
    },
    "datePublished": "${meta.date || ''}"
  }
  </script>
  <style>
    :root {
      --black: #080808; --charcoal: #111111; --dark: #1A1A1A; --mid: #2C2C2C;
      --gold: #C9A96E; --gold-light: #E2C998; --cream: #F5F0E8; --white: #FAFAF8;
      --text-muted: #999990; --border: rgba(201,169,110,0.2); --nav-h: 80px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; font-size: 16px; }
    body { font-family: 'Jost', sans-serif; background: var(--black); color: var(--cream); overflow-x: hidden; line-height: 1.8; }
    a { text-decoration: none; color: inherit; transition: color 0.2s; }
    a:hover { color: var(--gold); }
    h1,h2,h3,h4 { font-family: 'Cormorant Garamond', serif; font-weight: 300; line-height: 1.2; color: var(--white); }

    /* NAV */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      height: var(--nav-h); display: flex; align-items: center;
      justify-content: space-between; padding: 0 5vw;
      background: rgba(8,8,8,0.95); border-bottom: 1px solid var(--border);
      backdrop-filter: blur(10px);
    }
    .nav-logo-wrap { display: flex; align-items: center; gap: 12px; }
    .nav-logo-wrap img { height: 38px; width: auto; }
    .nav-logo-name { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 400; color: var(--white); }
    .nav-logo-name span { color: var(--gold); }
    .nav-logo-sub { font-family: 'Jost', sans-serif; font-size: 0.58rem; letter-spacing: 0.18em; color: var(--gold); text-transform: uppercase; }
    .nav-back { font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-muted); }
    .nav-back:hover { color: var(--gold); }

    /* CONTAINER */
    .article-wrap { max-width: 820px; margin: 0 auto; padding: calc(var(--nav-h) + 3rem) 5vw 5rem; }
    .article-header { margin-bottom: 2.5rem; }
    .article-meta-top { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem; flex-wrap: wrap; }
    .badge {
      display: inline-block; font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
      padding: 0.35rem 0.9rem; border: 1px solid var(--border); color: var(--gold);
      background: rgba(201,169,110,0.06); border-radius: 2px;
    }
    .read-time { font-size: 0.75rem; color: var(--text-muted); letter-spacing: 0.05em; }
    h1.article-title { font-size: clamp(2.2rem, 5vw, 3.6rem); margin-bottom: 1.2rem; font-weight: 300; }
    .article-excerpt { font-size: 1.15rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.5rem; font-weight: 300; border-left: 2px solid var(--gold); padding-left: 1.2rem; }
    .article-author-strip { display: flex; align-items: center; gap: 1rem; font-size: 0.8rem; color: var(--text-muted); padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.08); }
    .article-author-strip strong { color: var(--cream); font-weight: 400; }

    /* FEATURED IMAGE */
    .featured-image-wrap { margin: 2rem 0 3rem; border: 1px solid var(--border); border-radius: 4px; overflow: hidden; }
    .featured-image-wrap img { width: 100%; height: auto; display: block; max-height: 500px; object-fit: cover; }

    /* ARTICLE CONTENT */
    .article-body { font-size: 1.05rem; font-weight: 300; color: #D8D2C6; }
    .article-body h2 { font-size: clamp(1.6rem, 3.5vw, 2.3rem); margin: 2.8rem 0 1rem; color: var(--gold-light); border-bottom: 1px solid rgba(201,169,110,0.15); padding-bottom: 0.5rem; }
    .article-body h3 { font-size: 1.4rem; margin: 2rem 0 0.8rem; color: var(--white); }
    .article-body p { margin-bottom: 1.5rem; line-height: 1.85; }
    .article-body ul, .article-body ol { margin: 0 0 1.8rem 1.8rem; }
    .article-body li { margin-bottom: 0.6rem; line-height: 1.7; }
    .article-body blockquote { border-left: 3px solid var(--gold); padding: 1rem 1.5rem; margin: 2rem 0; background: var(--charcoal); font-style: italic; color: var(--cream); }
    .article-body hr { border: none; border-top: 1px solid var(--border); margin: 3rem 0; }
    .article-body a { color: var(--gold); text-decoration: underline; text-underline-offset: 4px; }

    /* CTA BOX */
    .cta-box {
      margin-top: 4rem; padding: 2.5rem; background: var(--charcoal);
      border: 1px solid var(--border); text-align: center; border-radius: 4px;
    }
    .cta-box h3 { font-size: 2rem; margin-bottom: 0.8rem; }
    .cta-box p { max-width: 500px; margin: 0 auto 1.8rem; font-size: 0.95rem; color: var(--text-muted); }
    .cta-actions { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }
    .btn-gold {
      display: inline-block; padding: 0.85rem 2rem; background: var(--gold); color: var(--black);
      font-size: 0.75rem; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 500;
      transition: background 0.3s; border-radius: 2px;
    }
    .btn-gold:hover { background: var(--gold-light); color: var(--black); }
    .btn-outline {
      display: inline-block; padding: 0.85rem 2rem; background: transparent; color: var(--cream);
      border: 1px solid var(--border); font-size: 0.75rem; letter-spacing: 0.18em; text-transform: uppercase;
      transition: all 0.3s; border-radius: 2px;
    }
    .btn-outline:hover { border-color: var(--gold); color: var(--gold); }

    /* FOOTER */
    footer {
      border-top: 1px solid var(--border); padding: 3rem 5vw; text-align: center;
      font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between;
      align-items: center; flex-wrap: wrap; gap: 1rem;
    }
  </style>
</head>
<body>

  <!-- NAV -->
  <nav id="navbar">
    <a href="/index.html" class="nav-logo-wrap">
      <img src="/images1/uploads/COMPANY%20LOGO.png" alt="G Architects Logo">
      <div style="display:flex;flex-direction:column;line-height:1.2;">
        <span class="nav-logo-name"><span>G</span> Architects</span>
        <span class="nav-logo-sub">ARCHITECTURE &nbsp;|&nbsp; INTERIOR &nbsp;|&nbsp; LANDSCAPE</span>
      </div>
    </a>
    <a href="/articles.html" class="nav-back">← All Articles</a>
  </nav>

  <!-- MAIN ARTICLE -->
  <main class="article-wrap">
    <header class="article-header">
      <div class="article-meta-top">
        <span class="badge">${category}</span>
        <span class="read-time">${readTime}</span>
      </div>
      <h1 class="article-title">${title}</h1>
      ${excerpt ? `<p class="article-excerpt">${excerpt}</p>` : ''}
      <div class="article-author-strip">
        <span>By <strong>${author}</strong></span>
        ${dateStr ? `<span>•</span><span>${dateStr}</span>` : ''}
      </div>
    </header>

    ${meta.featured_image ? `
    <div class="featured-image-wrap">
      <img src="${meta.featured_image}" alt="${(meta.image_alt || title).replace(/"/g, '&quot;')}" loading="eager" onerror="this.parentElement.style.display='none'">
    </div>` : ''}

    <article class="article-body">
      ${contentHtml}
    </article>

    <div class="cta-box">
      <h3>Ready to Build Your Space?</h3>
      <p>Whether it's architectural design, luxury interiors, landscape planning, or turnkey site execution — talk to G Architects today.</p>
      <div class="cta-actions">
        <a href="https://wa.me/916374048059?text=Hello%20G%20Architects!%20I%20read%20your%20article%20'${encodeURIComponent(title)}'%20and%20would%20like%20to%20discuss%20a%20project." target="_blank" class="btn-gold">Chat on WhatsApp →</a>
        <a href="/index.html#contact" class="btn-outline">Enquire Online</a>
      </div>
    </div>
  </main>

  <footer>
    <p>© 2025 G Architects. All rights reserved. Architecture, Interior & Landscape Design Studio, Hyderabad.</p>
    <a href="/articles.html">← Back to Design Journal</a>
  </footer>

</body>
</html>`;

    fs.writeFileSync(path.join(articlesDir, `${slug}.html`), pageHtml, 'utf8');
    sitemapUrls.push(`https://garchitects.in/articles/${slug}.html`);
  });

  // Update sitemap.xml with all article URLs
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemapUrls.map(u => `  <url>\n    <loc>${u}</loc>\n    <changefreq>${u.includes('/articles/') ? 'monthly' : 'weekly'}</changefreq>\n    <priority>${u === 'https://garchitects.in/' ? '1.0' : '0.8'}</priority>\n  </url>`).join('\n') +
    `\n</urlset>\n`;
  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log(`Updated sitemap.xml with ${sitemapUrls.length} total URLs.`);
}

console.log("Build complete.");
