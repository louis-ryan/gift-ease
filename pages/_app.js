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
import '../css/theme.css';

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

// Loads the giftee's default currency on whichever page they land on (the dashboard,
// new-wish and account pages also load the full account themselves)
function AccountCurrencyLoader({ setSelectedCurrency }) {
  const { user } = useUser();
  useEffect(() => {
    if (!user) return;
    fetch(`/api/getAccountForThisUser/${user.sub}||${user.email}`)
      .then((r) => r.json())
      .then((res) => { if (res.success && res.data?.currency) setSelectedCurrency(res.data.currency); })
      .catch(() => {});
  }, [user]);
  return null;
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
        <title>Wishlistagogo</title>
        <meta name="description" content="Make a wishlist, share it, and let friends and family chip in." />
        <meta name="theme-color" content="#FBF6EE" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
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
        <AccountCurrencyLoader setSelectedCurrency={setSelectedCurrency} />
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
