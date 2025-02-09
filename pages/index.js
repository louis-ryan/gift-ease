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


const Index = (props) => {

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

          <div>
            <AccountStatus user={user} />
          </div>
          <h1>{props.currentEvent.name}</h1>
          <h4>{formatDate(props.currentEvent.date)}</h4>
          <p>{props.currentEvent.description}</p>
          <div className="cardspace">
            {props.notes.map(note => {
              const remainingVal = note.price - note.paid
              const data = [
                { name: "PAID", value: note.paid, color: "#143950" },
                { name: "REMAINING", value: remainingVal, color: "lightgrey" }
              ]
              return (
                <div
                  key={note._id}
                  className='card'
                  style={{ marginRight: "5%" }}
                  onClick={() => { router.push(`/${note._id}`) }}
                >
                  <h3>{note.title}</h3>
                  <h4>${note.paid} of ${note.price}</h4>
                  <h4>{note.senders && note.senders.length} contributer{note.senders && (note.senders.length < 1 || note.senders.length > 1 && 's')}</h4>

                  <div style={{ display: "flex" }}>
                    {note.senders && note.senders.map((sender) => (
                      <div
                        key={sender}
                        style={{ height: "16px", width: "12px", backgroundColor: "grey", margin: "2px" }}
                      />
                    ))}
                  </div>

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

          <ShareLink currentEvent={props.currentEvent}/>

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