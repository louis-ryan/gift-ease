import getEventsForThisUser from './getEventsForThisUser';
import getWishesForThisEvent from './getWishesForThisEvent';

const deleteThisEvent = async (
  sub,
  id,
  setCurrentEvent,
  setEvents,
  setNotes,
  setModalOpen
) => {
  try {
    const res = await fetch(`/api/deleteEvent/${id}`, {
      method: 'DELETE',
    });
    const resJSON = await res.json();

    getEventsForThisUser(sub, setEvents);
    if (!resJSON.success) throw new Error(resJSON.error);
    if (!resJSON.data) {
      // That was their only event: start a new invitation
      setCurrentEvent({});
      setNotes([]);
      if (setModalOpen) setModalOpen(true);
      return;
    }
    setCurrentEvent(resJSON.data);
    getWishesForThisEvent(resJSON.data._id, setNotes);
  } catch (error) {
    console.log('Error trying to delete event');
  }
};

export default deleteThisEvent;
