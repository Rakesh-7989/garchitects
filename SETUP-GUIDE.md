# G Architects — Decap CMS Setup Guide

A step-by-step guide to deploy your CMS-enabled architecture website on Netlify.

---

## 📁 File Structure (add these to your project)

```
your-project/
├── index.html                    ← your existing site (modified — see Step 4)
├── articles.html                 ← new article listing page
├── netlify.toml                  ← Netlify configuration
├── _redirects                    ← Netlify redirects
│
├── admin/
│   ├── index.html                ← Decap CMS entry point
│   └── config.yml                ← CMS field definitions
│
├── content/
│   ├── articles/
│   │   ├── manifest.json         ← auto-updated file list
│   │   └── *.md                  ← your article files
│   ├── projects/
│   │   ├── manifest.json
│   │   └── *.md
│   ├── services/
│   │   ├── manifest.json
│   │   └── *.md
│   └── reviews/
│       ├── manifest.json
│       └── *.md
│
├── images/
│   └── uploads/                  ← CMS media uploads land here
│
├── js/
│   └── cms-loader.js             ← dynamic content renderer
│
└── netlify/
    └── functions/
        └── update-manifests.js   ← keeps manifests fresh
```

---

## ✅ Step 1 — Push to GitHub

1. Create a new GitHub repository (e.g. `g-architects-website`)
2. Push all your files including everything listed above
3. Keep the repository **public** (required for Netlify free plan + Decap CMS)
   - If you need private, upgrade to Netlify Pro or use OAuth

---

## ✅ Step 2 — Deploy on Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site → Import an existing project**
2. Connect your GitHub account
3. Select your repository
4. Build settings:
   - **Build command**: *(leave empty)*
   - **Publish directory**: `.` (a single dot — the root)
5. Click **Deploy site**

---

## ✅ Step 3 — Enable Netlify Identity

1. In your Netlify dashboard, go to **Site configuration → Identity**
2. Click **Enable Identity**
3. Under **Registration**, set to **Invite only** (recommended)
4. Under **Services → Git Gateway**, click **Enable Git Gateway**
   - This lets the CMS commit to your GitHub repo on your behalf

---

## ✅ Step 4 — Invite yourself as admin

1. In Netlify Identity → **Invite users**
2. Enter your email address
3. Check your email and accept the invite — set a password
4. You can now log in at `https://yoursite.netlify.app/admin`

---

## ✅ Step 5 — Add the Identity widget to index.html

Add this snippet **just before `</head>`** in your `index.html`:

```html
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
```

And add this **just before `</body>`** in your `index.html`:

```html
<script>
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
      if (!user) {
        window.netlifyIdentity.on("login", () => {
          document.location.href = "/admin/";
        });
      }
    });
  }
</script>
```

---

## ✅ Step 6 — Add dynamic sections to index.html

For each section you want CMS-managed, add the corresponding `id` to your HTML
and include `cms-loader.js` at the bottom of `<body>`.

### 1. Blog / Articles section
Replace your static blog grid markup with:
```html
<div id="blog-dynamic-grid">
  <!-- CMS articles appear here automatically -->
</div>
```

### 2. Projects Portfolio section
Replace your static projects grid with:
```html
<div id="projects-dynamic-grid">
  <!-- CMS projects appear here automatically -->
</div>
```

### 3. Services section
Replace your static services grid with:
```html
<div id="services-dynamic-grid">
  <!-- CMS services appear here automatically -->
</div>
```

### 4. Testimonials / Reviews section
Replace your static testimonials with:
```html
<div id="reviews-dynamic-grid">
  <!-- CMS reviews appear here automatically -->
</div>
```

### 5. Add the loader script
Just before `</body>` in index.html (after all other scripts):
```html
<script src="/js/cms-loader.js"></script>
```

---

## ✅ Step 7 — Connect your custom .com domain

1. Netlify dashboard → **Domain management → Add custom domain**
2. Enter your domain (e.g. `garchitects.com`)
3. Update your domain registrar DNS:
   - Add a **CNAME** record: `www` → `your-netlify-subdomain.netlify.app`
   - Or use Netlify DNS for automatic HTTPS (recommended)
4. Netlify auto-provisions a free SSL certificate via Let's Encrypt

---

## 🔑 Logging into the Admin Panel

Visit: `https://yourdomain.com/admin`

- Enter your email and password (set during the invite step)
- You'll see the full CMS dashboard with all 4 sections

---

## 📝 How Content Publishing Works

```
You write in CMS → Decap CMS commits .md to GitHub → Netlify auto-deploys → Site updates
```

With **Editorial Workflow** enabled (configured in `config.yml`):
- Content goes through **Draft → In Review → Ready** states
- Great for reviewing posts before they go live

Without it, content publishes immediately on save.

---

## 🖼️ Media / Image Uploads

- All images uploaded via the CMS land in `/images/uploads/`
- Supported formats: JPEG, PNG, WebP, SVG, GIF
- Recommended sizes:
  - Article featured images: **1200 × 630px**
  - Project covers: **900 × 600px**
  - Client photos: **200 × 200px** (square)

---

## 🔄 Keeping Manifests Updated (Important!)

The `cms-loader.js` reads `/content/{collection}/manifest.json` to know which
files to fetch. **Every time you add a new article/project/etc**, you must update
the corresponding manifest.json.

**Option A — Manual (simple):**
Edit `content/articles/manifest.json` and add your new filename:
```json
[
  "2025-01-15-the-art-of-designing-a-modern-villa.md",
  "2025-02-01-my-new-article.md"
]
```

**Option B — Automatic with Netlify Function:**
The included `netlify/functions/update-manifests.js` runs on deploy and
regenerates all manifests automatically.

To activate it, add to `netlify.toml`:
```toml
[functions]
  directory = "netlify/functions"

[[plugins]]
  package = "@netlify/plugin-functions-on-deploy"
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---|---|
| Admin redirects to login loop | Make sure Netlify Identity + Git Gateway are both enabled |
| CMS saves but site doesn't update | Check Netlify deploy log — auto-deploy must be enabled |
| Images not showing | Confirm `media_folder` in config.yml matches your actual uploads path |
| Content not appearing on site | Check that `manifest.json` lists your new `.md` filenames |
| 404 on /admin | Confirm `_redirects` file is in repo root and netlify.toml is present |

---

## 📋 Quick Reference — CMS Collections

| Collection | Folder | Controls |
|---|---|---|
| Articles / Blog | `content/articles/` | Blog posts, Design Journal |
| Projects Portfolio | `content/projects/` | Portfolio grid |
| Services | `content/services/` | Services section |
| Reviews | `content/reviews/` | Testimonials section |

---

*G Architects — Architecture & Interior Design Studio, Hyderabad*
