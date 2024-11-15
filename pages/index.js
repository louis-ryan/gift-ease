import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import getCurrentEvent from '../requests/getCurrentEvent';
import deleteThisEvent from '../requests/deleteThisEvent';
import getOrCreateNewAccount from '../requests/getOrCreateNewAccount';
import WishCard from '../components/WishCard';
import ConnectOnboarding from '../components/ConnectOnboarding';
import AccountStatus from '../components/AccountStatus';


const Index = (props) => {

  const [thisWish, setThisWish] = useState({})

  const router = useRouter()
  const { user } = useUser();

  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  const deleteNote = async () => {
    const noteId = router.query.id;
    try {
      const deleted = await fetch(`/api/notes/${noteId}`, {
        method: "Delete"
      });
      console.log("deleted: ", deleted)
      router.push("/");
    } catch (error) {
      console.log(error)
    }
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
      props.setModalOpen,
      props.setNotes,
    )
  }, [user])

  if (!props.currentEvent) return
  if (!user) return
  return (
    <div className="container">
      <div className="wrapper">

        {!thisWish._id &&
          <>
            <div>
              <ConnectOnboarding userId={props.accountId} email={user.email} />
            </div>
            <div>
              <AccountStatus user={user} />
            </div>
            <h1>{props.currentEvent.name}</h1>
            <h4>{formatDate(props.currentEvent.date)}</h4>
            <p>{props.currentEvent.description}</p>
            <div className="cardspace">
              {props.notes.map(note => (
                <div
                  key={note._id}
                  className='card'
                  style={{ marginRight: "16px" }}
                >
                  <h3>{note.title}</h3>
                  <h3>${note.paid} of ${note.price}</h3>
                  <button onClick={() => { router.push(`/${note._id}`) }}>
                    {"View"}
                  </button>

                </div>
              ))}
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
            <button onClick={handleDeletion}>{"DELETE EVENT"}</button>
          </>
        }

        {thisWish._id &&
          <div>
            <h1>{thisWish.title}</h1>
            <p>{thisWish.description}</p>
            <button onClick={deleteNote}>Delete</button>
          </div>
        }
      </div>
    </div>
  )
}

export default Index;