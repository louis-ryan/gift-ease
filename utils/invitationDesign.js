// Invitation designs, wording and formatting. KEEP IN SYNC: an identical copy lives in
// gift-easy-sender/utils/invitationDesign.js (the repos share no code). The theme ids
// must also match THEME_IDS in gift-ease/utils/invitation.js.

export const THEMES = {
  classic: {
    label: 'Classic',
    bg: '#F4EFE6', card: '#FFFDF8', text: '#2E2A24', muted: '#6F6557', accent: '#9A7B3F', line: '#E3D8C4',
    heading: "'Cormorant Garamond', Georgia, serif", names: "'Cormorant Garamond', Georgia, serif",
    namesStyle: 'italic', namesWeight: 500, namesSize: 1,
  },
  garden: {
    label: 'Garden',
    bg: '#E9EFE4', card: '#FBFCF8', text: '#2C3A2A', muted: '#5D6B58', accent: '#5F7D50', line: '#D3DEC9',
    heading: "'Cormorant Garamond', Georgia, serif", names: "'Great Vibes', 'Cormorant Garamond', cursive",
    namesStyle: 'normal', namesWeight: 400, namesSize: 1.15,
  },
  blush: {
    label: 'Blush',
    bg: '#F6E8E6', card: '#FFFAF9', text: '#47292E', muted: '#7C5A5F', accent: '#B15E6B', line: '#EFD6D4',
    heading: "'Cormorant Garamond', Georgia, serif", names: "'Great Vibes', 'Cormorant Garamond', cursive",
    namesStyle: 'normal', namesWeight: 400, namesSize: 1.15,
  },
  modern: {
    label: 'Modern',
    bg: '#EDEDEA', card: '#FFFFFF', text: '#151515', muted: '#5E5E5A', accent: '#151515', line: '#E2E2DE',
    heading: "'Inter', system-ui, sans-serif", names: "'Inter', system-ui, sans-serif",
    namesStyle: 'normal', namesWeight: 600, namesSize: 0.8,
  },
  autumn: {
    label: 'Autumn',
    bg: '#F6EDE0', card: '#FFFDF9', text: '#3B2A20', muted: '#7A6352', accent: '#B4532A', line: '#E8DCC8',
    heading: "'Fraunces', Georgia, serif", names: "'Fraunces', Georgia, serif",
    namesStyle: 'normal', namesWeight: 600, namesSize: 0.85,
  },
};

export const THEME_ORDER = ['classic', 'garden', 'blush', 'modern', 'autumn'];
export const themeFor = (id) => THEMES[id] || THEMES.classic;

export const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Great+Vibes&family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500;600&display=swap';

export const EVENT_TYPES = {
  wedding: { label: 'Wedding', eyebrow: 'Together with their families', line: 'invite you to celebrate their wedding', title: 'Wedding' },
  engagement: { label: 'Engagement party', eyebrow: 'Please join us to celebrate the engagement of', line: '', title: 'Engagement Party' },
  party: { label: 'Party or celebration', eyebrow: "You're invited", line: 'Come and celebrate with us', title: 'Celebration' },
  other: { label: 'Something else', eyebrow: "You're invited", line: '', title: '' },
};
export const typeCopy = (t) => EVENT_TYPES[t] || EVENT_TYPES.wedding;

// The heading on the invitation: "Sam & Alex", falling back to the event's title
export const displayNames = (event) => (event?.hostNames || '').trim() || event?.name || '';
export const inviteLine = (event) => {
  const custom = (event?.inviteLine || '').trim();
  return custom || typeCopy(event?.eventType).line;
};

// Dates are stored as UTC midnight for the chosen day, so always format in UTC.
// A fixed locale keeps server and browser output identical
export function formatDay(date, { weekday = true } = {}) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric', ...(weekday ? { weekday: 'long' } : {}),
  });
}

// "15:00" → "3pm", "15:30" → "3:30pm"
export function formatTime(hhmm) {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm || '');
  if (!m) return '';
  const h = +m[1];
  const suffix = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m[2] === '00' ? `${h12}${suffix}` : `${h12}:${m[2]}${suffix}`;
}

export function mapsUrl(event) {
  const q = [event?.venueName, event?.venueAddress].filter((s) => s && s.trim()).join(', ');
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : '';
}

// "YYYY-MM-DD" for <input type="date"> from a stored date
export function toDayInput(date) {
  if (!date) return '';
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

// RSVP deadline has passed (allowing the whole of the deadline day)
export const rsvpClosed = (event) =>
  !!event?.rsvpDeadline && Date.now() > new Date(event.rsvpDeadline).getTime() + 36 * 60 * 60 * 1000;
