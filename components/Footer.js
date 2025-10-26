import React from 'react';
import styled from 'styled-components';

// Footer Styled Components
const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: white;
  padding: 60px 0 20px 0;
  margin-top: 80px;
  border-top: 1px solid #374151;

  @media (max-width: 768px) {
    padding: 40px 0 20px 0;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const FooterSection = styled.div`
  h4 {
    color: #f9fafb;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 16px;
    letter-spacing: 0.5px;
  }

  p {
    color: #d1d5db;
    line-height: 1.6;
    margin-bottom: 12px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 8px;

      a {
        color: #d1d5db;
        text-decoration: none;
        transition: color 0.2s ease;
        font-size: 0.9rem;

        &:hover {
          color: #60a5fa;
        }
      }
    }
  }
`;

const FooterLegal = styled.div`
  background: rgba(0, 0, 0, 0.2);
  padding: 30px 0;
  border-top: 1px solid #374151;
`;

const LegalContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  h5 {
    color: #f9fafb;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 20px;
    text-align: center;
  }
`;

const LegalText = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;

  p {
    color: #9ca3af;
    font-size: 0.85rem;
    line-height: 1.5;
    margin-bottom: 12px;
  }

  strong {
    color: #d1d5db;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  padding: 20px 0 0 0;
  border-top: 1px solid #374151;
  margin-top: 30px;

  p {
    color: #9ca3af;
    font-size: 0.8rem;
    margin: 0;
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <h4>About Gift Easy</h4>
          <p>
            Making gift-giving simple and collaborative. Create shared wish
            lists and collect contributions from friends and family.
          </p>
        </FooterSection>

        <FooterSection>
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a href="/help">Help & Support</a>
            </li>
            <li>
              <a href="/contact">Contact Us</a>
            </li>
            <li>
              <a href="/terms">Terms of Service</a>
            </li>
            <li>
              <a href="/privacy">Privacy Policy</a>
            </li>
          </ul>
        </FooterSection>

        <FooterSection>
          <h4>Payment Information</h4>
          <p>
            Payments are processed securely through Stripe. We do not store or
            hold your money - all funds are transferred directly to the gift
            recipient.
          </p>
        </FooterSection>
      </FooterContent>

      <FooterLegal>
        <LegalContent>
          <h5>Legal & Payment Disclaimers</h5>
          <LegalText>
            <p>
              <strong>Payment Processing:</strong> All payments are processed
              securely through Stripe, a PCI-compliant payment processor. Gift
              Easy acts as a facilitator only - we do not hold, store, or
              control any funds. Money is transferred directly from
              contributors to recipients through Stripe's secure payment
              system.
            </p>

            <p>
              <strong>No Money Holding:</strong> As the developer and operator
              of Gift Easy, I do not hold, store, or have access to any user
              funds. All financial transactions are handled directly by
              Stripe, ensuring complete transparency and security.
            </p>

            <p>
              <strong>Stripe Integration:</strong> This application uses
              Stripe Connect to enable direct payments between users. Stripe
              handles all payment processing, fraud protection, and fund
              transfers. Gift Easy only provides the platform interface and
              does not touch any financial data or funds.
            </p>

            <p>
              <strong>Privacy:</strong> We respect your privacy. Personal
              information is used only to facilitate gift-giving and is not
              shared with third parties except as required for payment
              processing through Stripe.
            </p>
          </LegalText>
        </LegalContent>
      </FooterLegal>

      <FooterBottom>
        <p>&copy; 2024 Gift Easy. All rights reserved.</p>
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;
