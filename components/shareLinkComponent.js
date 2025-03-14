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

  return (
    <div style={{
      padding: '16px',
      border: '1px solid lightgrey',
      borderRadius: '8px',
    }}>
      <h3>Share this event</h3>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '6px'
      }}>
        <a 
          href={fullLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: 'none',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {link}
        </a>
        
        <button
          onClick={copyToClipboard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: copied && '#10b981',
            color: 'white',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>
    </div>
  );
};

export default ShareLink;