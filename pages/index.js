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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
    setShowDeleteModal(true);
  }

  const confirmDelete = async () => {
    if (deleteConfirmation !== props.currentEvent.name) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteThisEvent(
        user.sub,
        props.currentEvent._id,
        props.setCurrentEvent,
        props.setEvents,
        props.setNotes
      );
      setShowDeleteModal(false);
      setDeleteConfirmation('');
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsDeleting(false);
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteConfirmation('');
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
                  style={{ 
                    position: "relative", 
                    overflow: "hidden",
                    borderRadius: "12px",
                    paddingBottom: "16px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    transform: "scale(1)",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
                    // Scale up the pie chart
                    const chartContainer = e.currentTarget.querySelector('.pie-chart-container');
                    if (chartContainer) {
                      chartContainer.style.transform = "scale(1.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                    // Scale down the pie chart
                    const chartContainer = e.currentTarget.querySelector('.pie-chart-container');
                    if (chartContainer) {
                      chartContainer.style.transform = "scale(1)";
                    }
                  }}
                  onClick={() => { router.push(`/${note._id}`) }}
                >

                  {note.noteUrl && (
                    <img
                      src={note.noteUrl}
                      alt="note image"
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        zIndex: "-1",
                        objectFit: "cover",
                        top: "0",
                        left: "0"
                      }}
                    />
                  )}

                  {note.noteUrl && (
                    <img
                      src={note.noteUrl}
                      alt="note image"
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        zIndex: "2",
                        objectFit: "cover",
                        top: "0",
                        left: "0",
                        maskImage: "radial-gradient(circle at 50% 65%, black 60px, transparent 60px)",
                        WebkitMaskImage: "radial-gradient(circle at 50% 65%, black 60px, transparent 60px)"
                      }}
                    />
                  )}

                  <div style={{ 
                    position: "absolute",
                    top: "0",
                    left: "0",
                    right: "0",
                    bottom: "0",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    backdropFilter: "blur(5px)",
                    borderRadius: "12px",
                    zIndex: "0",
                    maskImage: "radial-gradient(circle at 50% 65%, transparent 60px, black 60px)",
                    WebkitMaskImage: "radial-gradient(circle at 50% 65%, transparent 60px, black 60px)",
                    transition: "all 0.3s ease"
                  }} 
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
                    e.currentTarget.style.backdropFilter = "blur(8px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
                    e.currentTarget.style.backdropFilter = "blur(5px)";
                  }}
                  />

                  <div style={{ 
                    padding: "16px",
                    position: "relative",
                    zIndex: "1"
                  }}>
                    <h3 style={{ 
                      color: "white", 
                      textShadow: "1px 1px 2px rgba(0,0,0,0.5)", 
                      margin: "0 0 8px 0",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: "18px",
                      fontWeight: "700",
                      letterSpacing: "-0.02em",
                      lineHeight: "1.2"
                    }}>{note.title}</h3>
                    <h4 style={{ 
                      color: "white", 
                      textShadow: "1px 1px 2px rgba(0,0,0,0.5)", 
                      margin: "0 0 8px 0",
                      fontSize: "14px",
                      fontWeight: "500",
                      letterSpacing: "0.01em",
                      lineHeight: "1.3",
                      opacity: "0.9"
                    }}>
                      {paidConvert ? paidConvert : note.paid}
                      {note.currency ? note.currency : 'USD'}
                      {' of '}
                      {note.amount ? note.amount : note.price}
                      {note.currency ? note.currency : 'USD'}
                    </h4>
                    <p style={{ 
                      color: "white", 
                      textShadow: "1px 1px 2px rgba(0,0,0,0.5)", 
                      margin: "0",
                      fontSize: "12px",
                      fontWeight: "400",
                      letterSpacing: "0.02em",
                      lineHeight: "1.4",
                      opacity: "0.8",
                      textTransform: "uppercase"
                    }}>
                      {note.senders && note.senders.length}
                      {note.senders ?
                        ` contributer${note.senders.length < 2 ? '' : 's'}` :
                        "no contributions yet"}
                    </p>
                  </div>

                  <div style={{ height: "12px" }} /> {/* Reduced from 16px */}

                  <div 
                    className="pie-chart-container"
                    style={{ 
                      opacity: "0.9",
                      position: "relative",
                      zIndex: "3",
                      transition: "all 0.3s ease",
                      transform: "scale(1)"
                    }}
                  >
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
          <button 
            className="delete-button"
            onClick={handleDeletion}
            disabled={props.events === 0}
          >
            Delete Event
          </button>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="modal-overlay">
              <div className="delete-modal">
                <div className="modal-header">
                  <h3>Delete Event</h3>
                  <p>This action cannot be undone. This will permanently delete the event "{props.currentEvent.name}" and all associated wishes.</p>
                </div>
                
                <div className="modal-body">
                  <p>Please type <strong>{props.currentEvent.name}</strong> to confirm.</p>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Enter event name to confirm"
                    className="confirmation-input"
                    disabled={isDeleting}
                  />
                </div>
                
                <div className="modal-actions">
                  <button 
                    className="cancel-button"
                    onClick={cancelDelete}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button 
                    className="confirm-delete-button"
                    onClick={confirmDelete}
                    disabled={deleteConfirmation !== props.currentEvent.name || isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Event'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>About Gift Easy</h4>
            <p>Making gift-giving simple and collaborative. Create shared wish lists and collect contributions from friends and family.</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/help">Help & Support</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Payment Information</h4>
            <p>Payments are processed securely through Stripe. We do not store or hold your money - all funds are transferred directly to the gift recipient.</p>
          </div>
        </div>
        
        <div className="footer-legal">
          <div className="legal-content">
            <h5>Legal & Payment Disclaimers</h5>
            <div className="legal-text">
              <p><strong>Payment Processing:</strong> All payments are processed securely through Stripe, a PCI-compliant payment processor. Gift Easy acts as a facilitator only - we do not hold, store, or control any funds. Money is transferred directly from contributors to recipients through Stripe's secure payment system.</p>
              
              <p><strong>No Money Holding:</strong> As the developer and operator of Gift Easy, I do not hold, store, or have access to any user funds. All financial transactions are handled directly by Stripe, ensuring complete transparency and security.</p>
              
              <p><strong>Stripe Integration:</strong> This application uses Stripe Connect to enable direct payments between users. Stripe handles all payment processing, fraud protection, and fund transfers. Gift Easy only provides the platform interface and does not touch any financial data or funds.</p>
              
              <p><strong>Privacy:</strong> We respect your privacy. Personal information is used only to facilitate gift-giving and is not shared with third parties except as required for payment processing through Stripe.</p>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Gift Easy. All rights reserved.</p>
        </div>
      </footer>

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

        /* Footer Styles */
        .footer {
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          color: white;
          padding: 60px 0 20px 0;
          margin-top: 80px;
          border-top: 1px solid #374151;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
          margin-bottom: 40px;
        }

        .footer-section h4 {
          color: #f9fafb;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 16px;
          letter-spacing: 0.5px;
        }

        .footer-section p {
          color: #d1d5db;
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section ul li {
          margin-bottom: 8px;
        }

        .footer-section ul li a {
          color: #d1d5db;
          text-decoration: none;
          transition: color 0.2s ease;
          font-size: 0.9rem;
        }

        .footer-section ul li a:hover {
          color: #60a5fa;
        }

        .footer-legal {
          background: rgba(0, 0, 0, 0.2);
          padding: 30px 0;
          border-top: 1px solid #374151;
        }

        .legal-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .legal-content h5 {
          color: #f9fafb;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: center;
        }

        .legal-text {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .legal-text p {
          color: #9ca3af;
          font-size: 0.85rem;
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .legal-text strong {
          color: #d1d5db;
          font-weight: 600;
        }

        .footer-bottom {
          text-align: center;
          padding: 20px 0 0 0;
          border-top: 1px solid #374151;
          margin-top: 30px;
        }

        .footer-bottom p {
          color: #9ca3af;
          font-size: 0.8rem;
          margin: 0;
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .legal-text {
            grid-template-columns: 1fr;
          }

          .footer {
            padding: 40px 0 20px 0;
          }
        }

        /* New styles for delete button and modal */
        .delete-button {
          background-color: #EF4444;
          color: white;
          padding: 12px 24px;
          border-radius: 10px;
          border: none;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.1s ease;
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .delete-button:hover {
          background-color: #DC2626;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(239, 68, 68, 0.3);
        }

        .delete-button:disabled {
          background-color: #F3DEDE;
          color: #9CA3AF;
          cursor: not-allowed;
          box-shadow: none;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .delete-modal {
          background-color: #1F2937;
          border-radius: 15px;
          padding: 30px;
          width: 90%;
          max-width: 450px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .modal-header {
          text-align: center;
        }

        .modal-header h3 {
          color: #F9FAFB;
          font-size: 24px;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .modal-header p {
          color: #D1D5DB;
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 20px;
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .confirmation-input {
          padding: 12px 16px;
          border: 1px solid #4B5563;
          border-radius: 10px;
          background-color: #263238;
          color: #F9FAFB;
          font-size: 16px;
          font-weight: 500;
          transition: border-color 0.2s ease;
        }

        .confirmation-input:focus {
          border-color: #60A5FA;
          outline: none;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
        }

        .modal-actions {
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        .cancel-button,
        .confirm-delete-button {
          flex: 1;
          padding: 12px 20px;
          border-radius: 10px;
          border: none;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.1s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .cancel-button {
          background-color: #4B5563;
          color: #F9FAFB;
        }

        .cancel-button:hover {
          background-color: #374151;
        }

        .confirm-delete-button {
          background-color: #EF4444;
          color: white;
        }

        .confirm-delete-button:hover {
          background-color: #DC2626;
        }

        .confirm-delete-button:disabled {
          background-color: #F3DEDE;
          color: #9CA3AF;
          cursor: not-allowed;
        }
      `}</style>
    </>
  )
}

export default Index;