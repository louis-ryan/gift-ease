import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import NewEventModal from './NewEventModal';
import EventsListDropdown from './EventsListDropdown';
import CurrencySelector from './CurrencySelector';


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
    stripeUserId
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
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            {modalOpen && user &&
                <NewEventModal
                    events={events}
                    setEvents={setEvents}
                    setModalOpen={setModalOpen}
                    user={user}
                    setCurrentEvent={setCurrentEvent}
                    setNotes={setNotes}
                />
            }
            <nav className="navbar">
                <EventsListDropdown
                    user={user}
                    events={events}
                    setEvents={setEvents}
                    setModalOpen={setModalOpen}
                    currentEvent={currentEvent}
                    setCurrentEvent={setCurrentEvent}
                    setNotes={setNotes}
                />
                <div className="logincontainer">

                    <>
                        {/* <CurrencySelector
                            selectedCurrency={selectedCurrency}
                            setSelectedCurrency={setSelectedCurrency}
                            stripeUserId={stripeUserId}
                        /> */}

                        <Link href="/account">
                            <div className='profilepicture'>
                                {user && user.picture ? (
                                    <img 
                                        height={40} 
                                        width={40} 
                                        src={user.picture} 
                                        alt="profile picture"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div 
                                    className="profile-fallback"
                                    style={{ 
                                        display: user && user.picture ? 'none' : 'flex',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}
                                >
                                    {getUserInitials()}
                                </div>
                            </div>
                        </Link>
                        <div className='doublegaphor' />

                        <Link href="/api/auth/logout">
                            <img
                                src={"icon_logout.png"}
                                alt="logout icon"
                                style={{ height: "40px" }}

                            />
                        </Link>
                    </>

                </div>
            </nav>
        </>
    )
}

export default Navbar;