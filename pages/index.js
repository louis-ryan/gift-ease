import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Link from 'next/link';
import getCurrentEvent from '../requests/getCurrentEvent';
import deleteThisEvent from '../requests/deleteThisEvent';
import getOrCreateNewAccount from '../requests/getOrCreateNewAccount';
import Navbar from '../components/Navbar';
import WishCard from '../components/WishCard';
import ConnectOnboarding from '../components/ConnectOnboarding';
import CreatePayoutLink from '../components/CreatePayoutLink';
import AccountStatus from '../components/AccountStatus';
import ShareLink from '../components/shareLinkComponent';
import UploaderComponent from '../components/UploaderComponent';
import CoverImage from '../components/CoverImage';


const Index = (props) => {

  const [uploading, setUploading] = useState(false);

  const router = useRouter()
  const { user } = useUser();

  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }



  const checkOnboardingStatus = async (accountId) => {
    const accountRes = await fetch(`/api/checkOnboardingStatus?id=${accountId}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    const onboardingData = await accountRes.json();
    props.setOnboardingData(onboardingData)

  }

  const handleDeletion = () => {
    if (props.events === 0) return
    deleteThisEvent(
      user.sub,
      props.currentEvent._id,
      props.setCurrentEvent,
      props.setEvents,
      props.setNotes
    )
  }

  useEffect(() => {
    if (!user) return
    getOrCreateNewAccount(
      user.sub,
      user.email,
      props.setCurrentEvent,
      props.setAccountId,
      props.setStripeUserId,
      props.setModalOpen,
      props.setNotes,
      props.setAccountSetupComplete,
      props.setSelectedCurrency
    )
  }, [user])

  useEffect(() => {
    if (!props.accountId) return
    checkOnboardingStatus(props.accountId)
  }, [props.accountId])

  if (!props.currentEvent._id) {
    return (
      <>
        <Navbar
          selectedCurrency={props.selectedCurrency}
          setSelectedCurrency={props.setSelectedCurrency}
          events={props.events}
          setEvents={props.setEvents}
          currentEvent={props.currentEvent}
          setCurrentEvent={props.setCurrentEvent}
          currentEventStr={props.currentEventStr}
          setCurrentEventStr={props.setCurrentEventStr}
          accountId={props.accountId}
          setAccountId={props.setAccountId}
          accountSetupComplete={props.accountSetupComplete}
          setAccountSetupComplete={props.setAccountSetupComplete}
          stripeUserId={props.stripeUserId}
          setStripeUserId={props.setStripeUserId}
          modalOpen={props.modalOpen}
          setModalOpen={props.setModalOpen}
          notes={props.notes}
          setNotes={props.setNotes}
          onboardingData={props.onboardingData}
          setOnboardingData={props.setOnboardingData}
        />
        <div className="container">
          <div className="wrapper">
            {props.modalOpen && (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <p>Creating your first event...</p>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }
  return (
    <>
      <Navbar
        selectedCurrency={props.selectedCurrency}
        setSelectedCurrency={props.setSelectedCurrency}
        events={props.events}
        setEvents={props.setEvents}
        currentEvent={props.currentEvent}
        setCurrentEvent={props.setCurrentEvent}
        currentEventStr={props.currentEventStr}
        setCurrentEventStr={props.setCurrentEventStr}
        accountId={props.accountId}
        setAccountId={props.setAccountId}
        accountSetupComplete={props.accountSetupComplete}
        setAccountSetupComplete={props.setAccountSetupComplete}
        stripeUserId={props.stripeUserId}
        setStripeUserId={props.setStripeUserId}
        modalOpen={props.modalOpen}
        setModalOpen={props.setModalOpen}
        notes={props.notes}
        setNotes={props.setNotes}
        onboardingData={props.onboardingData}
        setOnboardingData={props.setOnboardingData}
      />
      <div className="container">
        <div className="wrapper">

          <CoverImage
            uploading={uploading}
            imageUrl={props.currentEvent.imageUrl}
            eventName={props.currentEvent.name}
            eventDate={props.currentEvent.date}
            currEvent={props.currentEvent._id}
            setCurrentEvent={props.setCurrentEvent}
            setUploading={setUploading}
          />

          {/* <div style={{ position: "absolute", zIndex: "4", top: "392px", backgroundColor: "white", padding: "0px 80px", borderRadius: "8px 8px 0px 0px", marginLeft: "-80px" }}>
            <h1>{props.currentEvent.name ? props.currentEvent.name : "no name"}</h1>
            <h4>{props.currentEvent.date ? formatDate(props.currentEvent.date) : "nodate"}</h4>
          </div> */}


          <div className="cardspace">
            {props.notes.map(note => {
              const paidConvert = Math.ceil(note.paid / note.price * note.amount)
              const remainingVal = note.price - note.paid
              const data = [
                { name: "PAID", value: note.paid, color: "#143950" },
                { name: "REMAINING", value: remainingVal, color: "white" }
              ]
              return (
                <div
                  key={note._id}
                  className='card'
                  style={{ position: "relative", overflow: "hidden" }}
                  onClick={() => { router.push(`/${note._id}`) }}
                >

                  {note.noteUrl && (
                    <img
                      src={note.noteUrl}
                      alt="note image"
                      style={{
                        position: "absolute",
                        height: "100%",
                        zIndex: "-1",
                        objectFit: "cover",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)"
                      }}
                    />
                  )}

                  <div style={{ backgroundColor: "white", padding: "16px", opacity: "0.9" }}>
                    <h3>{note.title}</h3>
                    <h4>
                      {paidConvert ? paidConvert : note.paid}
                      {note.currency ? note.currency : 'USD'}
                      {' of '}
                      {note.amount ? note.amount : note.price}
                      {note.currency ? note.currency : 'USD'}
                    </h4>
                    <p>
                      {note.senders && note.senders.length}
                      {note.senders ?
                        ` contributer${note.senders.length < 2 ? '' : 's'}` :
                        "no contributions yet"}
                    </p>
                  </div>

                  <div style={{ height: "12px" }} /> {/* Reduced from 16px */}

                  <div style={{ opacity: "0.9" }}>
                    <ResponsiveContainer
                      width="100%"
                      height={140} /* Reduced from 160px */
                    >
                      <PieChart>
                        <Pie
                          data={data}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={70} /* Reduced from 80px */
                          dataKey="value"
                          paddingAngle={0}
                        >
                          {data.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className='gapver' /> {/* Reduced spacing */}
                  <div className='gapver' />

                </div>
              )

            })}
            <div
              className='card'
              onClick={() => router.push("/new")}
              style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            >
              <h3>{"+ Add a wish"}</h3>
            </div>
          </div>
          <div className='gapver' /> {/* Reduced spacing */}
          <div className='gapver' />

          {/* <h3>{"Here is the link for you to share:"}</h3>
          <a href={`https://the-registry-web.site/for/${props.currentEvent.uri}`} target="_blank">
            {`the-registry-web.site/for/${props.currentEvent.uri}`}
          </a> */}

          {props.accountSetupComplete ? (
            <ShareLink currentEvent={props.currentEvent} />
          ) : (
            <div className="setup-reminder">
              <div className="setup-content">
                <div className="setup-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#F59E0B" />
                    <path d="M19 15L19.74 17.74L22.5 18.5L19.74 19.26L19 22L18.26 19.26L15.5 18.5L18.26 17.74L19 15Z" fill="#F59E0B" />
                    <path d="M5 6L5.37 7.37L6.74 7.74L5.37 8.11L5 9.5L4.63 8.11L3.26 7.74L4.63 7.37L5 6Z" fill="#F59E0B" />
                  </svg>
                </div>
                <div className="setup-text">
                  <h3 className="setup-title">Complete Your Account Setup</h3>
                  <p className="setup-description">
                    To start receiving payments for your wishes, you need to complete your Stripe account setup.
                  </p>
                </div>
                <Link href="/account" className="setup-button">
                  <span>Complete Setup</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>
          )}



          <div className='doublegapver' />
          <div className='doublegapver' />
          <div className='doublegapver' />
          <button onClick={handleDeletion}>{"DELETE EVENT"}</button>

        </div>
      </div>

      <style jsx>{`
        .setup-reminder {
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
          border: 1px solid #F59E0B;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .setup-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .setup-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background-color: #FEF3C7;
          border-radius: 50%;
          border: 2px solid #F59E0B;
        }

        .setup-text {
          flex: 1;
        }

        .setup-title {
          font-size: 18px;
          font-weight: 600;
          color: #92400E;
          margin: 0 0 4px 0;
        }

        .setup-description {
          font-size: 14px;
          color: #92400E;
          margin: 0;
          line-height: 1.5;
        }

        .setup-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #F59E0B;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .setup-button:hover {
          background-color: #D97706;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .setup-button svg {
          transition: transform 0.2s ease;
        }

        .setup-button:hover svg {
          transform: translateX(2px);
        }

        @media (max-width: 640px) {
          .setup-content {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }

          .setup-button {
            width: 100%;
            justify-content: center;
          }
        }

        /* Additional responsive improvements */
        @media (max-width: 768px) {
          .cardspace {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .cardspace {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        @media (min-width: 1025px) {
          .cardspace {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
        }
      `}</style>
    </>
  )
}

export default Index;