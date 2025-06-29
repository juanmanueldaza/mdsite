// Shared mdsite module for Markdown rendering, sanitization, and error handling
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
  document.querySelector(targetSelector).innerHTML = window.DOMPurify.sanitize(html);
}

export async function fetchAndRenderMarkdown({
  url,
  targetSelector = '#cv',
  removeContactSection = false,
  errorMessage = 'Error loading content.'
}) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch content.');
    const md = await response.text();
    renderMarkdown({ markdown: md, targetSelector, removeContactSection });
  } catch (err) {
    document.querySelector(targetSelector).innerHTML = `<div style='color:red'>${errorMessage}: ${err.message}</div>`;
  }
}
