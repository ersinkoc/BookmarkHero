import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a DOMPurify instance with jsdom
const window = new JSDOM('').window;
// @ts-ignore - DOMPurify types are not compatible with jsdom window
const purify = DOMPurify(window);

// Configure DOMPurify
purify.setConfig({
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOWED_URI_REGEXP: /^https?:\/\//i,
  ADD_ATTR: ['target', 'rel'], // Add target="_blank" rel="noopener"
});

export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  
  // Clean the HTML
  const clean = purify.sanitize(dirty, {
    ADD_TAGS: [],
    ADD_ATTR: ['target', 'rel']
  });

  // Add target="_blank" and rel="noopener" to all links
  return clean.replace(/<a\s+href=/gi, '<a target="_blank" rel="noopener noreferrer" href=');
}

export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Remove any HTML tags and trim
  return text.replace(/<[^>]*>/g, '').trim();
}

export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, m => map[m]);
}