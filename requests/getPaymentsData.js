import organizePaymentsByGift from "./organizePaymentsByGift";

const getPaymentsData = async (eventId, wishes, setNotes) => {
    try {
        const res = await fetch(
            `/api/getStripePaymentsForEvent?eventId=${eventId}`,
            {
                method: 'GET',
                credentials: 'include',  // Important for CORS with credentials
                headers: {
                    'Content-Type': 'application/json',
                    // No need to explicitly set Origin as browser will do this
                }
            }
        );
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const { payments } = await res.json();
        organizePaymentsByGift(payments, wishes, setNotes);
    } catch (error) {
        console.error("Error fetching payments:", error);
    }
}

export default getPaymentsData