import Head from 'next/head';
import {
  themeFor, typeCopy, displayNames, inviteLine, formatDay, formatTime, mapsUrl, FONTS_URL,
} from '../utils/invitationDesign';

// The invitation card guests see. KEEP IN SYNC: an identical copy lives in
// gift-easy-sender/components/Invitation.js (the giftee's editor previews with this one).
// Everything is rendered as plain text, never HTML.
//
// `children` goes at the bottom of the card (RSVP / calendar buttons on the guest page).
// `compact` shrinks it for small previews.
export default function Invitation({ event = {}, children, compact = false }) {
  const t = themeFor(event.theme);
  const copy = typeCopy(event.eventType);
  const names = displayNames(event);
  const line = inviteLine(event);
  const day = formatDay(event.date);
  const time = formatTime(event.startTime);
  const map = mapsUrl(event);
  const schedule = (event.schedule || []).filter((s) => s && s.title);
  const paragraphs = (event.description || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const vars = {
    '--inv-bg': t.bg,
    '--inv-card': t.card,
    '--inv-text': t.text,
    '--inv-muted': t.muted,
    '--inv-accent': t.accent,
    '--inv-line': t.line,
    '--inv-heading': t.heading,
    '--inv-names': t.names,
    '--inv-names-style': t.namesStyle,
    '--inv-names-weight': t.namesWeight,
    '--inv-names-size': t.namesSize,
  };

  return (
    <div className={`inv${compact ? ' compact' : ''}`} style={vars}>
      <Head>
        <link key="inv-fonts" rel="stylesheet" href={FONTS_URL} />
      </Head>

      <article className="inv-card">
        {event.imageUrl ? (
          <div className="inv-photo">
            <img src={event.imageUrl} alt="" />
          </div>
        ) : (
          <div className="inv-ornament" aria-hidden="true">
            <svg width="56" height="20" viewBox="0 0 56 20" fill="none">
              <path d="M2 10h18M36 10h18" stroke="currentColor" strokeWidth="1" />
              <path d="M28 3l3.5 7-3.5 7-3.5-7z" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        )}

        {copy.eyebrow && <p className="inv-eyebrow">{copy.eyebrow}</p>}
        <h1 className="inv-names">{names || 'Your names'}</h1>
        {line && <p className="inv-line">{line}</p>}

        <div className="inv-rule" aria-hidden="true"><span /></div>

        {day && <p className="inv-date">{day}</p>}
        {time && <p className="inv-time">{time}</p>}

        {(event.venueName || event.venueAddress) && (
          <div className="inv-venue">
            {event.venueName && <p className="inv-venue-name">{event.venueName}</p>}
            {event.venueAddress && <p className="inv-venue-address">{event.venueAddress}</p>}
            {map && (
              <a className="inv-link" href={map} target="_blank" rel="noopener noreferrer">
                Open in Maps
              </a>
            )}
          </div>
        )}

        {paragraphs.length > 0 && (
          <div className="inv-message">
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        )}

        {schedule.length > 0 && (
          <div className="inv-section">
            <p className="inv-section-title">The day</p>
            <ul className="inv-schedule">
              {schedule.map((s, i) => (
                <li key={i}>
                  <span className="inv-schedule-time">{formatTime(s.time)}</span>
                  <span className="inv-schedule-title">{s.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {event.dressCode && (
          <div className="inv-section">
            <p className="inv-section-title">Dress code</p>
            <p className="inv-detail">{event.dressCode}</p>
          </div>
        )}

        {children && <div className="inv-actions">{children}</div>}
      </article>

      <style jsx>{`
        .inv {
          background: var(--inv-bg);
          padding: 40px 16px 56px;
          color: var(--inv-text);
          font-family: 'Inter', system-ui, sans-serif;
        }
        .inv.compact { padding: 20px 12px; border-radius: 14px; }

        .inv-card {
          position: relative;
          max-width: 560px;
          margin: 0 auto;
          background: var(--inv-card);
          border-radius: 4px;
          padding: 48px 40px 44px;
          text-align: center;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 12px 40px rgba(0, 0, 0, 0.07);
        }
        /* Fine inset border, like a printed card */
        .inv-card::before {
          content: '';
          position: absolute;
          inset: 12px;
          border: 1px solid var(--inv-line);
          pointer-events: none;
        }
        .compact .inv-card { padding: 28px 20px 24px; }
        .compact .inv-card::before { inset: 8px; }

        .inv-photo {
          width: 72%;
          max-width: 300px;
          aspect-ratio: 4 / 5;
          margin: 0 auto 32px;
          border-radius: 999px 999px 6px 6px;
          overflow: hidden;
          background: var(--inv-line);
        }
        .inv-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .compact .inv-photo { width: 46%; margin-bottom: 18px; }

        .inv-ornament { color: var(--inv-accent); margin: 4px 0 26px; }
        .compact .inv-ornament { margin: 0 0 14px; }

        .inv-eyebrow {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--inv-muted);
          margin: 0 auto 14px;
          max-width: 360px;
          line-height: 1.7;
        }
        .inv-names {
          font-family: var(--inv-names);
          font-style: var(--inv-names-style);
          font-weight: var(--inv-names-weight);
          font-size: calc(52px * var(--inv-names-size));
          line-height: 1.1;
          margin: 0 0 14px;
          color: var(--inv-text);
          overflow-wrap: anywhere;
          text-transform: none;
        }
        .compact .inv-names { font-size: calc(34px * var(--inv-names-size)); margin-bottom: 8px; }
        .inv-line {
          font-family: var(--inv-heading);
          font-size: 20px;
          line-height: 1.4;
          color: var(--inv-muted);
          margin: 0;
        }
        .compact .inv-line { font-size: 15px; }

        .inv-rule {
          display: flex;
          justify-content: center;
          margin: 28px 0 24px;
        }
        .inv-rule span { width: 48px; height: 1px; background: var(--inv-accent); }
        .compact .inv-rule { margin: 16px 0 14px; }

        .inv-date {
          font-family: var(--inv-heading);
          font-size: 24px;
          font-weight: 600;
          margin: 0;
          color: var(--inv-text);
        }
        .inv-time {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--inv-muted);
          margin: 8px 0 0;
        }
        .compact .inv-date { font-size: 18px; }

        .inv-venue { margin-top: 24px; }
        .inv-venue-name {
          font-family: var(--inv-heading);
          font-size: 20px;
          font-weight: 600;
          margin: 0;
          color: var(--inv-text);
        }
        .inv-venue-address {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: var(--inv-muted);
          margin: 4px 0 0;
          white-space: pre-line;
        }
        .compact .inv-venue { margin-top: 14px; }
        .compact .inv-venue-name { font-size: 16px; }
        .inv-link {
          display: inline-block;
          margin-top: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--inv-accent);
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .inv-message {
          font-family: 'Inter', system-ui, sans-serif;
          margin: 28px auto 0;
          max-width: 420px;
          font-size: 15px;
          line-height: 1.75;
          color: var(--inv-text);
        }
        .inv-message p { margin: 0 0 12px; white-space: pre-line; color: var(--inv-text); font: inherit; }
        .inv-message p:last-child { margin-bottom: 0; }
        .compact .inv-message { margin-top: 16px; font-size: 13px; }

        .inv-section { margin-top: 28px; }
        .compact .inv-section { margin-top: 16px; }
        .inv-section-title {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--inv-accent);
          margin: 0 0 10px;
        }
        .inv-detail { font-size: 15px; margin: 0; color: var(--inv-text); font-family: 'Inter', system-ui, sans-serif; }

        .inv-schedule {
          list-style: none;
          padding: 0;
          margin: 0 auto;
          max-width: 340px;
        }
        .inv-schedule li {
          display: flex;
          gap: 16px;
          padding: 8px 0;
          border-bottom: 1px solid var(--inv-line);
          font-size: 15px;
          text-align: left;
        }
        .inv-schedule li:last-child { border-bottom: none; }
        .inv-schedule-time {
          width: 64px;
          flex-shrink: 0;
          color: var(--inv-muted);
          font-variant-numeric: tabular-nums;
        }
        .inv-schedule-title { flex: 1; }

        .inv-actions { margin-top: 36px; position: relative; }

        @media (max-width: 480px) {
          .inv { padding: 20px 12px 40px; }
          .inv-card { padding: 40px 24px 36px; }
          .inv-names { font-size: calc(40px * var(--inv-names-size)); }
          .inv-line { font-size: 18px; }
          .inv-date { font-size: 21px; }
        }
      `}</style>
    </div>
  );
}
