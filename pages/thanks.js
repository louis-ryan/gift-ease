import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import styled from 'styled-components';
import Logo from '../components/Logo';
import Money from '../components/Money';
import getOrCreateNewAccount from '../requests/getOrCreateNewAccount';

// Thank-yous are sent from the giftee's own WhatsApp or email app (wa.me / mailto links):
// no messaging service, no cost. The app can't see whether they pressed send, so "thanked"
// is set when they open the link and can be undone.

const Page = styled.div`
  min-height: 100vh;
  background: var(--bg);
`;

const TopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
`;

const BackBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
`;

const Body = styled.div`
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 20px 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h1`
  font-family: var(--font-heading);
  font-size: 30px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const Sub = styled.p`
  font-size: 15px;
  color: var(--text-secondary);
  margin: 6px 0 0;
  line-height: 1.5;
`;

const Card = styled.div`
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 22px;
  box-shadow: var(--shadow-card);
`;

const CardTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px;
`;

const CardHint = styled.p`
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 14px;
  line-height: 1.5;
`;

const Textarea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  min-height: 120px;
  padding: 12px 14px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--card-warm);
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--accent);
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  flex-wrap: wrap;
  font-size: 13px;
  color: var(--text-secondary);
`;

const CheckLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
`;

const SenderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-top: 1px solid var(--surface);

  &:first-of-type { border-top: none; }

  @media (max-width: 560px) {
    flex-wrap: wrap;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--wood);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
`;

const SenderInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SenderName = styled.p`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
`;

const SenderMeta = styled.p`
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  @media (max-width: 560px) {
    width: 100%;
    padding-left: 54px;
  }
`;

const SendBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  color: white;
  background: ${(p) => (p.$method === 'whatsapp' ? '#25A35A' : 'var(--accent)')};
  white-space: nowrap;

  &:hover { opacity: 0.92; }
`;

const ThankedTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--success);
`;

const UndoBtn = styled.button`
  background: none;
  border: none;
  padding: 4px 6px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  text-transform: none;
  text-decoration: underline;
  color: var(--text-tertiary);
  cursor: pointer;

  &:hover { filter: none; color: var(--text-secondary); }
`;

const NoContact = styled.span`
  font-size: 13px;
  color: var(--text-tertiary);
`;

const Empty = styled.p`
  margin: 0;
  padding: 16px 0;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
`;

const DEFAULT_MESSAGE =
  'Thank you so much for your gift! It really means a lot to me.';

const firstName = (name) => (name || '').trim().split(/\s+/)[0] || '';

// One row per person: gifts from the same WhatsApp number or email are grouped, so
// nobody is thanked twice. Gifts without contact details stay as separate rows.
function groupSenders(payments) {
  const groups = new Map();
  payments.forEach((p) => {
    const key = p.contactMethod && p.contactValue ? `${p.contactMethod}:${p.contactValue}` : `none:${p.id}`;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        contactMethod: p.contactValue ? p.contactMethod : null,
        contactValue: p.contactValue || null,
        names: [],
        payments: [],
      });
    }
    const g = groups.get(key);
    if (p.senderName && !g.names.includes(p.senderName)) g.names.push(p.senderName);
    g.payments.push(p);
  });
  return [...groups.values()].map((g) => ({
    ...g,
    name: g.names.join(' & ') || 'Anonymous',
    thanked: g.payments.every((p) => p.thankedAt),
  }));
}

const ThanksPage = (props) => {
  const { user } = useUser();
  const [payments, setPayments] = useState(null);
  const [message, setMessage] = useState('');
  const [saveState, setSaveState] = useState('');
  const [personalise, setPersonalise] = useState(true);
  const saveTimer = useRef(null);
  const eventId = props.currentEvent?._id;

  // Load the current event if the giftee came straight here
  useEffect(() => {
    if (!user || eventId) return;
    getOrCreateNewAccount(
      user.sub, user.email,
      props.setCurrentEvent, props.setAccountId, props.setStripeUserId,
      props.setModalOpen, props.setNotes, props.setAccountSetupComplete, props.setSelectedCurrency
    );
  }, [user]);

  useEffect(() => {
    if (!eventId) return;
    fetch(`/api/getStripePaymentsForAccount?eventId=${eventId}`)
      .then((r) => r.json())
      .then((d) => setPayments(d.payments || []))
      .catch(() => setPayments([]));
    fetch(`/api/thankYou?eventId=${eventId}`)
      .then((r) => r.json())
      .then((d) => setMessage(d.message || DEFAULT_MESSAGE))
      .catch(() => setMessage(DEFAULT_MESSAGE));
  }, [eventId]);

  // Save the message as they type (debounced)
  const onMessageChange = (value) => {
    setMessage(value);
    setSaveState('Saving…');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/thankYou', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, message: value }),
        });
        setSaveState(res.ok ? 'Saved' : "Couldn't save");
      } catch {
        setSaveState("Couldn't save");
      }
    }, 700);
  };

  const wishTitles = useMemo(
    () => Object.fromEntries((props.notes || []).map((n) => [n._id, n.title])),
    [props.notes]
  );

  const groups = useMemo(() => groupSenders(payments || []), [payments]);

  const setThanked = async (group, thanked) => {
    const ids = group.payments.map((p) => p.id);
    const thankedAt = thanked ? new Date().toISOString() : null;
    setPayments((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, thankedAt } : p)));
    try {
      await fetch('/api/thankYou', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, paymentIds: ids, thanked }),
      });
    } catch {
      // Leave the optimistic state; it's only a reminder for the giftee
    }
  };

  const textFor = (group) => {
    const name = firstName(group.names[0]);
    return personalise && name ? `Hi ${name}, ${message}` : message;
  };

  const linkFor = (group) => {
    const text = textFor(group);
    if (group.contactMethod === 'whatsapp') {
      return `https://wa.me/${group.contactValue}?text=${encodeURIComponent(text)}`;
    }
    const subject = `Thank you${props.currentEvent?.name ? ` · ${props.currentEvent.name}` : ''}`;
    return `mailto:${group.contactValue}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  };

  const remaining = groups.filter((g) => g.contactMethod && !g.thanked).length;

  return (
    <Page>
      <TopBar>
        <Logo />
        <BackBtn href="/">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </BackBtn>
      </TopBar>

      <Body>
        <div>
          <Title>Say thank you</Title>
          <Sub>
            {props.currentEvent?.name ? `For ${props.currentEvent.name}. ` : ''}
            Write one message, then send it to each person from your own WhatsApp or email.
          </Sub>
        </div>

        <Card>
          <CardTitle>Your message</CardTitle>
          <CardHint>Saved automatically, so you can come back to it.</CardHint>
          <Textarea
            value={message}
            maxLength={1000}
            onChange={(e) => onMessageChange(e.target.value)}
            aria-label="Thank-you message"
          />
          <Row>
            <CheckLabel>
              <input type="checkbox" checked={personalise} onChange={(e) => setPersonalise(e.target.checked)} />
              Start each message with &quot;Hi [name],&quot;
            </CheckLabel>
            <span>{saveState}</span>
          </Row>
        </Card>

        <Card>
          <CardTitle>People who gave</CardTitle>
          <CardHint>
            {payments === null
              ? 'Loading…'
              : remaining > 0
                ? `${remaining} still to thank. Tapping a button opens the message ready to send.`
                : groups.length
                  ? 'Everyone with contact details has been thanked.'
                  : ''}
          </CardHint>

          {payments !== null && groups.length === 0 && (
            <Empty>No gifts yet for this event.</Empty>
          )}

          {groups.map((group) => {
            const gifts = [...new Set(group.payments.map((p) => wishTitles[p.giftId]).filter(Boolean))];
            return (
              <SenderRow key={group.key}>
                <Avatar>{group.name.charAt(0).toUpperCase()}</Avatar>
                <SenderInfo>
                  <SenderName>{group.name}</SenderName>
                  <SenderMeta>
                    {group.payments.map((p, i) => (
                      <span key={p.id}>
                        {i > 0 && ' + '}
                        <Money amount={p.amount} currency={p.currency} defaultCurrency={props.selectedCurrency} />
                      </span>
                    ))}
                    {gifts.length > 0 && ` · ${gifts.join(', ')}`}
                    {group.contactMethod && ` · ${group.contactMethod === 'whatsapp' ? 'WhatsApp' : 'Email'}`}
                  </SenderMeta>
                </SenderInfo>
                <Actions>
                  {!group.contactMethod ? (
                    <NoContact>No contact details</NoContact>
                  ) : group.thanked ? (
                    <>
                      <ThankedTag>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Thanked
                      </ThankedTag>
                      <UndoBtn type="button" onClick={() => setThanked(group, false)}>Undo</UndoBtn>
                    </>
                  ) : (
                    <SendBtn
                      $method={group.contactMethod}
                      href={linkFor(group)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setThanked(group, true)}
                    >
                      {group.contactMethod === 'whatsapp' ? 'Thank on WhatsApp' : 'Thank by email'}
                    </SendBtn>
                  )}
                </Actions>
              </SenderRow>
            );
          })}
        </Card>
      </Body>
    </Page>
  );
};

export default ThanksPage;
