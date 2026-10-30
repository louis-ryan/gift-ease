import styled from 'styled-components';
import useRates from '../hooks/useRates';
import { formatMoney, convertWithRates, sameCurrency } from '../utils/money';

const Equivalent = styled.span`
  font-size: 0.85em;
  font-weight: 500;
  color: var(--text-tertiary);
  margin-left: 6px;
  white-space: nowrap;
`;

// An amount in the currency it was sent in, plus the giftee's default-currency equivalent
// when that's different: "€50.00 · ≈ $54.20". Same currency: just "€50.00".
// Equivalents use today's rates, so they're marked ≈.
const Money = ({ amount, currency, defaultCurrency, prefix = '', format = formatMoney }) => {
  const rates = useRates();
  const showEquivalent = defaultCurrency && !sameCurrency(currency, defaultCurrency);
  const converted = showEquivalent ? convertWithRates(amount, currency, defaultCurrency, rates) : null;
  return (
    <>
      {prefix}{format(amount, currency)}
      {converted !== null && <Equivalent>≈ {formatMoney(converted, defaultCurrency)}</Equivalent>}
    </>
  );
};

export default Money;
