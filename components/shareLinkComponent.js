import React, { useState } from 'react';

const ShareLink = ({ currentEvent }) => {
  const [copied, setCopied] = useState(false);
  const link = `the-registry-web.site/for/${currentEvent.uri}`;
  const fullLink = `https://${link}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate QR code URL using a QR code service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(fullLink)}`;

  return (
    <div className="share-container">
      <div className="share-header">
        <div className="share-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37061L8.08273 9.26727C7.54303 8.48822 6.61601 8 5.5 8C3.567 8 2 9.567 2 11.5C2 13.433 3.567 15 5.5 15C6.61601 15 7.54303 14.5118 8.08273 13.7327L15.0227 17.6294C15.0077 17.7508 15 17.8745 15 18C15 19.6569 16.3431 21 18 21C19.6569 21 21 19.6569 21 18C21 16.3431 19.6569 15 18 15C16.3431 15 15 16.3431 15 18C15 18.1255 15.0077 18.2492 15.0227 18.3706L8.08273 14.4739C7.54303 15.253 6.61601 15.7412 5.5 15.7412C3.567 15.7412 2 14.1742 2 12.2412C2 10.3082 3.567 8.74121 5.5 8.74121C6.61601 8.74121 7.54303 9.22941 8.08273 10.0085L15.0227 6.11177C15.0077 5.99033 15 5.86664 15 5.74121C15 4.08436 16.3431 2.74121 18 2.74121C19.6569 2.74121 21 4.08436 21 5.74121C21 7.39806 19.6569 8.74121 18 8.74121Z"
              fill="#3B82F6"
            />
          </svg>
        </div>
        <h3 className="share-title">Share this event</h3>
      </div>

      <div className="share-content">
        <div className="qr-section">
          <div className="qr-code">
            <img
              src={qrCodeUrl}
              alt="QR Code for event link"
              className="qr-image"
            />
            <div className="qr-label">Scan to visit</div>
          </div>
        </div>

        <div className="link-section">
          <div className="link-container">
            <a
              href={fullLink}
              target="_blank"
              rel="noopener noreferrer"
              className="event-link"
            >
              {link}
            </a>

            <button
              onClick={copyToClipboard}
              className={`copy-button ${copied ? 'copied' : ''}`}
            >
              {copied ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 12L11 14L15 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 4V2C8 1.44772 8.44772 1 9 1H19C19.5523 1 20 1.44772 20 2V16C20 16.5523 19.5523 17 19 17H17M8 4H6C5.44772 4 5 4.44772 5 5V19C5 19.5523 5.44772 20 6 20H16C16.5523 20 17 19.5523 17 19V17M8 4C8 4.55228 8.44772 5 9 5H17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          <div className="share-description">
            Share this link with friends and family so they can contribute to
            your wishes
          </div>
        </div>
      </div>

      <style jsx>{`
        .share-container {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .share-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .share-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background-color: #eff6ff;
          border-radius: 50%;
        }

        .share-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .share-content {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }

        .qr-section {
          flex-shrink: 0;
        }

        .qr-code {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .qr-image {
          width: 120px;
          height: 120px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .qr-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }

        .link-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .link-container {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .event-link {
          flex: 1;
          color: #3b82f6;
          text-decoration: none;
          font-family: monospace;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .event-link:hover {
          text-decoration: underline;
        }

        .copy-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          background-color: #3b82f6;
          color: white;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .copy-button:hover:not(.copied) {
          background-color: #2563eb;
          transform: translateY(-1px);
        }

        .copy-button.copied {
          background-color: #10b981;
        }

        .share-description {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        @media (max-width: 640px) {
          .share-content {
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }

          .link-container {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .copy-button {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ShareLink;
