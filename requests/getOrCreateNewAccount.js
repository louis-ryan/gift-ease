import getCurrentEvent from "./getCurrentEvent"

const getOrCreateNewAccount = async (sub, email, setCurrentEvent, setAccountId, setStripeUserId, setModalOpen, setNotes) => {
    try {
        const res = await fetch(`api/getAccountForThisUser/${sub + '||' + email}`)
        const resJSON = await res.json()
        if (resJSON.success === true) {
            console.log("res: ", resJSON)
            setStripeUserId(resJSON.data._id)
            setAccountId(resJSON.data.stripeAccountId)
            if (!resJSON.data.currentEventStr) {
                setModalOpen(true)
            } else {
                getCurrentEvent(setCurrentEvent, setModalOpen, setNotes, resJSON.data.currentEventStr)
            }
        } else {
            console.log("There has been a problem getting or making your new account")
        }
    } catch (error) {
        console.log("issue getting user's account: ", error)
    }
}

export default getOrCreateNewAccount