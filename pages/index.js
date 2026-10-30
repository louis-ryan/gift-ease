import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import getOrCreateNewAccount from '../requests/getOrCreateNewAccount';
import deleteThisEvent from '../requests/deleteThisEvent';
import Navbar from '../components/Navbar';
import WishCard from '../components/WishCard';
import ConnectOnboarding from '../components/ConnectOnboarding';
import ShareLink from '../components/shareLinkComponent';
import CoverImage from '../components/CoverImage';
import Footer from '../components/Footer';
import DeleteModal from '../components/DeleteModal';
import SetupReminder from '../components/SetupReminder';

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
  padding: 0 0 60px;
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
      await deleteThisEvent(user.sub, props.currentEvent._id, props.setCurrentEvent, props.setEvents, props.setNotes);
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
              <LoadingCard>Creating your first event…</LoadingCard>
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
        {/* Wishes section */}
        <SectionHeader>
          <SectionTitle>My Wishes</SectionTitle>
          <SectionMeta>
            {props.notes.length} {props.notes.length === 1 ? 'wish' : 'wishes'}
          </SectionMeta>
        </SectionHeader>

        <CardsGrid>
          {props.notes.map((note) => (
            <WishCard key={note._id} note={note} />
          ))}
          <AddWishCard onClick={() => router.push('/new')}>
            <AddWishIcon>+</AddWishIcon>
            <AddWishLabel>Add a wish</AddWishLabel>
          </AddWishCard>
        </CardsGrid>

        {/* Share / Setup reminder */}
        {props.accountSetupComplete ? (
          <>
            <ShareLink currentEvent={props.currentEvent} />
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
          </>
        ) : (
          <SetupReminder />
        )}

        {/* Delete event */}
        <DeleteButton
          onClick={() => { if (props.events !== 0) setShowDeleteModal(true); }}
          disabled={props.events === 0}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Delete Event
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
