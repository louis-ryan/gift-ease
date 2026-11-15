import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import getOrCreateNewAccount from '../requests/getOrCreateNewAccount';
import deleteThisEvent from '../requests/deleteThisEvent';
import Navbar from '../components/Navbar';
import WishCard from '../components/WishCard';
import ShareLink from '../components/shareLinkComponent';
import CoverImage from '../components/CoverImage';
import Footer from '../components/Footer';
import DeleteModal from '../components/DeleteModal';
import SetupReminder from '../components/SetupReminder';
import Invitation from '../components/Invitation';
import RegistryPromo from '../components/RegistryPromo';
import RsvpSummary from '../components/RsvpSummary';
import { senderLink } from '../utils/senderUrl';

// ── Layout ──────────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  background: var(--bg);
`;

const HeroSpacer = styled.div`
  height: 320px;
`;

const Content = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 0 60px;
  box-sizing: border-box;

  @media (max-width: 1000px) {
    padding: 28px 16px 60px;
  }
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

// ── Section header ───────────────────────────────────────────────────────
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SectionTitle = styled.h2`
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const SectionMeta = styled.span`
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
`;

// ── Cards grid ───────────────────────────────────────────────────────────
const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

// ── Add wish card ────────────────────────────────────────────────────────
const AddWishCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1.5px dashed var(--border-strong);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 10px;
  color: var(--text-tertiary);

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: rgba(180,83,42,0.02);
  }
`;

const AddWishIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1.5px dashed currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  line-height: 1;
`;

const AddWishLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

// ── Thank-you link ──────────────────────────────────────────────────────
const ThanksCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  text-decoration: none;
  box-shadow: var(--shadow-card);
  transition: border-color 0.15s ease;

  &:hover { border-color: var(--accent-line); }
`;

const ThanksIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--honey-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
`;

const ThanksText = styled.div`
  flex: 1;
  p { margin: 0; }
  p:first-child { font-size: 16px; font-weight: 700; color: var(--text-primary); }
  p:last-child { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
`;

// ── Delete button ────────────────────────────────────────────────────────
const DeleteButton = styled.button`
  background: white;
  color: var(--error);
  border: 1.5px solid var(--error-soft);
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  align-self: flex-start;

  &:hover {
    background: var(--error-soft);
    border-color: var(--error-line);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// ── Invitation overview ─────────────────────────────────────────────────
const Overview = styled.div`
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 24px;
  align-items: start;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const PreviewFrame = styled(Link)`
  display: block;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  text-decoration: none;
  max-height: 520px;
  position: relative;

  /* Fade out the bottom of long invitations */
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 60px;
    background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.85));
    pointer-events: none;
  }
`;

const OverviewSide = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--accent);
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;

  &:hover { background: var(--accent-hover); }
`;

const SecondaryLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--card);
  color: var(--text-primary);
  border: 1.5px solid var(--border);
  padding: 11px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;

  &:hover { border-color: var(--border-strong); }
`;

const RegistryHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const QuietButton = styled.button`
  && {
    background: none;
    color: var(--text-secondary);
    padding: 4px 0;
    font-size: 13px;
    font-weight: 500;
    text-transform: none;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const RegistryNoteField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  span { font-size: 12px; color: var(--text-secondary); }
  textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 11px 14px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    font-size: 14px;
    font-family: inherit;
    line-height: 1.5;
    resize: vertical;
    min-height: 64px;
    background: white;
  }
  textarea:focus { outline: none; border-color: var(--accent); }
`;

// ── Loading state ────────────────────────────────────────────────────────
const LoadingCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 15px;
`;

const Index = (props) => {
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const { user } = useUser();
  const [registryBusy, setRegistryBusy] = useState(false);
  const [registryNote, setRegistryNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(true);

  // Older events were registries before invitations existed, so undefined means on
  const registryOn = props.currentEvent?.registryEnabled !== false;

  useEffect(() => {
    setRegistryNote(props.currentEvent?.registryNote || '');
    setNoteSaved(true);
  }, [props.currentEvent?._id]);

  const updateEvent = async (patch) => {
    const res = await fetch(`/api/updateEvent/${props.currentEvent._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const json = await res.json();
    if (json.success) props.setCurrentEvent(json.data);
    return json.success;
  };

  const setRegistry = async (on) => {
    if (!on && !window.confirm('Hide the gift registry from your invitation? Your wishes and gifts so far are kept, and you can turn it back on any time.')) return;
    setRegistryBusy(true);
    try { await updateEvent({ registryEnabled: on }); } finally { setRegistryBusy(false); }
  };

  const saveRegistryNote = async () => {
    if (noteSaved) return;
    if (await updateEvent({ registryNote })) setNoteSaved(true);
  };

  const checkOnboardingStatus = async (accountId) => {
    const accountRes = await fetch(`/api/checkOnboardingStatus?id=${accountId}`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache', Expires: '0' },
    });
    const onboardingData = await accountRes.json();
    props.setOnboardingData(onboardingData);
  };

  const confirmDelete = async () => {
    if (deleteConfirmation !== props.currentEvent.name) return;
    setIsDeleting(true);
    try {
      await deleteThisEvent(user.sub, props.currentEvent._id, props.setCurrentEvent, props.setEvents, props.setNotes, props.setModalOpen);
      setShowDeleteModal(false);
      setDeleteConfirmation('');
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    getOrCreateNewAccount(
      user.sub, user.email,
      props.setCurrentEvent, props.setAccountId, props.setStripeUserId,
      props.setModalOpen, props.setNotes, props.setAccountSetupComplete, props.setSelectedCurrency
    );
  }, [user]);

  useEffect(() => {
    if (!props.accountId) return;
    checkOnboardingStatus(props.accountId);
  }, [props.accountId]);

  if (!props.currentEvent._id) {
    return (
      <>
        <Page>
          <HeroSpacer style={{ background: 'var(--accent)' }} />
          <Navbar
            selectedCurrency={props.selectedCurrency}
            setSelectedCurrency={props.setSelectedCurrency}
            events={props.events}
            setEvents={props.setEvents}
            currentEvent={props.currentEvent}
            setCurrentEvent={props.setCurrentEvent}
            currentEventStr={props.currentEventStr}
            setCurrentEventStr={props.setCurrentEventStr}
            accountId={props.accountId}
            setAccountId={props.setAccountId}
            accountSetupComplete={props.accountSetupComplete}
            setAccountSetupComplete={props.setAccountSetupComplete}
            stripeUserId={props.stripeUserId}
            setStripeUserId={props.setStripeUserId}
            modalOpen={props.modalOpen}
            setModalOpen={props.setModalOpen}
            notes={props.notes}
            setNotes={props.setNotes}
            onboardingData={props.onboardingData}
            setOnboardingData={props.setOnboardingData}
          />
          <Content>
            {props.modalOpen && (
              <LoadingCard>Let’s make your invitation…</LoadingCard>
            )}
          </Content>
        </Page>
      </>
    );
  }

  return (
    <Page>
      <CoverImage
        uploading={uploading}
        imageUrl={props.currentEvent.imageUrl}
        eventName={props.currentEvent.name}
        eventDate={props.currentEvent.date}
        currEvent={props.currentEvent._id}
        setCurrentEvent={props.setCurrentEvent}
        setUploading={setUploading}
      />
      <Navbar
        selectedCurrency={props.selectedCurrency}
        setSelectedCurrency={props.setSelectedCurrency}
        events={props.events}
        setEvents={props.setEvents}
        currentEvent={props.currentEvent}
        setCurrentEvent={props.setCurrentEvent}
        currentEventStr={props.currentEventStr}
        setCurrentEventStr={props.setCurrentEventStr}
        accountId={props.accountId}
        setAccountId={props.setAccountId}
        accountSetupComplete={props.accountSetupComplete}
        setAccountSetupComplete={props.setAccountSetupComplete}
        stripeUserId={props.stripeUserId}
        setStripeUserId={props.setStripeUserId}
        modalOpen={props.modalOpen}
        setModalOpen={props.setModalOpen}
        notes={props.notes}
        setNotes={props.setNotes}
        onboardingData={props.onboardingData}
        setOnboardingData={props.setOnboardingData}
      />

      <HeroSpacer />

      <Content>
        {/* Invitation */}
        <SectionHeader>
          <SectionTitle>Your invitation</SectionTitle>
        </SectionHeader>

        <Overview>
          <PreviewFrame href="/invitation" aria-label="Edit your invitation">
            <Invitation event={props.currentEvent} compact />
          </PreviewFrame>

          <OverviewSide>
            <ButtonRow>
              <PrimaryLink href="/invitation">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Edit invitation
              </PrimaryLink>
              <SecondaryLink href={senderLink(props.currentEvent.uri)} target="_blank" rel="noopener noreferrer">
                See it as a guest
              </SecondaryLink>
            </ButtonRow>

            <ShareLink currentEvent={props.currentEvent} />

            {props.currentEvent.rsvpEnabled !== false && <RsvpSummary eventId={props.currentEvent._id} />}
          </OverviewSide>
        </Overview>

        {/* Gift registry: an optional extra */}
        {!registryOn ? (
          <RegistryPromo busy={registryBusy} onAdd={() => setRegistry(true)} />
        ) : (
          <>
            <SectionHeader style={{ marginTop: 16 }}>
              <div>
                <SectionTitle>Gift registry</SectionTitle>
                <SectionMeta>
                  {props.notes.length} {props.notes.length === 1 ? 'wish' : 'wishes'} · shown below your invitation
                </SectionMeta>
              </div>
              <RegistryHeaderActions>
                <QuietButton type="button" onClick={() => setRegistry(false)} disabled={registryBusy}>
                  Hide registry
                </QuietButton>
              </RegistryHeaderActions>
            </SectionHeader>

            {!props.accountSetupComplete && <SetupReminder />}

            <RegistryNoteField>
              <label htmlFor="registryNote">A note for guests, above your registry</label>
              <textarea
                id="registryNote"
                value={registryNote}
                maxLength={300}
                placeholder="Your presence is the greatest gift. If you'd like to give something, we've put together a few ideas."
                onChange={(e) => { setRegistryNote(e.target.value); setNoteSaved(false); }}
                onBlur={saveRegistryNote}
              />
              <span>{noteSaved ? 'Optional. Saved automatically.' : 'Saving when you click away…'}</span>
            </RegistryNoteField>

            <CardsGrid>
              {props.notes.map((note) => (
                <WishCard key={note._id} note={note} />
              ))}
              <AddWishCard onClick={() => router.push('/new')}>
                <AddWishIcon>+</AddWishIcon>
                <AddWishLabel>{props.notes.length ? 'Add a gift' : 'Add your first gift'}</AddWishLabel>
              </AddWishCard>
            </CardsGrid>

            {props.accountSetupComplete && (
              <ThanksCard href="/thanks">
                <ThanksIcon aria-hidden="true">💌</ThanksIcon>
                <ThanksText>
                  <p>Say thank you</p>
                  <p>Send everyone who gave a thank-you on WhatsApp or by email</p>
                </ThanksText>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: 'var(--text-tertiary)' }}>
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </ThanksCard>
            )}
          </>
        )}

        {/* Delete event */}
        <DeleteButton
          onClick={() => setShowDeleteModal(true)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Delete invitation
        </DeleteButton>

        <DeleteModal
          isOpen={showDeleteModal}
          eventName={props.currentEvent.name}
          deleteConfirmation={deleteConfirmation}
          setDeleteConfirmation={setDeleteConfirmation}
          isDeleting={isDeleting}
          onCancel={() => { setShowDeleteModal(false); setDeleteConfirmation(''); }}
          onConfirm={confirmDelete}
        />
      </Content>

      <Footer />
    </Page>
  );
};

export default Index;
