import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import getCurrentEvent from '../requests/getCurrentEvent';
import deleteThisEvent from '../requests/deleteThisEvent';
import getOrCreateNewAccount from '../requests/getOrCreateNewAccount';
import Navbar from '../components/Navbar';
import WishCard from '../components/WishCard';
import ConnectOnboarding from '../components/ConnectOnboarding';
import CreatePayoutLink from '../components/CreatePayoutLink';
import AccountStatus from '../components/AccountStatus';
import ShareLink from '../components/shareLinkComponent';
import UploaderComponent from '../components/UploaderComponent';
import CoverImage from '../components/CoverImage';
import Footer from '../components/Footer';
import DeleteModal from '../components/DeleteModal';
import SetupReminder from '../components/SetupReminder';

// Styled Components
const MainContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const Wrapper = styled.div`
  width: 960px;
`;

const Spacer = styled.div`
  height: 200px;
`;

const CardSpace = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  padding: 24px 0;
`;

const Card = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  padding-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: scale(1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
`;




// Delete Button Styled Component
const DeleteButton = styled.button`
  background-color: #ef4444;
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover {
    background-color: #dc2626;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(239, 68, 68, 0.3);
  }

  &:disabled {
    background-color: #f3dede;
    color: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

// Responsive CardSpace updates
const ResponsiveCardSpace = styled(CardSpace)`
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  @media (min-width: 1025px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
`;

const Index = (props) => {
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const { user } = useUser();

  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  const checkOnboardingStatus = async (accountId) => {
    const accountRes = await fetch(
      `/api/checkOnboardingStatus?id=${accountId}`,
      {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
    const onboardingData = await accountRes.json();
    props.setOnboardingData(onboardingData);
  };

  const handleDeletion = () => {
    if (props.events === 0) return;
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteConfirmation !== props.currentEvent.name) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteThisEvent(
        user.sub,
        props.currentEvent._id,
        props.setCurrentEvent,
        props.setEvents,
        props.setNotes
      );
      setShowDeleteModal(false);
      setDeleteConfirmation('');
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteConfirmation('');
  };

  useEffect(() => {
    if (!user) return;
    getOrCreateNewAccount(
      user.sub,
      user.email,
      props.setCurrentEvent,
      props.setAccountId,
      props.setStripeUserId,
      props.setModalOpen,
      props.setNotes,
      props.setAccountSetupComplete,
      props.setSelectedCurrency
    );
  }, [user]);

  useEffect(() => {
    if (!props.accountId) return;
    checkOnboardingStatus(props.accountId);
  }, [props.accountId]);

  if (!props.currentEvent._id) {
    return (
      <>
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
        <div className="container">
          <div className="wrapper">
            {props.modalOpen && (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <p>Creating your first event...</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
  return (
    <>
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
      <MainContainer>
        <Wrapper>
          <Spacer />
          <ResponsiveCardSpace>
            {props.notes.map((note) => (
              <WishCard key={note._id} note={note} />
            ))}
            <Card
              onClick={() => router.push('/new')}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <h3>{'+ Add a wish'}</h3>
            </Card>
          </ResponsiveCardSpace>
          <div className="gapver" /> {/* Reduced spacing */}
          <div className="gapver" />
          {props.accountSetupComplete ? (
            <ShareLink currentEvent={props.currentEvent} />
          ) : (
            <SetupReminder />
          )}
          <div className="doublegapver" />
          <div className="doublegapver" />
          <div className="doublegapver" />
          <DeleteButton
            onClick={handleDeletion}
            disabled={props.events === 0}
          >
            Delete Event
          </DeleteButton>
          <DeleteModal
            isOpen={showDeleteModal}
            eventName={props.currentEvent.name}
            deleteConfirmation={deleteConfirmation}
            setDeleteConfirmation={setDeleteConfirmation}
            isDeleting={isDeleting}
            onCancel={cancelDelete}
            onConfirm={confirmDelete}
          />
        </Wrapper>
      </MainContainer>

      <Footer />

    </>
  );
};

export default Index;
