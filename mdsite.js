// mdsite.js - Simple, clean loader for markdown-based static sites with Daza Navbar and PDF export
// Usage: window.mdsiteInit(config)

(function() {
  const DEFAULTS = {
    markdownUrl: 'content.md',
    pdfFilename: 'mdsite-export.pdf',
    contacts: [],
    selector: '.terminal-window',
    title: document.title,
    navbarOptions: {},
    markdownPreprocess: null
  };

  function setTitle(title) {
    if (title) document.title = title;
  }

  function setupNavbar({ pdfFilename, contacts, selector, navbarOptions }) {
    if (!window.initDazaNavbar || !window.DownloadPdfUtil) {
      console.error('mdsite: Navbar or PDF utility not loaded');
      return;
    }
    window.initDazaNavbar({
      showPdfButton: true,
      pdfCallback: () => window.DownloadPdfUtil.download({ selector, filename: pdfFilename }),
      contacts,
      ...navbarOptions
    });
  }

  function renderMarkdown({ markdownUrl, selector, markdownPreprocess }) {
    if (!window.marked) {
      console.error('mdsite: marked.js not loaded');
      return;
    }
    fetch(markdownUrl)
      .then(r => r.text())
      .then(md => {
        if (typeof markdownPreprocess === 'function') md = markdownPreprocess(md);
        const el = document.querySelector(selector);
        if (el) el.innerHTML = window.marked.parse(md);
        else console.error('mdsite: Selector not found:', selector);
      });
  }

  window.mdsiteInit = function(userConfig = {}) {
    const config = { ...DEFAULTS, ...userConfig };
    setTitle(config.title);
    setupNavbar(config);
    renderMarkdown(config);
  };

  // Auto-init if window.MdsiteConfig is present
  if (window.MdsiteConfig) window.mdsiteInit(window.MdsiteConfig);
})();
