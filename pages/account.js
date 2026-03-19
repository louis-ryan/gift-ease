import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import getOrCreateNewAccount from '../requests/getOrCreateNewAccount';
import { COUNTRY_BANK_FORMATS } from '../countryBankFormats';
import CreatePayoutLink from '../components/CreatePayoutLink';
import { renderPersonalInfo, renderBankInfo } from '../components/OnboardingForm';
import BalanceDashboard from '../components/BalanceDashboard';

// ── Layout ────────────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  background: #F9FAFB;
`;

const TopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  border-bottom: 1px solid #F4F4F5;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
`;

const LogoMark = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoText = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #18181B;
  letter-spacing: -0.02em;
`;

const BackBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #F4F4F5;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #3F3F46;
  text-decoration: none;
  transition: background 0.2s ease;
  &:hover { background: #E4E4E7; }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const VerifiedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #D1FAE5;
  color: #065F46;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 600;
`;

const AvatarCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

// ── Body ──────────────────────────────────────────────────────────────────
const Body = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 160px;

  @media (max-width: 900px) {
    padding: 32px 24px;
  }
`;

// ── Account dashboard (verified) ──────────────────────────────────────────
const DashHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
`;

const DashTitle = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 800;
  color: #18181B;
  margin: 0 0 4px 0;
`;

const DashSub = styled.p`
  font-size: 14px;
  color: #71717A;
  margin: 0;
`;

const VerifiedTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #D1FAE5;
  color: #065F46;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
`;

// ── Verification form (unverified) ────────────────────────────────────────
const SetupWrap = styled.div`
  max-width: 640px;
  margin: 0 auto;
`;

const SetupStepLabel = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: #8B5CF6;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 6px 0;
`;

const SetupTitle = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 800;
  color: #18181B;
  margin: 0 0 6px 0;
`;

const SetupSub = styled.p`
  font-size: 14px;
  color: #71717A;
  margin: 0 0 32px 0;
  line-height: 1.6;
`;

const FormCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 28px;
  border: 1px solid #F4F4F5;
  margin-bottom: 16px;
`;

const ErrorMsg = styled.div`
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  border-radius: 10px;
  padding: 14px 16px;
  margin-top: 8px;
`;

const SecurityText = styled.p`
  font-size: 13px;
  color: #166534;
  margin: 0;
  line-height: 1.5;
`;

// ── Component ─────────────────────────────────────────────────────────────
const StripeRegistration = (props) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    country: 'US',
    bankAccount: { account_holder_name: '' },
  });
  const [transactionData, setTransactionData] = useState({
    available_balance: [], pending_balance: [], pending_payouts: [], recent_transfers: [],
  });

  const { user } = useUser();
  const router = useRouter();

  const getFormattedPhone = (formData) => {
    const prefix = COUNTRY_BANK_FORMATS[formData.country]?.phonePrefix || '';
    const cleanPhone = formData.phone.replace(prefix, '');
    return `${prefix}${cleanPhone}`;
  };

  const getTransactionData = async (accountId) => {
    try {
      const res = await fetch(`/api/getStripePaymentsForAccount?accountId=${accountId}`, {
        method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const { payments } = await res.json();
      setTransactionData(payments);
    } catch (error) { console.error('Error fetching payments:', error); }
  };

  const checkOnboardingStatus = async (accountId) => {
    const accountRes = await fetch(`/api/checkOnboardingStatus?id=${accountId}`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache', Expires: '0' },
    });
    const onboardingData = await accountRes.json();
    props.setOnboardingData(onboardingData);
  };

  const setAccountId = async (accountId) => {
    try {
      await fetch(`/api/setAccountId?id=${props.stripeUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache', Expires: '0' },
        body: JSON.stringify({ stripeAccountId: accountId }),
      });
    } catch (error) { console.error('Error setting stripe user account id in Mongo:', error); }
  };

  const setPaymentSetupComplete = async (userId) => {
    try {
      const accountRes = await fetch(`/api/setPaymentSetupComplete?id=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache', Expires: '0' },
      });
      const { data } = await accountRes.json();
      props.setAccountSetupComplete(data.accountSetupComplete);
    } catch (error) { console.error('Error setting setup complete value:', error); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else if (name === 'country') {
      setFormData((prev) => ({ ...prev, [name]: value, bankAccount: { account_holder_name: prev.bankAccount.account_holder_name } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBankAccountChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, bankAccount: { ...prev.bankAccount, [name]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/stripeCustomOnboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, phone: getFormattedPhone(formData) }),
      });
      const data = await response.json();
      if (data.success) {
        props.setAccountId(data.accountId);
        setAccountId(data.accountId);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!router?.query?.setup || !props.stripeUserId) return;
    setPaymentSetupComplete(props.stripeUserId);
  }, [router, props.stripeUserId]);

  useEffect(() => {
    if (!user) return;
    getOrCreateNewAccount(
      user.sub, user.email,
      props.setCurrentEvent, props.setAccountId, props.setStripeUserId,
      props.setModalOpen, props.setNotes, props.setAccountSetupComplete, props.setSelectedCurrency
    );
    setFormData(prev => ({ ...prev, email: user.email }));
  }, [user]);

  useEffect(() => {
    if (!props.accountId) return;
    checkOnboardingStatus(props.accountId);
    getTransactionData(props.accountId);
  }, [props.accountId]);

  if (!props.currentEvent || !user) return null;

  const getUserInitials = () => {
    if (!user.name) return '?';
    return user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Page>
      <TopBar>
        <LogoMark>
          <LogoIcon>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M20 12V22H4V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 7H2V12H22V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7H7.5C6.84 7 6.2 6.74 5.73 6.27C5.26 5.8 5 5.16 5 4.5C5 3.84 5.26 3.2 5.73 2.73C6.2 2.26 6.84 2 7.5 2C11 2 12 7 12 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7H16.5C17.16 7 17.8 6.74 18.27 6.27C18.74 5.8 19 5.16 19 4.5C19 3.84 18.74 3.2 18.27 2.73C17.8 2.26 17.16 2 16.5 2C13 2 12 7 12 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </LogoIcon>
          <LogoText>GiftEasy</LogoText>
        </LogoMark>

        <BackBtn href="/">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Dashboard
        </BackBtn>

        <NavRight>
          {props.accountSetupComplete && (
            <VerifiedBadge>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Verified
            </VerifiedBadge>
          )}
          <AvatarCircle>
            {user.picture ? (
              <AvatarImg src={user.picture} alt="avatar" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : getUserInitials()}
          </AvatarCircle>
        </NavRight>
      </TopBar>

      <Body>
        {props.accountSetupComplete ? (
          /* ── Verified: Account Dashboard ── */
          <>
            <DashHeader>
              <div>
                <DashTitle>Account Dashboard</DashTitle>
                <DashSub>Manage your payments and account settings</DashSub>
              </div>
              <VerifiedTag>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Identity Verified
              </VerifiedTag>
            </DashHeader>
            <BalanceDashboard data={transactionData} />
          </>
        ) : (
          /* ── Unverified: Setup Form ── */
          <SetupWrap>
            {!props.onboardingData.isDetailsSubmitted ? (
              <>
                <SetupStepLabel>Step 1 of 2</SetupStepLabel>
                <SetupTitle>Account Verification</SetupTitle>
                <SetupSub>
                  To receive payments and comply with financial regulations, we need to verify your identity. Your data is encrypted and protected by Stripe.
                </SetupSub>

                <FormCard>
                  {error && <ErrorMsg>{error}</ErrorMsg>}
                  <form onSubmit={handleSubmit}>
                    {step && renderPersonalInfo(formData, handleInputChange, setStep)}
                    {step && renderBankInfo(formData, handleBankAccountChange, setStep, loading)}
                  </form>
                </FormCard>

                <SecurityNote>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12l2 2 4-4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <SecurityText>
                    <strong>Bank-level security</strong> — Your data is encrypted and protected by Stripe's enterprise-grade security infrastructure.
                  </SecurityText>
                </SecurityNote>
              </>
            ) : (
              <>
                <SetupStepLabel>Step 2 of 2</SetupStepLabel>
                <SetupTitle>Complete Setup</SetupTitle>
                <SetupSub>
                  Almost done! Complete your Stripe account setup to start receiving payments for your wishes.
                </SetupSub>
                <FormCard>
                  <CreatePayoutLink accountId={props.accountId} />
                </FormCard>
              </>
            )}
          </SetupWrap>
        )}
      </Body>
    </Page>
  );
};

export default StripeRegistration;
