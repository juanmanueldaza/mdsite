// Shared mdsite module for Markdown rendering, sanitization, error handling, and accessibility enhancements
// This module will be imported by cv and onepager sites

export function renderMarkdown({
  markdown,
  targetSelector = '#cv',
  removeContactSection = false
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
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// Utility to load all dependencies needed by mdsite.js
export async function ensureMdsiteDependencies() {
  await ensureScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js', 'marked');
  await ensureScript('https://cdn.jsdelivr.net/npm/dompurify@3.0.8/dist/purify.min.js', 'DOMPurify');
  await ensureScript('https://navbar.daza.ar/utils/downloadPdf.js', 'DownloadPdfUtil');
}

// --- PDF DOWNLOAD UTILITY (ES MODULE EXPORT) ---
export async function getDownloadPdfUtil() {
  const mod = await import('https://navbar.daza.ar/utils/downloadPdf.js');
  return mod.DownloadPdfUtil || mod.default;
}

export const DownloadPdfUtil = {
  async download(options) {
    const util = await getDownloadPdfUtil();
    return util.download(options);
  }
};

export async function fetchAndRenderMarkdown({
  url,
  targetSelector = '#cv',
  removeContactSection = false,
  errorMessage = 'Error loading content.'
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
