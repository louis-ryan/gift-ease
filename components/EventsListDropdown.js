import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import setThisEventToCurrent from '../requests/setThisEventToCurrent';
import getEventsForThisUser from '../requests/getEventsForThisUser';
import getWishesForThisEvent from '../requests/getWishesForThisEvent';

const Wrap = styled.div`
  position: relative;
  min-width: 0;
`;

const Trigger = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 260px;
  height: 40px;
  padding: 0 14px 0 16px;
  background: rgba(255,255,255, 0.18);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255, 0.35);
  border-radius: 20px;
  color: white;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  text-transform: none;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover, &[aria-expanded='true'] {
    background: rgba(255,255,255, 0.28);
    filter: none;
  }
  &:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
  }

  @media (max-width: 480px) {
    max-width: 180px;
  }
`;

const TriggerText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Chevron = styled.svg`
  flex-shrink: 0;
  transition: transform 0.15s ease;
  transform: rotate(${(p) => (p.$open ? '180deg' : '0deg')});
`;

const Panel = styled.ul`
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 240px;
  max-width: 320px;
  max-height: 360px;
  overflow-y: auto;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-raised);
  z-index: 30;
`;

const Option = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  background: ${(p) => (p.$active ? 'var(--surface-soft)' : 'transparent')};

  &[aria-selected='true'] {
    font-weight: 600;
  }
`;

const OptionText = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Check = styled.svg`
  flex-shrink: 0;
  color: var(--accent);
`;

const Separator = styled.li`
  height: 1px;
  margin: 6px 4px;
  background: var(--border);
`;

const AddOption = styled(Option)`
  color: var(--accent);
  font-weight: 600;
`;

const PlusIcon = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: var(--accent-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
`;

const NEW = '__new__';

// The giftee's events as a styled dropdown. "Add new event" is always the last item.
// Keyboard: Enter/Space/↓ opens, ↑/↓ move, Enter selects, Escape closes.
const EventsListDropdown = ({
  user,
  events,
  setEvents,
  setModalOpen,
  currentEvent,
  setCurrentEvent,
  setNotes,
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);

  const list = events || [];
  const items = [...list.map((e) => e._id), NEW];

  useEffect(() => {
    if (!user) return;
    getEventsForThisUser(user.sub, setEvents);
  }, [user]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open]);

  const openPanel = () => {
    const current = items.indexOf(currentEvent?._id);
    setActiveIndex(current >= 0 ? current : 0);
    setOpen(true);
  };

  const choose = (id) => {
    setOpen(false);
    triggerRef.current?.focus();
    if (id === NEW) {
      setModalOpen(true);
      return;
    }
    if (id === currentEvent?._id) return;
    setThisEventToCurrent(id, setCurrentEvent);
    getWishesForThisEvent(id, setNotes);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        openPanel();
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(items[activeIndex]);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <Wrap ref={wrapRef}>
      <Trigger
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="event-list"
        aria-activedescendant={open ? `event-option-${activeIndex}` : undefined}
        onClick={() => (open ? setOpen(false) : openPanel())}
        onKeyDown={onKeyDown}
      >
        <TriggerText>{currentEvent?.name || 'Choose an event'}</TriggerText>
        <Chevron $open={open} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </Chevron>
      </Trigger>

      {open && (
        <Panel id="event-list" role="listbox" aria-label="Your events">
          {list.map((event, i) => (
            <Option
              key={event._id}
              id={`event-option-${i}`}
              role="option"
              aria-selected={event._id === currentEvent?._id}
              $active={i === activeIndex}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => choose(event._id)}
            >
              <OptionText>{event.name}</OptionText>
              {event._id === currentEvent?._id && (
                <Check width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </Check>
              )}
            </Option>
          ))}
          {list.length > 0 && <Separator role="presentation" />}
          <AddOption
            id={`event-option-${list.length}`}
            role="option"
            aria-selected={false}
            $active={activeIndex === list.length}
            onMouseEnter={() => setActiveIndex(list.length)}
            onClick={() => choose(NEW)}
          >
            <PlusIcon aria-hidden="true">+</PlusIcon>
            <OptionText>Add new event</OptionText>
          </AddOption>
        </Panel>
      )}
    </Wrap>
  );
};

export default EventsListDropdown;
