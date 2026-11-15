import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';

// Dashboard card: how many guests have replied, linking to the full list on /rsvps
const Card = styled(Link)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  text-decoration: none;
  box-shadow: var(--shadow-card);

  &:hover { border-color: var(--accent-line); }
`;

const Stats = styled.div`
  display: flex;
  gap: 22px;
  flex: 1;
  flex-wrap: wrap;
`;

const Stat = styled.div`
  strong {
    display: block;
    font-family: var(--font-heading);
    font-size: 24px;
    color: var(--text-primary);
    line-height: 1.1;
  }
  span { font-size: 12px; color: var(--text-secondary); }
`;

const Label = styled.p`
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
`;

export default function RsvpSummary({ eventId }) {
  const [totals, setTotals] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    let live = true;
    fetch(`/api/rsvps?eventId=${eventId}`)
      .then((r) => r.json())
      .then((d) => { if (live && d.totals) setTotals(d.totals); })
      .catch(() => {});
    return () => { live = false; };
  }, [eventId]);

  return (
    <Card href="/rsvps">
      <div style={{ flex: 1 }}>
        <Label>Guest replies</Label>
        {totals && totals.replies > 0 ? (
          <Stats>
            <Stat><strong>{totals.attendingPeople}</strong><span>coming</span></Stat>
            <Stat><strong>{totals.declined}</strong><span>can't make it</span></Stat>
            <Stat><strong>{totals.replies}</strong><span>{totals.replies === 1 ? 'reply' : 'replies'}</span></Stat>
          </Stats>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {totals ? 'No replies yet. They’ll appear here as guests RSVP.' : 'Loading…'}
          </span>
        )}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: 'var(--text-tertiary)' }}>
        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Card>
  );
}
