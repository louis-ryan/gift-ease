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

    if (!currentEvent) return

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
                                <img height={40} width={40} src={user.picture} alt="profile picture" />
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