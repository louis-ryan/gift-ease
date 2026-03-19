import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

const Card = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid #F4F4F5;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(0,0,0,0.12);
  }
`;

const CardImage = styled.div`
  width: 100%;
  height: 180px;
  background: #F4F4F5;
  position: relative;
  overflow: hidden;
`;

const CardImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CardImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardBody = styled.div`
  padding: 16px;
`;

const CardTitle = styled.p`
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  font-weight: 700;
  color: #18181B;
  margin: 0 0 10px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProgressWrap = styled.div`
  margin-bottom: 12px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #F4F4F5;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 6px;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%);
  transition: width 0.4s ease;
`;

const ProgressMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressPaid = styled.span`
  font-size: 12px;
  color: #8B5CF6;
  font-weight: 600;
`;

const ProgressSenders = styled.span`
  font-size: 12px;
  color: #71717A;
`;

const ContributeBtn = styled.button`
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const WishCard = ({ note }) => {
  const router = useRouter();

  const paid = note.paid || 0;
  const total = note.amount || note.price || 0;
  const progress = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  const cur = note.currency || 'USD';
  const senderCount = note.senders?.length || 0;

  return (
    <Card onClick={() => router.push(`/${note._id}`)}>
      <CardImage>
        {note.noteUrl ? (
          <CardImg src={note.noteUrl} alt={note.title} />
        ) : (
          <CardImagePlaceholder>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="#D1D5DB" strokeWidth="1.5"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="#D1D5DB"/>
              <path d="M21 15L16 10L11 15" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3 19L8 14" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </CardImagePlaceholder>
        )}
      </CardImage>

      <CardBody>
        <CardTitle>{note.title}</CardTitle>

        <ProgressWrap>
          <ProgressBar>
            <ProgressFill style={{ width: `${progress}%` }} />
          </ProgressBar>
          <ProgressMeta>
            <ProgressPaid>{paid} {cur} of {total} {cur}</ProgressPaid>
            <ProgressSenders>{senderCount} {senderCount === 1 ? 'contributor' : 'contributors'}</ProgressSenders>
          </ProgressMeta>
        </ProgressWrap>

        <ContributeBtn
          onClick={(e) => { e.stopPropagation(); router.push(`/${note._id}`); }}
        >
          View Details →
        </ContributeBtn>
      </CardBody>
    </Card>
  );
};

export default WishCard;
