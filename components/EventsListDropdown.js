import { useEffect } from 'react';
import setThisEventToCurrent from '../requests/setThisEventToCurrent';
import getEventsForThisUser from '../requests/getEventsForThisUser';
import getWishesForThisEvent from '../requests/getWishesForThisEvent';

const EventsListDropdown = ({
  user,
  events,
  setEvents,
  setModalOpen,
  currentEvent,
  setCurrentEvent,
  setNotes,
}) => {
  const handleChange = (e) => {
    const id = e.target.value;
    if (id === 'NEW') {
      setModalOpen(true);
      return;
    }
    setThisEventToCurrent(id, setCurrentEvent);
    getWishesForThisEvent(id, setNotes);
  };

  useEffect(() => {
    if (!user) return;
    getEventsForThisUser(user.sub, setEvents);
  }, [user]);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div
        onClick={() => setModalOpen(true)}
        style={{
          fontSize: '16px',
          fontFamily: 'serif',
          color: 'black',
          backgroundColor: 'white',
          height: '40px',
          width: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
        }}
      >
        <div>+</div>
      </div>
      <div className="gaphor" />
      <select
        onChange={handleChange}
        value={currentEvent._id || ''}
        style={{
          fontSize: '16px',
          fontFamily: 'serif',
          height: '40px',
          color: '#426073',
        }}
      >
        {events.map((event) => (
          <option key={event._id} value={event._id} href="#">
            {event.name}
          </option>
        ))}
        {/* <option value={'NEW'}>+ Create New</option> */}
      </select>
    </div>
  );
};

export default EventsListDropdown;
