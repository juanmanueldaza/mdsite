# mdsite

A universal loader and template for markdown-based static sites with a modern navbar and PDF export, designed for easy deployment and remote use (like https://mdsite.daza.ar).

## How to Use mdsite as a Remote Dependency

Add these lines to your HTML (in the `<head>` or before your closing `</body>`):

```html
<link rel="stylesheet" href="https://navbar.daza.ar/navbar.css" />
<script src="https://navbar.daza.ar/navbar.js"></script>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://navbar.daza.ar/utils/downloadPdf.js"></script>
<script>
  window.MdsiteConfig = {
    markdownUrl: 'https://yourdomain.com/yourfile.md',
    pdfFilename: 'your-export.pdf',
    contacts: [
      { href: 'mailto:your@email.com', icon: 'fa-solid fa-envelope', label: 'Email' },
      // ...
    ],
    title: 'Your Site Title',
    selector: '.terminal-window', // or your custom selector
    // Optional: markdownPreprocess: (md) => md.replace(...)
  };
</script>
<script src="https://mdsite.daza.ar/mdsite.js"></script>
```

Add a container in your HTML:

```html
<div id="navbar-container"></div>
<div class="terminal-window"></div>
```

## Features
- Write your content in Markdown
- Clean, responsive design
- Daza Navbar with customizable contacts and PDF export
- No build step: just edit and deploy
- Use as a template or as a remote loader

## For Template Users
- See `index.html` and `content.md` for a ready-to-fork example.

## Credits
- [Daza Navbar](https://navbar.daza.ar)
- [jsPDF](https://github.com/parallax/jsPDF)
- [html2canvas](https://github.com/niklasvh/html2canvas)
- [marked](https://github.com/markedjs/marked)

---
MIT License
