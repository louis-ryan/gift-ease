import React from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  background: linear-gradient(135deg, rgba(139,92,246,0.04) 0%, rgba(236,72,153,0.04) 100%);
  border: 1px solid rgba(139,92,246,0.2);
  border-radius: 16px;
  padding: 24px;
`;

const Inner = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
`;

const IconWrap = styled.div`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TextWrap = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #18181B;
  margin: 0 0 4px 0;
`;

const Description = styled.p`
  font-size: 14px;
  color: #71717A;
  margin: 0;
  line-height: 1.5;
`;

const Btn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
  transition: opacity 0.2s ease;

  &:hover { opacity: 0.9; }

  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
  }
`;

const SetupReminder = () => (
  <Wrap>
    <Inner>
      <IconWrap>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </IconWrap>
      <TextWrap>
        <Title>Complete Your Account Setup</Title>
        <Description>
          To start receiving payments for your wishes, you need to complete your Stripe account setup.
        </Description>
      </TextWrap>
      <Btn href="/account">
        Complete Setup
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Btn>
    </Inner>
  </Wrap>
);

export default SetupReminder;
