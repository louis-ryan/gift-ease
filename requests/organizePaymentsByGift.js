const organizePaymentsByGift = (payments, wishes, setNotes) => {
  let updatedWishes;

  updatedWishes = [...wishes];

  payments.forEach((payment) => {
    wishes.forEach((wish, idx) => {
      if (payment.giftId !== wish._id) return;

      updatedWishes[idx] = {
        ...wish,
        // wishAmount is the contribution in the wish's own currency
        paid: updatedWishes[idx].paid + payment.wishAmount,
        senders: updatedWishes[idx].senders
          ? [...updatedWishes[idx].senders]
          : [],
      };
      updatedWishes[idx].senders.push(payment.amount);
    });
  });

  setNotes(updatedWishes);
};

export default organizePaymentsByGift;
