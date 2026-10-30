import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: var(--surface-soft);
  border-top: 1px solid var(--border);
  margin-top: 80px;
  padding: 40px 0 24px;
`;

const LegalContent = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;

  h5 {
    color: var(--text-primary);
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 20px;
    text-align: center;
  }
`;

const LegalText = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px 28px;

  p {
    color: var(--text-secondary);
    font-size: 0.82rem;
    line-height: 1.55;
    margin: 0;
  }

  strong {
    color: var(--text-primary);
    font-weight: 600;
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  padding-top: 20px;
  margin-top: 28px;
  border-top: 1px solid var(--border);

  p {
    color: var(--text-tertiary);
    font-size: 0.8rem;
    margin: 0;
  }
`;

const Footer = () => (
  <FooterContainer>
    <LegalContent>
      <h5>Legal & Payment Disclaimers</h5>
      <LegalText>
        <p>
          <strong>Payment Processing:</strong> All payments are processed securely by Stripe, a
          PCI-compliant payment processor. Card details are handled by Stripe and never touch
          Wishlistagogo.
        </p>
        <p>
          <strong>Where the money goes:</strong> Gifts are paid straight to the recipient&apos;s
          Stripe account and paid out to their bank automatically. Wishlistagogo does not hold
          gift money. A 2% platform fee and the payment processing fee are deducted from each
          gift before it reaches the recipient.
        </p>
        <p>
          <strong>Stripe Integration:</strong> Wishlistagogo uses Stripe Connect. Stripe handles
          payment processing, identity verification, fraud protection and transfers;
          Wishlistagogo provides the wishlist itself.
        </p>
        <p>
          <strong>Privacy:</strong> Personal information is used only to make gift-giving work
          and is not shared with third parties except as needed to process payments through
          Stripe.
        </p>
      </LegalText>
    </LegalContent>

    <FooterBottom>
      <p>&copy; {new Date().getFullYear()} Wishlistagogo. All rights reserved.</p>
    </FooterBottom>
  </FooterContainer>
);

export default Footer;
