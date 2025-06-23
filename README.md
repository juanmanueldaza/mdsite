# mdsite

A simple, modern static site template for Markdown content with a beautiful navbar and PDF export. Perfect for personal sites, documentation, or quick publishing on GitHub Pages.

## Features
- Write your content in Markdown (`content.md`)
- Clean, responsive design
- Modern navbar with contact links and PDF export
- Easy deployment (just static files)
- All styles in `mdsite.css` for easy customization

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

## File Structure
```
mdsite/
├── CNAME           # (optional) Custom domain for GitHub Pages
├── content.md      # Your Markdown content
├── index.html      # Main HTML file
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

---

Happy publishing!
