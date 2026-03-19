import React from 'react';
import styled from 'styled-components';

// ── Layout ────────────────────────────────────────────────────────────────
const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

// ── Stats row ─────────────────────────────────────────────────────────────
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid #F4F4F5;
`;

const StatLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: #71717A;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 6px 0;
`;

const StatValue = styled.p`
  font-size: 24px;
  font-weight: 800;
  color: #18181B;
  margin: 0;
  letter-spacing: -0.02em;
`;

const StatSub = styled.p`
  font-size: 12px;
  color: #A1A1AA;
  margin: 4px 0 0 0;
`;

const BalanceCard = styled.div`
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  border-radius: 14px;
  padding: 20px;
  grid-column: span 1;
`;

const BalanceLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.75);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 6px 0;
`;

const BalanceValue = styled.p`
  font-size: 28px;
  font-weight: 800;
  color: white;
  margin: 0;
  letter-spacing: -0.02em;
`;

const BalanceSub = styled.p`
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  margin: 4px 0 0 0;
`;

// ── Content row ───────────────────────────────────────────────────────────
const ContentRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

// ── Recent transfers ──────────────────────────────────────────────────────
const TransfersCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #F4F4F5;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 17px;
  font-weight: 700;
  color: #18181B;
  margin: 0;
`;

const TransferItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #F9FAFB;

  &:last-child { border-bottom: none; }
`;

const TransferLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TransferAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #F4F4F5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #71717A;
  flex-shrink: 0;
`;

const TransferInfo = styled.div``;

const TransferName = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #18181B;
  margin: 0 0 2px 0;
`;

const TransferDate = styled.p`
  font-size: 12px;
  color: #A1A1AA;
  margin: 0;
`;

const TransferRight = styled.div`
  text-align: right;
`;

const TransferAmount = styled.p`
  font-size: 15px;
  font-weight: 700;
  color: #10B981;
  margin: 0 0 3px 0;
`;

const StatusBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${props => props.$success ? '#D1FAE5' : '#FEE2E2'};
  color: ${props => props.$success ? '#065F46' : '#991B1B'};
`;

const EmptyTransfers = styled.p`
  color: #A1A1AA;
  font-size: 14px;
  text-align: center;
  padding: 24px 0;
  margin: 0;
`;

// ── Payout + Account info ─────────────────────────────────────────────────
const RightStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PayoutCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #F4F4F5;
`;

const PayoutLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: #71717A;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 4px 0;
`;

const PayoutNote = styled.p`
  font-size: 12px;
  color: #A1A1AA;
  margin: 0 0 14px 0;
`;

const PayoutAmount = styled.p`
  font-size: 28px;
  font-weight: 800;
  color: #18181B;
  margin: 0 0 16px 0;
  letter-spacing: -0.02em;
`;

const RequestPayoutBtn = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s ease;
  &:hover { opacity: 0.9; }
`;

const PayoutTiming = styled.p`
  font-size: 12px;
  color: #A1A1AA;
  margin: 10px 0 0 0;
  text-align: center;
`;

const AccountInfoCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #F4F4F5;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #F9FAFB;

  &:last-child { border-bottom: none; }
`;

const InfoLabel = styled.span`
  font-size: 13px;
  color: #71717A;
`;

const InfoValue = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #18181B;
`;

// ── Component ─────────────────────────────────────────────────────────────
const BalanceDashboard = ({ data }) => {
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: currency.toUpperCase(), minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const payments = Array.isArray(data) ? data : [];
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = payments.filter(p => p.status !== 'succeeded').length;
  const lifetimeCount = payments.length;

  return (
    <Wrap>
      {/* Stats */}
      <StatsRow>
        <BalanceCard>
          <BalanceLabel>Available Balance</BalanceLabel>
          <BalanceValue>{formatCurrency(totalPaid)}</BalanceValue>
          <BalanceSub>USD · Ready to pay out</BalanceSub>
        </BalanceCard>
        <StatCard>
          <StatLabel>Pending</StatLabel>
          <StatValue>{formatCurrency(payments.filter(p => p.status !== 'succeeded').reduce((s, p) => s + p.amount, 0))}</StatValue>
          <StatSub>{pendingCount} transaction{pendingCount !== 1 ? 's' : ''}</StatSub>
        </StatCard>
        <StatCard>
          <StatLabel>Lifetime Received</StatLabel>
          <StatValue>{formatCurrency(totalPaid)}</StatValue>
          <StatSub>{lifetimeCount} total payment{lifetimeCount !== 1 ? 's' : ''}</StatSub>
        </StatCard>
      </StatsRow>

      {/* Content */}
      <ContentRow>
        {/* Transfers */}
        <TransfersCard>
          <SectionHeader>
            <SectionTitle>Recent Transfers</SectionTitle>
          </SectionHeader>
          {payments.length > 0 ? payments.map((payment) => (
            <TransferItem key={payment.id}>
              <TransferLeft>
                <TransferAvatar>
                  {payment.id ? payment.id.charAt(3).toUpperCase() : '?'}
                </TransferAvatar>
                <TransferInfo>
                  <TransferName>{payment.id ? payment.id.substring(0, 14) + '…' : 'Payment'}</TransferName>
                  <TransferDate>{payment.date ? formatDate(payment.date) : ''}</TransferDate>
                </TransferInfo>
              </TransferLeft>
              <TransferRight>
                <TransferAmount>+{formatCurrency(payment.amount)}</TransferAmount>
                <StatusBadge $success={payment.status === 'succeeded'}>
                  {payment.status === 'succeeded' ? 'Paid' : 'Pending'}
                </StatusBadge>
              </TransferRight>
            </TransferItem>
          )) : (
            <EmptyTransfers>No transfers yet — share your wishlist to start receiving gifts!</EmptyTransfers>
          )}
        </TransfersCard>

        {/* Right stack */}
        <RightStack>
          <PayoutCard>
            <PayoutLabel>Ready to withdraw</PayoutLabel>
            <PayoutNote>Available in your linked bank account</PayoutNote>
            <PayoutAmount>{formatCurrency(totalPaid)}</PayoutAmount>
            <RequestPayoutBtn>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Request Payout
            </RequestPayoutBtn>
            <PayoutTiming>Payouts typically arrive within 2–3 business days to your linked bank account.</PayoutTiming>
          </PayoutCard>

          <AccountInfoCard>
            <SectionTitle style={{ marginBottom: 12 }}>Account Info</SectionTitle>
            <InfoRow>
              <InfoLabel>Currency</InfoLabel>
              <InfoValue>USD</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Min. payout</InfoLabel>
              <InfoValue>$1.00</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Payout timing</InfoLabel>
              <InfoValue>2–3 business days</InfoValue>
            </InfoRow>
          </AccountInfoCard>
        </RightStack>
      </ContentRow>
    </Wrap>
  );
};

export default BalanceDashboard;
