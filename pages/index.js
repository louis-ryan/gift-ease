import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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
      props.setAccountSetupComplete
    )
  }, [user])

  useEffect(() => {
    if (!props.accountId) return
    checkOnboardingStatus(props.accountId)
  }, [props.accountId])

  if (!props.currentEvent) return
  if (!user) return
  return (
    <>
      <Navbar
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

          <UploaderComponent
            currEvent={props.currentEvent._id}
            setCurrentEvent={props.setCurrentEvent}
            setUploading={setUploading}
          />

          {props.currentEvent.imageUrl ? (
            <div style={{
              height: "400px",
              overflow: "hidden",
              position: "relative",
              width: "100vw", // Full viewport width
              marginLeft: "calc(-50vw + 50%)", // Centers the div if inside a contained element
              marginRight: "calc(-50vw + 50%)" // Centers the div if inside a contained element
            }}>
              {uploading ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <div>
                    UPLOADING
                  </div>
                </div>
              ) : (
                <img
                  src={props.currentEvent.imageUrl}
                  alt="header image"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "relative",
                    display: "block"
                  }}
                />
              )}

            </div>
          ) : (
            <div style={{
              height: "400px",
              width: "100vw",
              marginLeft: "calc(-50vw + 50%)",
              marginRight: "calc(-50vw + 50%)",
              backgroundColor: "lightgrey"
            }} />
          )}


          <div style={{ position: "absolute", zIndex: "4", top: "392px", backgroundColor: "white", padding: "0px 80px", borderRadius: "8px 8px 0px 0px", marginLeft: "-80px" }}>
            <h1>{props.currentEvent.name ? props.currentEvent.name : "no name"}</h1>
            <h4>{props.currentEvent.date ? formatDate(props.currentEvent.date) : "nodate"}</h4>
          </div>


          <div className="cardspace">
            {props.notes.map((note, idx) => {
              const remainingVal = note.price - note.paid
              const data = [
                { name: "PAID", value: note.paid, color: "#143950" },
                { name: "REMAINING", value: remainingVal, color: "lightgrey" }
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
                        transform: "translate(-50%, -50%)",
                        opacity: "50%"
                      }}
                    />
                  )}

                  <div style={{ backgroundColor: "white", padding: "16px" }}>
                    <h3>{note.title}</h3>
                    <h4>${note.paid} of ${note.price}</h4>
                    <h4>{note.senders && note.senders.length} contributer{note.senders && (note.senders.length < 1 || note.senders.length > 1 && 's')}</h4>
                  </div>

                  <div style={{ height: "16px" }} />


                  {/* <div style={{ display: "flex" }}>
                    {note.senders && note.senders.map((sender) => (
                      <div
                        key={sender}
                        style={{ height: "16px", width: "12px", backgroundColor: "grey", margin: "2px" }}
                      />
                    ))}
                  </div> */}

                  <ResponsiveContainer
                    width="100%"
                    height={160}
                  >
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        paddingAngle={2}
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

                  {/* <button onClick={() => { router.push(`/${note._id}`) }}>
                      {"View"}
                    </button> */}

                  <div className='doublegapver' />
                  <div className='doublegapver' />

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
          <div className='doublegapver' />
          <div className='doublegapver' />
          <div className='doublegapver' />

          {/* <h3>{"Here is the link for you to share:"}</h3>
          <a href={`https://the-registry-web.site/for/${props.currentEvent.uri}`} target="_blank">
            {`the-registry-web.site/for/${props.currentEvent.uri}`}
          </a> */}

          <ShareLink currentEvent={props.currentEvent} />

          <div className='doublegapver' />
          <div className='doublegapver' />
          <div className='doublegapver' />
          <button onClick={handleDeletion}>{"DELETE EVENT"}</button>

        </div>
      </div>
    </>
  )
}

export default Index;