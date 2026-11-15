// Server-side checks for invitation fields sent by the giftee's editor
// (pages/api/updateEvent/[id].js, postNewEventForUser). Only whitelisted fields get
// through; everything is plain text (rendered as text, never HTML).

import { cleanPhotoUrls } from './giftMessage';

export const EVENT_TYPES = ['wedding', 'engagement', 'party', 'other'];
// Must match the ids in utils/invitationDesign.js (both repos)
export const THEME_IDS = ['classic', 'garden', 'blush', 'modern', 'autumn'];
export const MAX_SCHEDULE_ITEMS = 8;

// Events made before invitations existed have no registryEnabled: they were registries
export const registryEnabled = (event) => event?.registryEnabled !== false;

const text = (v, max) =>
  typeof v === 'string'
    ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max)
    : '';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const time = (v) => (typeof v === 'string' && TIME_RE.test(v) ? v : '');

// "YYYY-MM-DD" → Date at UTC midnight, or null
export function parseDay(v) {
  if (typeof v !== 'string') return null;
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

// Allows "today" anywhere in the world (UTC midnight can be up to a day behind)
export const isPastDay = (d) => d.getTime() < Date.now() - 36 * 60 * 60 * 1000;

export function slugify(v) {
  return String(v || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[']/g, '')
    .replace(/[^a-z0-9-\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

// Returns { update, error }. `existing` is the stored event (for checks that depend on it)
export function cleanInvitation(body, existing = null) {
  const update = {};
  const has = (k) => Object.prototype.hasOwnProperty.call(body || {}, k);

  if (has('name')) {
    update.name = text(body.name, 100);
    if (!update.name) return { error: 'Please give your event a title' };
  }
  if (has('eventType')) {
    if (!EVENT_TYPES.includes(body.eventType)) return { error: 'Unknown event type' };
    update.eventType = body.eventType;
  }
  if (has('theme')) {
    if (!THEME_IDS.includes(body.theme)) return { error: 'Unknown design' };
    update.theme = body.theme;
  }
  if (has('date')) {
    const d = parseDay(body.date);
    if (!d) return { error: 'Please choose a date' };
    const unchanged = existing?.date && new Date(existing.date).getTime() === d.getTime();
    if (!unchanged && isPastDay(d)) return { error: 'The date is in the past' };
    update.date = d;
  }
  if (has('rsvpDeadline')) {
    if (!body.rsvpDeadline) update.rsvpDeadline = null;
    else {
      const d = parseDay(body.rsvpDeadline);
      if (!d) return { error: 'Please check the RSVP date' };
      update.rsvpDeadline = d;
    }
  }
  if (has('startTime')) update.startTime = time(body.startTime);

  const texts = {
    hostNames: 100, inviteLine: 160, venueName: 120, venueAddress: 300,
    description: 1000, dressCode: 80, registryNote: 300,
  };
  for (const [k, max] of Object.entries(texts)) if (has(k)) update[k] = text(body[k], max);

  for (const k of ['rsvpEnabled', 'registryEnabled']) if (has(k)) update[k] = body[k] === true;

  if (has('schedule')) {
    if (!Array.isArray(body.schedule)) return { error: 'Schedule must be a list' };
    update.schedule = body.schedule
      .map((s) => ({ time: time(s?.time), title: text(s?.title, 80) }))
      .filter((s) => s.title)
      .slice(0, MAX_SCHEDULE_ITEMS);
  }

  if (has('imageUrl')) {
    // Only photos uploaded through our own /api/uploadToAWS (or cleared)
    if (!body.imageUrl) update.imageUrl = '';
    else if (existing && body.imageUrl === existing.imageUrl) {
      // Unchanged. It may be a pasted image link set from the dashboard cover, so leave it alone
    } else {
      const [url] = cleanPhotoUrls([body.imageUrl]);
      if (!url) return { error: 'Please upload the cover photo again' };
      update.imageUrl = url;
    }
  }

  return { update };
}
