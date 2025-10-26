import getPaymentsData from './getPaymentsData';

const getWishesForThisEvent = async (id, setNotes) => {
  const res = await fetch(`/api/getWishesForThisEvent/${id}`, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
  const { data } = await res.json();
  const noteDataWithPaid = [];
  data.forEach((note) => {
    noteDataWithPaid.push({ ...note, price: parseFloat(note.price), paid: 0 });
  });
  setNotes(noteDataWithPaid);
  getPaymentsData(id, noteDataWithPaid, setNotes);
};

export default getWishesForThisEvent;
