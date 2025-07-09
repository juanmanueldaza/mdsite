// mdsite.js - Modern, Clean, SOLID-compliant markdown site generator
// Dependencies: marked, DOMPurify, jsPDF, html2canvas (loaded dynamically)

/**
 * Utility class for DOM operations
 */
class DOMUtils {
  static createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    Object.assign(element, attributes);
    if (content) element.textContent = content;
    return element;
  }

  static querySelector(selector) {
    return document.querySelector(selector);
  }

  static createStyleElement(css) {
    const style = document.createElement('style');
    style.textContent = css;
    return style;
  }

  static createLinkElement(href, rel = 'stylesheet') {
    const link = document.createElement('link');
    link.href = href;
    link.rel = rel;
    return link;
  }

  static createMetaElement(name, content) {
    const meta = document.createElement('meta');
    meta.name = name;
    meta.content = content;
    return meta;
  }

  static waitForDOM() {
    return new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
      } else {
        // Add small delay to ensure DOM is fully ready
        setTimeout(resolve, 10);
      }
    });
  }
}

/**
 * Script loader utility
 */
class ScriptLoader {
  static loadedScripts = new Set();

  static async loadScript(src, globalName = null) {
    if (this.loadedScripts.has(src)) {
      return;
    }

    if (globalName && window[globalName]) {
      this.loadedScripts.add(src);
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        this.loadedScripts.add(src);
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  static async loadStylesheet(href) {
    if (this.loadedScripts.has(href)) {
      return;
    }

    return new Promise((resolve, reject) => {
      const link = DOMUtils.createLinkElement(href);
      link.onload = () => {
        this.loadedScripts.add(href);
        resolve();
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }
}

/**
 * Dependency manager for external libraries
 */
class DependencyManager {
  static dependencies = {
    marked: 'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
    DOMPurify:
      'https://cdn.jsdelivr.net/npm/dompurify@3.0.8/dist/purify.min.js',
    jsPDF:
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    html2canvas:
      'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  };

  static stylesheets = {
    githubMarkdown:
      'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown.min.css',
    fontAwesome:
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    firaFont:
      'https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;700&display=swap',
    navbar: 'https://navbar.daza.ar/navbar.css',
    mdsite: 'https://mdsite.daza.ar/mdsite.css',
  };

  static async loadDependencies(deps = []) {
    const promises = deps.map(dep => {
      if (this.dependencies[dep]) {
        return ScriptLoader.loadScript(this.dependencies[dep], dep);
      }
      throw new Error(`Unknown dependency: ${dep}`);
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to load dependencies:', error);
      throw error;
    }
  }

  static async loadStylesheets(sheets = []) {
    const promises = sheets.map(sheet => {
      if (this.stylesheets[sheet]) {
        return ScriptLoader.loadStylesheet(this.stylesheets[sheet]);
      }
      throw new Error(`Unknown stylesheet: ${sheet}`);
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to load stylesheets:', error);
      throw error;
    }
  }
}

/**
 * PDF generation utility
 */
class PDFGenerator {
  static async generatePDF(options = {}) {
    const config = {
      selector: '.terminal-window',
      filename: 'document.pdf',
      scale: 1,
      quality: 0.8,
      format: 'a4',
      margin: 10,
      ...options,
    };

    await DependencyManager.loadDependencies(['jsPDF', 'html2canvas']);

    const element = DOMUtils.querySelector(config.selector);
    if (!element) {
      throw new Error(`Element not found: ${config.selector}`);
    }

    if (!window.html2canvas) {
      throw new Error('html2canvas library not loaded');
    }

    const canvas = await window.html2canvas(element, {
      scale: config.scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', config.quality);
    const pdf = this.createPDF(canvas, config);

    pdf.addImage(imgData, 'JPEG', ...this.calculateDimensions(canvas, config));
    pdf.save(config.filename);
  }

  static createPDF(canvas, config) {
    const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';

    if (window.jspdf?.jsPDF) {
      return new window.jspdf.jsPDF({
        orientation,
        unit: 'mm',
        format: config.format,
      });
    }

    if (window.jsPDF) {
      return new window.jsPDF({
        orientation,
        unit: 'mm',
        format: config.format,
      });
    }

    throw new Error('jsPDF not available');
  }

  static calculateDimensions(canvas, config) {
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const pxToMm = 0.264583;

    const availableWidth = pdfWidth - config.margin * 2;
    const availableHeight = pdfHeight - config.margin * 2;

    const ratio = Math.min(
      availableWidth / (canvas.width * pxToMm),
      availableHeight / (canvas.height * pxToMm)
    );

    const finalWidth = canvas.width * pxToMm * ratio;
    const finalHeight = canvas.height * pxToMm * ratio;
    const x = (pdfWidth - finalWidth) / 2;
    const y = config.margin;

    return [x, y, finalWidth, finalHeight];
  }
}

/**
 * Markdown renderer with sanitization
 */
class MarkdownRenderer {
  static async renderMarkdown(markdown, options = {}) {
    const config = {
      removeContactSection: false,
      targetSelector: '#content',
      ...options,
    };

    await DependencyManager.loadDependencies(['marked', 'DOMPurify']);

    if (!window.marked) {
      throw new Error('marked library not loaded');
    }

    if (!window.DOMPurify) {
      throw new Error('DOMPurify library not loaded');
    }

    let processedMarkdown = markdown;
    if (config.removeContactSection) {
      processedMarkdown = this.removeContactSection(processedMarkdown);
    }

    const html = window.marked.parse(processedMarkdown);
    const sanitizedHtml = window.DOMPurify.sanitize(html);

    const target = DOMUtils.querySelector(config.targetSelector);
    if (!target) {
      throw new Error(`Target element not found: ${config.targetSelector}`);
    }

    target.innerHTML = sanitizedHtml;
    this.enhanceAccessibility(target, config.targetSelector);
  }

  static removeContactSection(markdown) {
    const contactRegex = /## Contact[\s\S]*?---/;
    return markdown.replace(contactRegex, '---');
  }

  static enhanceAccessibility(element, selector) {
    element.setAttribute('tabindex', '0');
    element.setAttribute('role', 'main');
    element.setAttribute('aria-label', 'Markdown content');

    this.addSkipLink(selector);
  }

  static addSkipLink(selector) {
    if (DOMUtils.querySelector('.skip-link')) return;

    const skipLink = DOMUtils.createElement('a', {
      href: selector,
      className: 'skip-link',
      textContent: 'Skip to main content',
    });

    Object.assign(skipLink.style, {
      position: 'absolute',
      left: '-999px',
      top: 'auto',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      zIndex: '100',
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  static async fetchAndRender(url, options = {}) {
    const config = {
      errorMessage: 'Error loading content',
      ...options,
    };

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const markdown = await response.text();
      await this.renderMarkdown(markdown, config);
    } catch (error) {
      this.renderError(
        config.targetSelector,
        `${config.errorMessage}: ${error.message}`
      );
    }
  }

  static renderError(targetSelector, message) {
    const target = DOMUtils.querySelector(targetSelector);
    if (target) {
      target.innerHTML = `<div style="color: red; padding: 1em; border: 1px solid red; border-radius: 4px;">${message}</div>`;
      target.setAttribute('role', 'alert');
      target.setAttribute('tabindex', '0');
    }
  }
}

/**
 * Page structure generator
 */
class PageBuilder {
  static createBasicStructure(config) {
    const { showNavbar = true } = config;

    const html = `
      ${showNavbar ? '<div id="navbar-container"></div>' : ''}
      <div class="terminal-window">
        <article id="content" class="markdown-body terminal-body"></article>
      </div>
    `;

    document.body.innerHTML = html;
  }

  static async setupMetadata(config) {
    const {
      title = 'mdsite',
      description = 'A markdown-based site',
      author = 'Author',
      keywords = 'markdown, site',
    } = config;

    document.title = title;

    const metaTags = [
      { name: 'description', content: description },
      { name: 'author', content: author },
      { name: 'keywords', content: keywords },
    ];

    metaTags.forEach(({ name, content }) => {
      if (!DOMUtils.querySelector(`meta[name="${name}"]`)) {
        document.head.appendChild(DOMUtils.createMetaElement(name, content));
      }
    });

    // Add viewport if not present
    if (!DOMUtils.querySelector('meta[name="viewport"]')) {
      const viewport = DOMUtils.createMetaElement(
        'viewport',
        'width=device-width, initial-scale=1.0'
      );
      document.head.appendChild(viewport);
    }

    // Add favicon if not present
    if (!DOMUtils.querySelector('link[rel="icon"]')) {
      const favicon = DOMUtils.createLinkElement(
        'https://data.daza.ar/favicon/page.png',
        'icon'
      );
      favicon.type = 'image/png';
      document.head.appendChild(favicon);
    }
  }

  static injectCustomCSS(css) {
    if (css) {
      document.head.appendChild(DOMUtils.createStyleElement(css));
    }
  }
}

/**
 * Navbar integration
 */
class NavbarManager {
  static async initialize(config) {
    const {
      showPdfButton = true,
      pdfFilename = 'document.pdf',
      pdfSelector = '.terminal-window',
      contacts = [],
    } = config;

    // Ensure navbar script is loaded
    await ScriptLoader.loadScript(
      'https://navbar.daza.ar/navbar.js',
      'initDazaNavbar'
    );

    if (!window.initDazaNavbar) {
      throw new Error('Navbar library not loaded');
    }

    // Ensure container exists
    this.ensureNavbarContainer();

    // Initialize navbar
    window.initDazaNavbar({
      showPdfButton,
      pdfCallback: showPdfButton
        ? () =>
            NavbarManager.handlePdfDownload({
              filename: pdfFilename,
              selector: pdfSelector,
            })
        : null,
      contacts,
    });
  }

  static ensureNavbarContainer() {
    if (!DOMUtils.querySelector('#navbar-container')) {
      const container = DOMUtils.createElement('div', {
        id: 'navbar-container',
      });
      document.body.insertBefore(container, document.body.firstChild);
    }
  }

  static async handlePdfDownload(options) {
    try {
      await PDFGenerator.generatePDF(options);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF generation failed. Please try again.');
    }
  }
}

/**
 * Main application class
 */
class MdSite {
  constructor(config = {}) {
    this.config = {
      // Page configuration
      title: 'mdsite',
      description: 'A markdown-based site',
      author: 'Author',
      keywords: 'markdown, site',

      // Content configuration
      markdownUrl: null,
      targetSelector: '#content',
      removeContactSection: false,
      errorMessage: 'Error loading content',

      // Navbar configuration
      showNavbar: true,
      showPdfButton: true,
      pdfFilename: 'document.pdf',
      pdfSelector: '.terminal-window',
      contacts: [],

      // Styling configuration
      useTerminalStyle: true,
      customCSS: '',

      // External dependencies
      loadFontAwesome: true,
      loadGitHubMarkdownCSS: true,
      loadFiraMonoFont: true,

      ...config,
    };
  }

  async initialize() {
    try {
      await DOMUtils.waitForDOM();
      await this.setupPage();
      await this.loadResources();
      // Add small delay to ensure stylesheets are applied
      await new Promise(resolve => setTimeout(resolve, 100));
      await this.initializeComponents();

      console.log('mdsite initialized successfully');
    } catch (error) {
      console.error('Error initializing mdsite:', error);
      // Render error to page if possible
      this.renderInitializationError(error);
      throw error;
    }
  }

  async setupPage() {
    await PageBuilder.setupMetadata(this.config);
    PageBuilder.createBasicStructure(this.config);
  }

  async loadResources() {
    const stylesheets = [];

    if (this.config.loadGitHubMarkdownCSS) stylesheets.push('githubMarkdown');
    if (this.config.loadFontAwesome) stylesheets.push('fontAwesome');
    if (this.config.loadFiraMonoFont) stylesheets.push('firaFont');
    if (this.config.showNavbar) stylesheets.push('navbar');
    if (this.config.useTerminalStyle) stylesheets.push('mdsite');

    await DependencyManager.loadStylesheets(stylesheets);
    PageBuilder.injectCustomCSS(this.config.customCSS);
  }

  async initializeComponents() {
    if (this.config.showNavbar) {
      await NavbarManager.initialize(this.config);
    }

    if (this.config.markdownUrl) {
      await MarkdownRenderer.fetchAndRender(this.config.markdownUrl, {
        targetSelector: this.config.targetSelector,
        removeContactSection: this.config.removeContactSection,
        errorMessage: this.config.errorMessage,
      });
    }
  }

  renderInitializationError(error) {
    try {
      document.body.innerHTML = `
        <div style="padding: 20px; background: #ffe6e6; border: 1px solid red; margin: 20px; border-radius: 4px;">
          <h2>mdsite Initialization Error</h2>
          <p><strong>Error:</strong> ${error.message}</p>
          <details>
            <summary>Stack Trace</summary>
            <pre>${error.stack || 'No stack trace available'}</pre>
          </details>
        </div>
      `;
    } catch (renderError) {
      console.error('Could not render error to page:', renderError);
    }
  }
}

// Legacy exports for backward compatibility
export async function initMdsite(config = {}) {
  const site = new MdSite(config);
  await site.initialize();
}

export async function fetchAndRenderMarkdown(options = {}) {
  await MarkdownRenderer.fetchAndRender(options.url, options);
}

export function renderMarkdown(options = {}) {
  return MarkdownRenderer.renderMarkdown(options.markdown, options);
}

export async function initNavbar(config = {}) {
  await NavbarManager.initialize(config);
}

export const DownloadPdfUtil = {
  async download(options = {}) {
    await PDFGenerator.generatePDF(options);
  },
};

// Default export
export default MdSite;
