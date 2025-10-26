import { useState, useEffect } from 'react';
import { UserProvider, useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

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
    if (
      !isLoading &&
      !user &&
      router.pathname !== '/api/auth/login' &&
      router.pathname !== '/login'
    ) {
      // Redirect to login page which handles the Auth0 redirect properly
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) return;

  return children;
}

function MyApp({ Component, pageProps }) {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState({});
  const [currentEventStr, setCurrentEventStr] = useState('');
  const [accountId, setAccountId] = useState('');
  const [accountSetupComplete, setAccountSetupComplete] = useState(false);
  const [stripeUserId, setStripeUserId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [onboardingData, setOnboardingData] = useState({
    isDetailsSubmitted: false,
    isEnabled: false,
    payoutsEnabled: false,
  });

  return (
    <>
      <Head>
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
                            if ('serviceWorker' in navigator) {
                                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                                    for(let registration of registrations) {
                                        registration.unregister();
                                    }
                                });
                            }
                        `,
          }}
        />
      </Head>
      <UserProvider>
        <AuthWrapper>
          <Component
            selectedCurrency={selectedCurrency}
            setSelectedCurrency={setSelectedCurrency}
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
    </>
  );
}

export default MyApp;
