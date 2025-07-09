// Shared mdsite module for Markdown rendering, sanitization, error handling, and accessibility enhancements
// This module will be imported by cv and onepager sites

export function renderMarkdown({
  markdown,
  targetSelector = '#cv',
  removeContactSection = false,
}) {
  let md = markdown;
  if (removeContactSection) {
    const contactRegex = /## Contact[\s\S]*?---/;
    md = md.replace(contactRegex, '---');
  }
  const html = window.marked.parse(md);
  const target = document.querySelector(targetSelector);
  target.innerHTML = window.DOMPurify.sanitize(html);
  // Accessibility: Ensure main article is focusable and has ARIA role
  target.setAttribute('tabindex', '0');
  target.setAttribute('role', 'main');
  target.setAttribute('aria-label', 'Markdown content');
  // Accessibility: Add skip link if not present
  if (!document.querySelector('.skip-link')) {
    const skip = document.createElement('a');
    skip.href = targetSelector;
    skip.className = 'skip-link';
    skip.textContent = 'Skip to main content';
    skip.style.position = 'absolute';
    skip.style.left = '-999px';
    skip.style.top = 'auto';
    skip.style.width = '1px';
    skip.style.height = '1px';
    skip.style.overflow = 'hidden';
    skip.style.zIndex = '100';
    document.body.insertBefore(skip, document.body.firstChild);
  }
}

// Utility to dynamically load a script if not already present
async function ensureScript(src, globalName) {
  if (window[globalName]) return;
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => {
      console.log(`Loaded script: ${src}`);
      resolve();
    };
    s.onerror = err => {
      console.error(`Failed to load script: ${src}`, err);
      reject(err);
    };
    document.head.appendChild(s);
  });
}

// Utility to load all dependencies needed by mdsite.js
export async function ensureMdsiteDependencies() {
  await ensureScript(
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
    'marked'
  );
  await ensureScript(
    'https://cdn.jsdelivr.net/npm/dompurify@3.0.8/dist/purify.min.js',
    'DOMPurify'
  );
  await ensureScript(
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'jspdf'
  );
  await ensureScript(
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    'html2canvas'
  );
}

// --- PDF DOWNLOAD UTILITY (ES MODULE EXPORT) ---
export const DownloadPdfUtil = {
  async download(options = {}) {
    try {
      await ensureMdsiteDependencies();

      const {
        selector = 'body',
        filename = 'download.pdf',
        scale = 2,
        useCORS = true,
        allowTaint = true,
        backgroundColor = '#ffffff',
        margin = 20,
      } = options;

      // Check if required libraries are loaded
      if (!window.html2canvas) {
        throw new Error('html2canvas library not loaded');
      }

      // Debug: Check what jsPDF globals are available
      console.log('Available jsPDF globals:', {
        jspdf: !!window.jspdf,
        jsPDF: !!window.jsPDF,
        'jspdf.jsPDF': !!(window.jspdf && window.jspdf.jsPDF),
        'jsPDF.jsPDF': !!(window.jsPDF && window.jsPDF.jsPDF),
        'window.jspdf': window.jspdf,
        'window.jsPDF': window.jsPDF,
      });

      if (!window.jspdf && !window.jsPDF) {
        throw new Error('jsPDF library not loaded');
      }

      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`Element with selector "${selector}" not found`);
      }

      console.log('Generating canvas from element...', element);

      // Create canvas from HTML element
      const canvas = await window.html2canvas(element, {
        scale,
        useCORS,
        allowTaint,
        backgroundColor,
        logging: true,
        onclone: clonedDoc => {
          // Ensure styles are preserved in cloned document
          const clonedElement = clonedDoc.querySelector(selector);
          if (clonedElement) {
            clonedElement.style.transform = 'scale(1)';
            clonedElement.style.transformOrigin = 'top left';
          }
        },
      });

      console.log('Canvas generated:', canvas.width, 'x', canvas.height);

      // Calculate dimensions
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const ratio = Math.min(
        (pdfWidth - margin * 2) / (imgWidth * 0.75),
        (pdfHeight - margin * 2) / (imgHeight * 0.75)
      );

      console.log('PDF dimensions calculated:', { imgWidth, imgHeight, ratio });

      // Create PDF - handle different jsPDF loading patterns
      let pdf;
      if (window.jspdf && window.jspdf.jsPDF) {
        pdf = new window.jspdf.jsPDF({
          orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4',
        });
      } else if (window.jsPDF && window.jsPDF.jsPDF) {
        pdf = new window.jsPDF.jsPDF({
          orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4',
        });
      } else if (window.jsPDF) {
        pdf = new window.jsPDF({
          orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4',
        });
      } else {
        throw new Error('jsPDF constructor not found');
      }

      console.log('PDF created:', pdf);

      // Add image to PDF
      const finalWidth = imgWidth * ratio * 0.75;
      const finalHeight = imgHeight * ratio * 0.75;
      const x = (pdf.internal.pageSize.getWidth() - finalWidth) / 2;
      const y = margin;

      console.log('Adding image to PDF:', { finalWidth, finalHeight, x, y });

      const imageData = canvas.toDataURL('image/png');
      pdf.addImage(imageData, 'PNG', x, y, finalWidth, finalHeight);

      // Save PDF
      pdf.save(filename);

      console.log(`PDF "${filename}" downloaded successfully`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error.message}`);
    }
  },
};

export async function fetchAndRenderMarkdown({
  url,
  targetSelector = '#cv',
  removeContactSection = false,
  errorMessage = 'Error loading content.',
}) {
  await ensureMdsiteDependencies();
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch content.');
    const md = await response.text();
    renderMarkdown({ markdown: md, targetSelector, removeContactSection });
  } catch (err) {
    const target = document.querySelector(targetSelector);
    target.innerHTML = `<div style='color:red'>${errorMessage}: ${err.message}</div>`;
    target.setAttribute('role', 'alert');
    target.setAttribute('tabindex', '0');
  }
}

export function initNavbar({
  showPdfButton = true,
  pdfCallbackOptions = {},
  contacts = [],
}) {
  // Use our built-in PDF utility
  async function downloadPdf() {
    await DownloadPdfUtil.download(pdfCallbackOptions);
  }
  window.initDazaNavbar({
    showPdfButton,
    pdfCallback: downloadPdf,
    contacts,
  });
}
