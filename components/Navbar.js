import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import styled from 'styled-components';
import NewEventModal from './NewEventModal';
import EventsListDropdown from './EventsListDropdown';
import CurrencySelector from './CurrencySelector';

const Nav = styled.nav`
  position: absolute;
  z-index: 1;
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  padding: 40px 24px;
`;

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ProfilePicture = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileImage = styled.img`
  height: 40px;
  width: 40px;
  border-radius: 50%;
`;

const ProfileFallback = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
`;

const LogoutButton = styled.div`
  display: flex;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  background-color: white;
  cursor: pointer;
`;

const LogoutIcon = styled.img`
  width: 28px;
  height: 28px;
`;

const Gap = styled.div`
  width: 16px;
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

    // Get user picture with fallback
    const getUserPicture = () => {
        if (!user) return '/default-avatar.png'; // Fallback image
        return user.picture || user.picture_url || '/default-avatar.png';
    };

    // Get user initials for fallback
    const getUserInitials = () => {
        if (!user || !user.name) return '?';
        return user.name
            .split(' ')
            .map((name) => name.charAt(0))
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
                <EventsListDropdown
                    user={user}
                    events={events}
                    setEvents={setEvents}
                    setModalOpen={setModalOpen}
                    currentEvent={currentEvent}
                    setCurrentEvent={setCurrentEvent}
                    setNotes={setNotes}
                />
                <LoginContainer>
                    <>
                        {/* <CurrencySelector
                            selectedCurrency={selectedCurrency}
                            setSelectedCurrency={setSelectedCurrency}
                            stripeUserId={stripeUserId}
                        /> */}

                        <Link href="/account">
                            <ProfilePicture>
                                {user && user.picture ? (
                                    <ProfileImage
                                        src={user.picture}
                                        alt="profile picture"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <ProfileFallback show={!user || !user.picture}>
                                    {getUserInitials()}
                                </ProfileFallback>
                            </ProfilePicture>
                        </Link>
                        <Gap />

                        <Link href="/api/auth/logout">
                            <LogoutButton>
                                <LogoutIcon
                                    src={'icon_logout.png'}
                                    alt="logout icon"
                                />
                            </LogoutButton>
                        </Link>
                    </>
                </LoginContainer>
            </Nav>
        </>
    );
};

export default Navbar;
