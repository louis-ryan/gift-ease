import styled from 'styled-components';

// The "by the way" offer under the invitation: an optional gift registry.
const Wrap = styled.section`
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 24px;
  margin-top: 8px;
  border-radius: 16px;
  border: 1.5px dashed var(--border-strong);
  background: var(--card-warm);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Icon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--honey-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
`;

const Text = styled.div`
  flex: 1;
`;

const Eyebrow = styled.p`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin: 0 0 4px;
`;

const Title = styled.h3`
  font-family: var(--font-heading);
  font-size: 19px;
  margin: 0 0 6px;
  color: var(--text-primary);
`;

const Body = styled.p`
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-secondary);
  margin: 0;
`;

const Fine = styled.p`
  font-size: 12px;
  color: var(--text-secondary);
  margin: 8px 0 0;
`;

const AddBtn = styled.button`
  && {
    padding: 12px 20px;
    border-radius: 10px;
    background: var(--text-primary);
    color: white;
    font-size: 14px;
    font-weight: 600;
    text-transform: none;
    white-space: nowrap;
    flex-shrink: 0;
  }
  &&:disabled { opacity: 0.6; }
`;

export default function RegistryPromo({ onAdd, busy }) {
  return (
    <Wrap>
      <Icon aria-hidden="true">🎁</Icon>
      <Text>
        <Eyebrow>Optional extra</Eyebrow>
        <Title>Add a gift registry?</Title>
        <Body>
          Guests will see a short note below your invitation saying you've also made a registry. They
          can chip in towards gifts, a honeymoon or a house fund, and the money goes straight to your bank.
        </Body>
        <Fine>Free to add. A small fee comes out of each gift (2% plus card processing). Nothing changes for guests who just want to RSVP.</Fine>
      </Text>
      <AddBtn type="button" onClick={onAdd} disabled={busy}>
        {busy ? 'Adding…' : 'Add a registry'}
      </AddBtn>
    </Wrap>
  );
}

// The reverse, on a registry-only page: turn it into an invitation as well
export function InvitationPromo({ onAdd }) {
  return (
    <Wrap>
      <Icon aria-hidden="true">💌</Icon>
      <Text>
        <Eyebrow>Free</Eyebrow>
        <Title>Having a celebration too?</Title>
        <Body>
          Turn this page into an invitation. Guests get the date, venue and an RSVP form at the top, and
          your registry stays just below. Same link, nothing to pay.
        </Body>
      </Text>
      <AddBtn type="button" onClick={onAdd}>Make it an invitation</AddBtn>
    </Wrap>
  );
}
