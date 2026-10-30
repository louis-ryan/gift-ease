import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Money from './Money';
import GiftMessageText from './GiftMessageText';
import useRates from '../hooks/useRates';
import { formatMoney, convertWithRates, sameCurrency } from '../utils/money';

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
  border: 1px solid var(--surface);
`;

const StatLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 6px 0;
`;

const StatValue = styled.p`
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
`;

const StatSub = styled.p`
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 4px 0 0 0;
`;

const BalanceCard = styled.div`
  background: var(--accent);
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
  border: 1px solid var(--surface);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const TransferItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--bg);

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
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  flex-shrink: 0;
`;

const TransferInfo = styled.div`
  min-width: 0;
`;

const TransferName = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
`;

const TransferDate = styled.p`
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0;
`;

const TransferRight = styled.div`
  text-align: right;
`;

const TransferAmount = styled.p`
  font-size: 15px;
  font-weight: 700;
  color: var(--success);
  margin: 0 0 3px 0;
`;

const TransferBreakdown = styled.p`
  font-size: 11px;
  color: var(--text-tertiary);
  margin: 0 0 4px 0;
`;

const StatusBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${props => props.$success ? 'var(--success-soft)' : 'var(--error-soft)'};
  color: ${props => props.$success ? 'var(--success-dark)' : 'var(--error-dark)'};
`;

const EmptyTransfers = styled.p`
  color: var(--text-tertiary);
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
  border: 1px solid var(--surface);
`;

const PayoutLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 4px 0;
`;

const PayoutNote = styled.p`
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0 0 14px 0;
`;

const PayoutAmount = styled.p`
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  letter-spacing: -0.02em;
`;


const PayoutTiming = styled.p`
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 12px 0 0 0;
`;

const PayoutRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-top: 1px solid var(--border);
  font-size: 13px;

  span:first-child { color: var(--text-secondary); }
  span:last-child { font-weight: 600; color: var(--text-primary); text-align: right; }
`;

const AutoBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  margin-bottom: 14px;
  border-radius: 999px;
  background: var(--success-soft);
  color: var(--success-dark);
  font-size: 12px;
  font-weight: 600;
`;

const WarnBadge = styled(AutoBadge)`
  background: var(--honey-soft);
  color: var(--warning-dark);
`;

const AccountInfoCard = styled.div`
  background: var(--card);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--border);
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--surface-soft);

  &:last-child { border-bottom: none; }
`;

const InfoLabel = styled.span`
  font-size: 13px;
  color: var(--text-secondary);
`;

const InfoValue = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
`;

const TransferMessage = styled.p`
  font-size: 13px;
  line-height: 1.45;
  color: var(--text-secondary);
  margin: 4px 0 0 0;
  max-width: 340px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ApproxTotal = styled.p`
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 4px 0 0 0;
`;

// ── Component ─────────────────────────────────────────────────────────────
const SCHEDULE_TEXT = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  manual: 'Manual',
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

// `defaultCurrency` is the giftee's account currency: every amount is shown in the currency
// it was sent in, plus its equivalent in the default when they differ
const BalanceDashboard = ({ data, defaultCurrency = 'USD' }) => {
  const rates = useRates();
  const [payout, setPayout] = useState(null);

  useEffect(() => {
    fetch('/api/payoutStatus')
      .then((r) => (r.ok ? r.json() : null))
      .then(setPayout)
      .catch(() => setPayout(null));
  }, []);

  const payments = Array.isArray(data) ? data : [];

  // Totals are kept per currency and listed side by side ("€50.00 + $20.00"), never summed
  // across currencies. `field`: gross gift (amount), fees (totalFee) or the giftee's share (netAmount)
  const totalsByCurrency = (field) =>
    payments.reduce((acc, p) => {
      const cur = (p.currency || 'usd').toUpperCase();
      acc[cur] = (acc[cur] || 0) + (p[field] ?? 0);
      return acc;
    }, {});

  const formatTotals = (field) => {
    const entries = Object.entries(totalsByCurrency(field));
    if (entries.length === 0) return formatMoney(0, defaultCurrency);
    return entries.map(([cur, amount]) => formatMoney(amount, cur)).join(' + ');
  };

  // One overall figure in the default currency, only when more than one currency (or a
  // different one) is involved. Today's rates, so approximate
  const approxTotal = (field) => {
    const entries = Object.entries(totalsByCurrency(field));
    if (!entries.length || (entries.length === 1 && sameCurrency(entries[0][0], defaultCurrency))) return null;
    let sum = 0;
    for (const [cur, amount] of entries) {
      const converted = convertWithRates(amount, cur, defaultCurrency, rates);
      if (converted === null) return null;
      sum += converted;
    }
    return `≈ ${formatMoney(sum, defaultCurrency)} in total`;
  };

  const formatBalances = (list) =>
    list?.length ? list.map((b) => formatMoney(b.amount, b.currency)).join(' + ') : formatMoney(0, defaultCurrency);

  const lifetimeCount = payments.length;
  const schedule = payout?.schedule;
  const scheduleText = schedule
    ? `${SCHEDULE_TEXT[schedule.interval] || schedule.interval}${schedule.delay_days ? `, ${schedule.delay_days}-day delay` : ''}`
    : 'Automatic';

  return (
    <Wrap>
      {/* Stats */}
      <StatsRow>
        <BalanceCard>
          <BalanceLabel>Received after fees</BalanceLabel>
          <BalanceValue>{formatTotals('netAmount')}</BalanceValue>
          <BalanceSub>{approxTotal('netAmount') || 'Yours, paid out automatically'}</BalanceSub>
        </BalanceCard>
        <StatCard>
          <StatLabel>Gifts Received</StatLabel>
          <StatValue>{formatTotals('amount')}</StatValue>
          <StatSub>
            {lifetimeCount} gift{lifetimeCount !== 1 ? 's' : ''} · before fees
            {approxTotal('amount') ? ` · ${approxTotal('amount')}` : ''}
          </StatSub>
        </StatCard>
        <StatCard>
          <StatLabel>Fees</StatLabel>
          <StatValue>{formatTotals('totalFee')}</StatValue>
          <StatSub>2% platform + payment processing</StatSub>
        </StatCard>
      </StatsRow>

      {/* Content */}
      <ContentRow>
        {/* Gifts */}
        <TransfersCard>
          <SectionHeader>
            <SectionTitle>Recent Gifts</SectionTitle>
          </SectionHeader>
          {payments.length > 0 ? payments.map((payment) => (
            <TransferItem key={payment.id}>
              <TransferLeft>
                <TransferAvatar>
                  {payment.senderName ? payment.senderName.charAt(0).toUpperCase() : '?'}
                </TransferAvatar>
                <TransferInfo>
                  <TransferName>{payment.senderName || 'Anonymous'}</TransferName>
                  <TransferDate>{payment.date ? formatDate(payment.date) : ''}</TransferDate>
                  {payment.message && (
                    <TransferMessage><GiftMessageText text={payment.message} /></TransferMessage>
                  )}
                </TransferInfo>
              </TransferLeft>
              <TransferRight>
                <TransferAmount>
                  <Money prefix="+" amount={payment.netAmount ?? payment.amount} currency={payment.currency} defaultCurrency={defaultCurrency} />
                </TransferAmount>
                {payment.totalFee > 0 && (
                  <TransferBreakdown>
                    {formatMoney(payment.amount, payment.currency)} gift · −{formatMoney(payment.totalFee, payment.currency)} fees
                  </TransferBreakdown>
                )}
                <StatusBadge $success={payment.status === 'succeeded'}>
                  {payment.status === 'succeeded' ? 'Paid' : 'Pending'}
                </StatusBadge>
              </TransferRight>
            </TransferItem>
          )) : (
            <EmptyTransfers>No gifts yet. Share your wishlist to start receiving them!</EmptyTransfers>
          )}
        </TransfersCard>

        {/* Right stack */}
        <RightStack>
          {/* Connected accounts are paid out automatically by Stripe, so there's nothing to
              request here: this card only reports what's on its way */}
          <PayoutCard>
            <PayoutLabel>Payouts</PayoutLabel>
            {payout?.connected && payout.payoutsEnabled === false ? (
              <WarnBadge>Payouts paused: Stripe needs more details</WarnBadge>
            ) : (
              <AutoBadge>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Paid out automatically
              </AutoBadge>
            )}
            {payout?.connected ? (
              <>
                <PayoutNote>On its way to your bank</PayoutNote>
                <PayoutAmount>{formatBalances([...(payout.pending || []), ...(payout.available || [])].reduce((acc, b) => {
                  const hit = acc.find((x) => x.currency === b.currency);
                  if (hit) hit.amount += b.amount; else acc.push({ ...b });
                  return acc;
                }, []))}</PayoutAmount>
                {payout.upcomingPayout && (
                  <PayoutRow>
                    <span>Next payout</span>
                    <span>
                      {formatMoney(payout.upcomingPayout.amount, payout.upcomingPayout.currency)} · {formatDate(payout.upcomingPayout.arrivalDate)}
                    </span>
                  </PayoutRow>
                )}
                {payout.lastPayout && (
                  <PayoutRow>
                    <span>Last payout</span>
                    <span>
                      {formatMoney(payout.lastPayout.amount, payout.lastPayout.currency)} · {formatDate(payout.lastPayout.arrivalDate)}
                    </span>
                  </PayoutRow>
                )}
                <PayoutTiming>
                  New gifts become available after Stripe&apos;s standard holding period, then go to
                  {payout.bankLast4 ? ` your account ending ${payout.bankLast4}` : ' your bank account'} automatically. You don&apos;t need to do anything.
                </PayoutTiming>
              </>
            ) : (
              <PayoutTiming>
                {payout === null ? 'Loading payout details…' : 'Gifts are paid out to your bank account automatically.'}
              </PayoutTiming>
            )}
          </PayoutCard>

          <AccountInfoCard>
            <SectionTitle style={{ marginBottom: 12 }}>Account Info</SectionTitle>
            <InfoRow>
              <InfoLabel>Default currency</InfoLabel>
              <InfoValue>{(defaultCurrency || 'USD').toUpperCase()}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Fees per gift</InfoLabel>
              <InfoValue>2% + payment processing</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Payout schedule</InfoLabel>
              <InfoValue>{scheduleText}</InfoValue>
            </InfoRow>
            {payout?.bankLast4 && (
              <InfoRow>
                <InfoLabel>Bank account</InfoLabel>
                <InfoValue>{payout.bankName ? `${payout.bankName} ` : ''}····{payout.bankLast4}</InfoValue>
              </InfoRow>
            )}
          </AccountInfoCard>
        </RightStack>
      </ContentRow>
    </Wrap>
  );
};

export default BalanceDashboard;
