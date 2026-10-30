import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import currencies from '../utils/currencyList';

const Wrap = styled.div`
  position: relative;
`;

const Trigger = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  border-radius: 18px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: none;
  cursor: pointer;
  ${(p) =>
    p.$light
      ? `
    background: rgba(255,255,255,0.18);
    border: 1px solid rgba(255,255,255,0.35);
    color: white;
    backdrop-filter: blur(8px);
  `
      : `
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-primary);
  `}

  &:hover {
    filter: none;
    opacity: 0.9;
  }
  &:focus-visible {
    outline: 2px solid ${(p) => (p.$light ? 'white' : 'var(--accent)')};
    outline-offset: 2px;
  }
`;

const Panel = styled.ul`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 230px;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-raised);
  z-index: 30;
`;

const PanelTitle = styled.li`
  padding: 8px 12px 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-tertiary);
`;

const PanelHint = styled.li`
  padding: 0 12px 8px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-secondary);
`;

const Option = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  background: ${(p) => (p.$active ? 'var(--surface-soft)' : 'transparent')};
`;

const Code = styled.span`
  width: 36px;
  font-weight: 700;
`;

const Name = styled.span`
  flex: 1;
  color: var(--text-secondary);
`;

// The giftee's default currency, saved to their account. New wishes start in it and
// received amounts also show their equivalent in it. Existing wishes keep their currency.
const CurrencyMenu = ({ selectedCurrency, setSelectedCurrency, light = false }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [saving, setSaving] = useState(false);
  const wrapRef = useRef(null);
  const current = (selectedCurrency || 'USD').toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const choose = async (code) => {
    setOpen(false);
    if (code === current) return;
    const previous = current;
    setSelectedCurrency(code);
    setSaving(true);
    try {
      const res = await fetch('/api/setAccountCurrency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: code }),
      });
      if (!res.ok) throw new Error('save failed');
    } catch {
      setSelectedCurrency(previous);
      alert("Couldn't save your default currency. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const openPanel = () => {
    setActive(Math.max(0, currencies.findIndex((c) => c.code === current)));
    setOpen(true);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        openPanel();
      }
      return;
    }
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % currencies.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i - 1 + currencies.length) % currencies.length); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(currencies[active].code); }
    else if (e.key === 'Tab') setOpen(false);
  };

  return (
    <Wrap ref={wrapRef}>
      <Trigger
        type="button"
        $light={light}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Default currency: ${current}`}
        title="Default currency"
        onClick={() => (open ? setOpen(false) : openPanel())}
        onKeyDown={onKeyDown}
        disabled={saving}
      >
        {current}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Trigger>
      {open && (
        <Panel role="listbox" aria-label="Default currency">
          <PanelTitle role="presentation">Default currency</PanelTitle>
          <PanelHint role="presentation">For new wishes. Existing wishes keep their currency.</PanelHint>
          {currencies.map((c, i) => (
            <Option
              key={c.code}
              role="option"
              aria-selected={c.code === current}
              $active={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(c.code)}
            >
              <Code>{c.code}</Code>
              <Name>{c.name}</Name>
              {c.code === current && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: 'var(--accent)' }}>
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </Option>
          ))}
        </Panel>
      )}
    </Wrap>
  );
};

export default CurrencyMenu;
