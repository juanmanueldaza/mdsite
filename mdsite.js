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
    console.debug('[mdsite] setTitle:', title);
  }

  function setupNavbar({ pdfFilename, contacts, selector, navbarOptions }) {
    if (!window.initDazaNavbar || !window.DownloadPdfUtil) {
      console.error('mdsite: Navbar or PDF utility not loaded');
      return;
    }
    console.debug('[mdsite] setupNavbar:', { pdfFilename, contacts, selector, navbarOptions });
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
    console.debug('[mdsite] renderMarkdown: fetching', markdownUrl);
    fetch(markdownUrl)
      .then(r => {
        console.debug('[mdsite] fetch response:', r);
        return r.text();
      })
      .then(md => {
        console.debug('[mdsite] markdown loaded:', md.slice(0, 100));
        if (typeof markdownPreprocess === 'function') md = markdownPreprocess(md);
        const el = document.querySelector(selector);
        if (el) {
          el.innerHTML = window.marked.parse(md);
          console.debug('[mdsite] markdown rendered to', selector);
        } else {
          console.error('mdsite: Selector not found:', selector);
        }
      })
      .catch(err => {
        console.error('[mdsite] Error fetching markdown:', err);
      });
  }

  window.mdsiteInit = function(userConfig = {}) {
    const config = { ...DEFAULTS, ...userConfig };
    console.debug('[mdsite] mdsiteInit config:', config);
    setTitle(config.title);
    setupNavbar(config);
    renderMarkdown(config);
  };

  // Auto-init if window.MdsiteConfig is present
  if (window.MdsiteConfig) {
    console.debug('[mdsite] Auto-initializing with window.MdsiteConfig:', window.MdsiteConfig);
    window.mdsiteInit(window.MdsiteConfig);
  }
})();
