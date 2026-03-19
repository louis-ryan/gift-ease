import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import styled from 'styled-components';
import NewEventModal from './NewEventModal';
import EventsListDropdown from './EventsListDropdown';

const Nav = styled.nav`
  position: absolute;
  z-index: 10;
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  padding: 0 32px;
  box-sizing: border-box;
`;

const LogoMark = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  cursor: pointer;
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const LogoText = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NavEventPill = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 20px;
  padding: 6px 14px;
`;

const NavEventText = styled.span`
  color: white;
  font-size: 14px;
  font-weight: 500;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AvatarButton = styled(Link)`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
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
        {/* Logo */}
        <LogoMark>
          <LogoIcon>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M20 12V22H4V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 7H2V12H22V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </LogoIcon>
          <LogoText>GiftEasy</LogoText>
        </LogoMark>

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

        {/* Right: Avatar */}
        <NavRight>
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
