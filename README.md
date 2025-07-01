# mdsite

A simple, modern static site template for Markdown content with a beautiful navbar and PDF export. Perfect for personal sites, documentation, or quick publishing on GitHub Pages.

## Features
- Write your content in Markdown (`content.md`)
- Clean, responsive design
- Modern navbar with contact links and PDF export
- Easy deployment (just static files)
- All styles in `mdsite.css` for easy customization
- **Reusable as a remote template via CDN**

## Usage
1. **Edit your content:**
   - Write your page in `content.md` using Markdown.
2. **Customize the navbar:**
   - Edit the contacts and PDF filename in the `<script>` block in `index.html`.
3. **Serve locally:**
   - Run a local server in the `mdsite` directory:
     ```
     python3 -m http.server
     ```
   - Open `http://localhost:8000` in your browser.
4. **Deploy:**
   - Upload the `mdsite` folder to your static host (e.g., GitHub Pages, Netlify, Vercel).

## Using mdsite.js as a Remote Module (CDN)
You can use `mdsite.js` directly from the CDN at `https://mdsite.daza.ar/mdsite.js` to build your own site with the same template and features, without copying the whole project.

### Example Usage
Import the module in your HTML (as an ES module):

```html
<script type="module">
  import { fetchAndRenderMarkdown, ensureMdsiteDependencies } from "https://mdsite.daza.ar/mdsite.js";
  import { DownloadPdfUtil } from "https://navbar.daza.ar/utils/downloadPdf.js";

  async function downloadPdf() {
    await DownloadPdfUtil.download({
      selector: ".terminal-window",
      filename: "mdsite-export.pdf",
    });
  }

  window.initDazaNavbar({
    showPdfButton: true,
    pdfCallback: downloadPdf,
    contacts: [
      { href: "mailto:your@email.com", icon: "fa-solid fa-envelope", label: "Email" },
      { href: "https://github.com/yourusername", icon: "fa-brands fa-github", label: "GitHub" },
      { href: "https://yourwebsite.com", icon: "fa-solid fa-globe", label: "Website" }
    ]
  });

  await ensureMdsiteDependencies();
  fetchAndRenderMarkdown({
    url: "content.md", // or any markdown file URL
    targetSelector: "#cv"
  });
</script>
```

- This approach is used by [cv.daza.ar](https://cv.daza.ar/) and [onepager.daza.ar](https://onepager.daza.ar/).
- You get all the features: Markdown rendering, sanitization, accessibility, PDF export, and a modern navbar.
- You can customize your content and contacts as needed.
- The default `index.html` in this repo now uses this CDN-based approach for consistency.

## File Structure
```
mdsite/
├── CNAME           # (optional) Custom domain for GitHub Pages
├── content.md      # Your Markdown content
├── index.html      # Main HTML file (now imports mdsite.js from CDN)
├── mdsite.css      # All custom styles
├── mdsite.js       # (optional) JS loader (not required for basic use)
└── README.md       # This file
```

## Credits
- [GitHub Markdown CSS](https://github.com/sindresorhus/github-markdown-css)
- [Font Awesome](https://fontawesome.com/)
- [jsPDF](https://github.com/parallax/jsPDF)
- [html2canvas](https://github.com/niklasvh/html2canvas)
- [marked](https://github.com/markedjs/marked)
- [Daza Navbar](https://navbar.daza.ar/)
- [mdsite.js CDN](https://mdsite.daza.ar/mdsite.js)

---

Happy publishing!
