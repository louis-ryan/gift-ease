import getCurrentEvent from "./getCurrentEvent"

const getOrCreateNewAccount = async (sub, email, setCurrentEvent, setAccountId, setStripeUserId, setModalOpen, setNotes, setAccountSetupComplete, setSelectedCurrency) => {
    console.log('setSelectedCurrency: ', setSelectedCurrency)
    try {
        const res = await fetch(`api/getAccountForThisUser/${sub + '||' + email}`)
        const resJSON = await res.json()
        if (resJSON.success === true) {
            setStripeUserId(resJSON.data._id)
            setAccountId(resJSON.data.stripeAccountId)
            setAccountSetupComplete(resJSON.data.accountSetupComplete)
            setSelectedCurrency(resJSON.data.currency || 'USD')
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