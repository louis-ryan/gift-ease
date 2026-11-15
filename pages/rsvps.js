import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useUser } from '@auth0/nextjs-auth0/client';
import styled from 'styled-components';
import Logo from '../components/Logo';
import getOrCreateNewAccount from '../requests/getOrCreateNewAccount';
import { formatDay } from '../utils/invitationDesign';

const Page = styled.div`
  min-height: 100vh;
  background: var(--bg);
`;

const TopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  border-bottom: 1px solid var(--surface);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;

  @media (max-width: 640px) { padding: 0 16px; }
`;

const BackBtn = styled(Link)`
  background: var(--surface);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
`;

const Body = styled.div`
  max-width: 820px;
  margin: 0 auto;
  padding: 32px 16px 64px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h1`
  font-family: var(--font-heading);
  font-size: 28px;
  margin: 0;
  color: var(--text-primary);
`;

const Sub = styled.p`
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--text-secondary);
`;

const Totals = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const Total = styled.div`
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;

  strong { display: block; font-family: var(--font-heading); font-size: 28px; color: var(--text-primary); }
  span { font-size: 13px; color: var(--text-secondary); }
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const Filters = styled.div`
  display: flex;
  gap: 6px;
`;

const FilterBtn = styled.button`
  && {
    padding: 8px 14px;
    border-radius: 100px;
    border: 1.5px solid ${(p) => (p.$on ? 'var(--accent)' : 'var(--border)')};
    background: ${(p) => (p.$on ? 'var(--accent-soft)' : 'white')};
    color: ${(p) => (p.$on ? 'var(--accent)' : 'var(--text-primary)')};
    font-size: 13px;
    font-weight: 600;
    text-transform: none;
  }
`;

const DownloadBtn = styled.button`
  && {
    padding: 9px 16px;
    border-radius: 8px;
    background: var(--text-primary);
    color: white;
    font-size: 13px;
    font-weight: 600;
    text-transform: none;
  }
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Item = styled.li`
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
`;

const Badge = styled.span`
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
  background: ${(p) => (p.$yes ? 'var(--success-soft)' : 'var(--surface)')};
  color: ${(p) => (p.$yes ? 'var(--success-dark)' : 'var(--text-secondary)')};
`;

const Main = styled.div`
  flex: 1;
  min-width: 0;

  p { margin: 0; }
  .name { font-weight: 700; color: var(--text-primary); }
  .meta { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
  .detail { font-size: 14px; color: var(--text-primary); margin-top: 8px; white-space: pre-line; overflow-wrap: anywhere; }
  .detail b { font-weight: 600; color: var(--text-secondary); }
`;

const RemoveBtn = styled.button`
  && {
    background: none;
    color: var(--text-secondary);
    padding: 4px;
    font-size: 12px;
    font-weight: 500;
    text-transform: none;
    text-decoration: underline;
  }
`;

const Empty = styled.div`
  background: var(--card);
  border: 1px dashed var(--border-strong);
  border-radius: 14px;
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
`;

const csvCell = (v) => {
  let s = v === undefined || v === null ? '' : String(v);
  // Stop spreadsheet apps treating a guest's text as a formula
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export default function Rsvps(props) {
  const { user } = useUser();
  const event = props.currentEvent || {};
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    getOrCreateNewAccount(
      user.sub, user.email,
      props.setCurrentEvent, props.setAccountId, props.setStripeUserId,
      props.setModalOpen, props.setNotes, props.setAccountSetupComplete, props.setSelectedCurrency,
    );
  }, [user]);

  const load = () =>
    fetch(`/api/rsvps?eventId=${event._id}`)
      .then((r) => r.json())
      .then((d) => setData(d.rsvps ? d : { rsvps: [], totals: null }))
      .catch(() => setData({ rsvps: [], totals: null }));

  useEffect(() => { if (event._id) load(); }, [event._id]);

  const shown = useMemo(() => {
    const all = data?.rsvps || [];
    if (filter === 'yes') return all.filter((r) => r.attending);
    if (filter === 'no') return all.filter((r) => !r.attending);
    return all;
  }, [data, filter]);

  const remove = async (r) => {
    if (!window.confirm(`Remove ${r.name}'s reply?`)) return;
    await fetch(`/api/rsvps?eventId=${event._id}&id=${r._id}`, { method: 'DELETE' });
    load();
  };

  const download = () => {
    const rows = [['Name', 'Coming', 'People', 'Email', 'Dietary needs', 'Message', 'Replied']];
    (data?.rsvps || []).forEach((r) => rows.push([
      r.name, r.attending ? 'Yes' : 'No', r.attending ? r.guests : 0, r.email, r.dietary, r.message,
      new Date(r.createdAt).toISOString().slice(0, 10),
    ]));
    const blob = new Blob([rows.map((row) => row.map(csvCell).join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${event.uri || 'guests'}-rsvps.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const t = data?.totals;

  return (
    <Page>
      <Head><title>Guest replies · Wishlistagogo</title></Head>
      <TopBar>
        <Logo />
        <BackBtn href="/">Dashboard</BackBtn>
      </TopBar>

      <Body>
        <div>
          <Title>Guest replies</Title>
          <Sub>
            {event.name}
            {event.rsvpDeadline ? ` · replies close after ${formatDay(event.rsvpDeadline, { weekday: false })}` : ''}
          </Sub>
        </div>

        {!data ? (
          <Empty>Loading…</Empty>
        ) : (
          <>
            {t && (
              <Totals>
                <Total><strong>{t.attendingPeople}</strong><span>people coming</span></Total>
                <Total><strong>{t.declined}</strong><span>can't make it</span></Total>
                <Total><strong>{t.replies}</strong><span>replies in total</span></Total>
              </Totals>
            )}

            {data.rsvps.length === 0 ? (
              <Empty>
                No replies yet. Send your invitation from the dashboard and replies will show up here.
                {event.rsvpEnabled === false && <><br /><br />RSVPs are turned off for this invitation. Turn them on in <Link href="/invitation" style={{ color: 'var(--accent)' }}>Edit invitation</Link>.</>}
              </Empty>
            ) : (
              <>
                <Toolbar>
                  <Filters>
                    <FilterBtn $on={filter === 'all'} onClick={() => setFilter('all')}>All</FilterBtn>
                    <FilterBtn $on={filter === 'yes'} onClick={() => setFilter('yes')}>Coming</FilterBtn>
                    <FilterBtn $on={filter === 'no'} onClick={() => setFilter('no')}>Can't make it</FilterBtn>
                  </Filters>
                  <DownloadBtn type="button" onClick={download}>Download spreadsheet</DownloadBtn>
                </Toolbar>

                <List>
                  {shown.map((r) => (
                    <Item key={r._id}>
                      <Badge $yes={r.attending}>{r.attending ? `Coming · ${r.guests}` : 'Not coming'}</Badge>
                      <Main>
                        <p className="name">{r.name}</p>
                        <p className="meta">
                          {r.email ? `${r.email} · ` : ''}replied {formatDay(r.createdAt, { weekday: false })}
                        </p>
                        {r.dietary && <p className="detail"><b>Dietary needs:</b> {r.dietary}</p>}
                        {r.message && <p className="detail">“{r.message}”</p>}
                      </Main>
                      <RemoveBtn type="button" onClick={() => remove(r)}>Remove</RemoveBtn>
                    </Item>
                  ))}
                </List>
              </>
            )}
          </>
        )}
      </Body>
    </Page>
  );
}
