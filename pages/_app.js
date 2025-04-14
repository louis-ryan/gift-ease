import { useState, useEffect } from 'react';
import { UserProvider, useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';

import '../css/buttons.css';
import '../css/card.css';
import '../css/fonts.css';
import '../css/homepage.css';
import '../css/inputs.css';
import '../css/modal.css';
import '../css/navbar.css';
import '../css/utils.css';

function AuthWrapper({ children }) {
    const { user, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user && router.pathname !== '/api/auth/login') {
            router.push('/api/auth/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) return

    return children;
}

function MyApp({ Component, pageProps }) {

    const [events, setEvents] = useState([]);
    const [currentEvent, setCurrentEvent] = useState({})
    const [currentEventStr, setCurrentEventStr] = useState("")
    const [accountId, setAccountId] = useState("")
    const [accountSetupComplete, setAccountSetupComplete] = useState(false)
    const [stripeUserId, setStripeUserId] = useState("")
    const [modalOpen, setModalOpen] = useState(false)
    const [notes, setNotes] = useState([])
    const [onboardingData, setOnboardingData] = useState({
        isDetailsSubmitted: false,
        isEnabled: false,
        payoutsEnabled: false
    })

    return (
        <UserProvider>
            <AuthWrapper>
                <Component
                    events={events}
                    setEvents={setEvents}
                    currentEvent={currentEvent}
                    setCurrentEvent={setCurrentEvent}
                    currentEventStr={currentEventStr}
                    setCurrentEventStr={setCurrentEventStr}
                    accountId={accountId}
                    setAccountId={setAccountId}
                    accountSetupComplete={accountSetupComplete}
                    setAccountSetupComplete={setAccountSetupComplete}
                    stripeUserId={stripeUserId}
                    setStripeUserId={setStripeUserId}
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    notes={notes}
                    setNotes={setNotes}
                    onboardingData={onboardingData}
                    setOnboardingData={setOnboardingData}
                    {...pageProps}
                />
            </AuthWrapper>
        </UserProvider>
    )
}

export default MyApp