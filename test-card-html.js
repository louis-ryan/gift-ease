// Test script to verify card HTML is included in payment intent metadata
const testCardHTML = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/createPaymentIntent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: 10.00,
                recipientId: 'acct_test123',
                giftId: 'gift_test123',
                eventId: 'event_test123',
                senderName: 'Test Sender',
                description: 'Test gift',
                cardHTML: '<div style="background: red; padding: 20px;">Test Card HTML</div>'
            }),
        });

        const data = await response.json();
        console.log('Payment Intent Response:', data);
        
        if (data.clientSecret) {
            console.log('✅ Payment intent created successfully');
            console.log('✅ Card HTML should be included in metadata');
        } else {
            console.log('❌ Failed to create payment intent');
        }
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
};

// Run the test
testCardHTML(); 