import Link from 'next/link';
import styled from 'styled-components';

const LogoMark = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const LogoText = styled.span`
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: ${(p) => (p.$light ? 'white' : 'var(--text-primary)')};
  letter-spacing: -0.01em;

  @media (max-width: 480px) {
    display: none;
  }
`;

// `light` for use over the cover photo (white text)
const Logo = ({ light = false }) => (
  <LogoMark href="/" aria-label="Wishlistagogo home">
    <LogoIcon>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20 12V22H4V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 7H2V12H22V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7H7.5C6.84 7 6.2 6.74 5.73 6.27C5.26 5.8 5 5.16 5 4.5C5 3.84 5.26 3.2 5.73 2.73C6.2 2.26 6.84 2 7.5 2C11 2 12 7 12 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7H16.5C17.16 7 17.8 6.74 18.27 6.27C18.74 5.8 19 5.16 19 4.5C19 3.84 18.74 3.2 18.27 2.73C17.8 2.26 17.16 2 16.5 2C13 2 12 7 12 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </LogoIcon>
    <LogoText $light={light}>Wishlistagogo</LogoText>
  </LogoMark>
);

export default Logo;
