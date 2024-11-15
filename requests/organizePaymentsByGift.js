const organizePaymentsByGift = (payments, wishes, setNotes) => {

    let updatedWishes

    updatedWishes = [...wishes]

    payments.forEach(payment => {
        console.log("payment: ", payment)
        wishes.forEach((wish, idx) => {
            if (payment.giftId === wish._id) {
                updatedWishes[idx] = { ...wish, paid: wish.paid = wish.paid + payment.amount }
            }
        })
    });

    console.log("updated wishes: ", updatedWishes)

    setNotes(updatedWishes)
}

export default organizePaymentsByGift;