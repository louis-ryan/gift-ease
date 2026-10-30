import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import styled from 'styled-components';
import NewEventModal from './NewEventModal';
import EventsListDropdown from './EventsListDropdown';
import CurrencyMenu from './CurrencyMenu';
import Logo from './Logo';

const Nav = styled.nav`
  position: absolute;
  z-index: 10;
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  padding: 0 32px;
  gap: 12px;
  box-sizing: border-box;

  @media (max-width: 640px) {
    padding: 0 16px;
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AvatarButton = styled(Link)`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--wood);
  border: 2px solid rgba(255,255,255,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  text-decoration: none;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarInitials = styled.span`
  color: white;
  font-size: 14px;
  font-weight: 600;
`;

const Navbar = ({
  selectedCurrency,
  setSelectedCurrency,
  events,
  setEvents,
  currentEvent,
  setCurrentEvent,
  modalOpen,
  setModalOpen,
  setNotes,
  stripeUserId,
}) => {
  const { user } = useUser();

  const getUserInitials = () => {
    if (!user || !user.name) return '?';
    return user.name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {modalOpen && user && (
        <NewEventModal
          events={events}
          setEvents={setEvents}
          setModalOpen={setModalOpen}
          user={user}
          setCurrentEvent={setCurrentEvent}
          setNotes={setNotes}
        />
      )}
      <Nav>
        <Logo light />

        {/* Center: Event selector */}
        <EventsListDropdown
          user={user}
          events={events}
          setEvents={setEvents}
          setModalOpen={setModalOpen}
          currentEvent={currentEvent}
          setCurrentEvent={setCurrentEvent}
          setNotes={setNotes}
        />

        {/* Right: default currency + account */}
        <NavRight>
          <CurrencyMenu light selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} />
          <AvatarButton href="/account">
            {user && user.picture ? (
              <AvatarImage
                src={user.picture}
                alt="profile"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <AvatarInitials>{getUserInitials()}</AvatarInitials>
            )}
          </AvatarButton>
        </NavRight>
      </Nav>
    </>
  );
};

export default Navbar;
