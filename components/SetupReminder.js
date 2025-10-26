import React from 'react';
import styled from 'styled-components';

// Styled Components
const SetupReminderContainer = styled.div`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const SetupContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
`;

const SetupIcon = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: #fef3c7;
  border-radius: 50%;
  border: 2px solid #f59e0b;
`;

const SetupText = styled.div`
  flex: 1;
`;

const SetupTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 4px 0;
`;

const SetupDescription = styled.p`
  font-size: 14px;
  color: #92400e;
  margin: 0;
  line-height: 1.5;
`;

const SetupButton = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f59e0b;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background-color: #d97706;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }

  &:hover svg {
    transform: translateX(2px);
  }

  svg {
    transition: transform 0.2s ease;
  }

  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
  }
`;

const SetupReminder = () => {
  return (
    <SetupReminderContainer>
      <SetupContent>
        <SetupIcon>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
              fill="#F59E0B"
            />
            <path
              d="M19 15L19.74 17.74L22.5 18.5L19.74 19.26L19 22L18.26 19.26L15.5 18.5L18.26 17.74L19 15Z"
              fill="#F59E0B"
            />
            <path
              d="M5 6L5.37 7.37L6.74 7.74L5.37 8.11L5 9.5L4.63 8.11L3.26 7.74L4.63 7.37L5 6Z"
              fill="#F59E0B"
            />
          </svg>
        </SetupIcon>
        <SetupText>
          <SetupTitle>Complete Your Account Setup</SetupTitle>
          <SetupDescription>
            To start receiving payments for your wishes, you need to
            complete your Stripe account setup.
          </SetupDescription>
        </SetupText>
        <SetupButton href="/account">
          <span>Complete Setup</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 17L17 7M17 7H7M17 7V17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </SetupButton>
      </SetupContent>
    </SetupReminderContainer>
  );
};

export default SetupReminder;
