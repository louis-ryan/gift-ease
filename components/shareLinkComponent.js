import React, { useState } from 'react';
import styled from 'styled-components';

const ShareWrap = styled.div`
  background: linear-gradient(135deg, rgba(139,92,246,0.03) 0%, rgba(236,72,153,0.03) 100%);
  border: 1px solid rgba(139,92,246,0.18);
  border-radius: 16px;
  padding: 28px;
`;

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 32px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
`;

const QRWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const QRBox = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  border: 1px solid #E4E4E7;
`;

const QRImg = styled.img`
  width: 100%;
  height: 100%;
`;

const QRLabel = styled.span`
  font-size: 12px;
  color: #71717A;
  font-weight: 500;
`;

const ShareMain = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ShareTitle = styled.p`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 700;
  color: #18181B;
  margin: 0;
`;

const ShareSub = styled.p`
  font-size: 13px;
  color: #71717A;
  margin: -8px 0 0 0;
  line-height: 1.5;
`;

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #FAFAFA;
  border: 1px solid #E4E4E7;
  border-radius: 10px;
`;

const LinkIcon = styled.svg`
  flex-shrink: 0;
  color: #8B5CF6;
`;

const LinkText = styled.span`
  flex: 1;
  font-size: 13px;
  color: #3F3F46;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CopyBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: ${props => props.$copied ? '#10B981' : '#18181B'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease;
  flex-shrink: 0;
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const ActionBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.2s ease;

  &:hover { opacity: 0.85; }

  ${props => props.$variant === 'whatsapp' && `
    background: #22C55E;
    color: white;
  `}
  ${props => props.$variant === 'email' && `
    background: #3B82F6;
    color: white;
  `}
  ${props => props.$variant === 'sms' && `
    background: #8B5CF6;
    color: white;
  `}
`;

const ShareLink = ({ currentEvent }) => {
  const [copied, setCopied] = useState(false);
  const link = `gifteasy.com/for/${currentEvent.uri}`;
  const fullLink = `https://the-registry-web.site/for/${currentEvent.uri}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(fullLink)}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ShareWrap>
      <Row>
        <QRWrap>
          <QRBox>
            <QRImg src={qrCodeUrl} alt="QR code" />
          </QRBox>
          <QRLabel>Scan to open</QRLabel>
        </QRWrap>

        <ShareMain>
          <ShareTitle>Share your wishlist</ShareTitle>
          <ShareSub>Send the link to friends and family so they can contribute to your wishes</ShareSub>

          <LinkRow>
            <LinkIcon width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </LinkIcon>
            <LinkText>{link}</LinkText>
            <CopyBtn $copied={copied} onClick={copyToClipboard}>
              {copied ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  Copy
                </>
              )}
            </CopyBtn>
          </LinkRow>

          <ActionsRow>
            <ActionBtn
              $variant="whatsapp"
              href={`https://wa.me/?text=Check out my wishlist! ${encodeURIComponent(fullLink)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </ActionBtn>
            <ActionBtn
              $variant="email"
              href={`mailto:?subject=My Wishlist&body=Check out my wishlist! ${encodeURIComponent(fullLink)}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Email
            </ActionBtn>
            <ActionBtn
              $variant="sms"
              href={`sms:?body=Check out my wishlist! ${encodeURIComponent(fullLink)}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              SMS
            </ActionBtn>
          </ActionsRow>
        </ShareMain>
      </Row>
    </ShareWrap>
  );
};

export default ShareLink;
