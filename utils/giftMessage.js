// Server-side checks for what a sender attaches to a gift (message, photos, GIF, contact).
// Everything here comes from the public sender app, so treat it as untrusted.

export const MAX_MESSAGE_LENGTH = 500;
export const MAX_PHOTOS = 4;

// Plain text only; formatting is **bold** / _italic_ markers, rendered safely by
// components/GiftMessageText.js (never as HTML)
export function cleanMessage(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
}

const uploadPrefix = () =>
  `https://${process.env.AMAZON_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/`;

// Only photos uploaded through our own /api/uploadToAWS
export function cleanPhotoUrls(urls) {
  if (!Array.isArray(urls)) return [];
  return urls
    .filter((u) => typeof u === 'string' && u.startsWith(uploadPrefix()) && !u.includes('..'))
    .slice(0, MAX_PHOTOS);
}

// Only GIFs served by Giphy
export function cleanGifUrl(url) {
  if (typeof url !== 'string' || !url) return '';
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && /^(media\d*|i)\.giphy\.com$/.test(u.hostname) ? u.href : '';
  } catch {
    return '';
  }
}

// WhatsApp numbers are stored as digits only, in international format (e.g. 447700900123)
export function cleanContact(method, value) {
  if (method === 'whatsapp') {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15 ? { contactMethod: 'whatsapp', contactValue: digits } : null;
  }
  if (method === 'email') {
    const email = String(value || '').trim().toLowerCase();
    return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? { contactMethod: 'email', contactValue: email }
      : null;
  }
  return null;
}
