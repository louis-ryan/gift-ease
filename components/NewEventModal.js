import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import postNewEvent from '../requests/postNewEvent';
import { SENDER_HOST } from '../utils/senderUrl';
import { EVENT_TYPES, typeCopy } from '../utils/invitationDesign';

const slugify = (v) =>
  v
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[']/g, '')
    .replace(/[^a-z0-9-\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

// "Sam & Alex" + wedding → "Sam & Alex's Wedding"
const titleFor = (names, type) => {
  const n = names.trim();
  const suffix = typeCopy(type).title;
  if (!n) return '';
  return suffix ? `${n}${/s$/i.test(n) ? "'" : "'s"} ${suffix}` : n;
};

// Step one of a new invitation: what, whose, when and the link. Everything else is
// filled in on /invitation, where this sends them next.
const NewEventModal = ({
  events,
  setEvents,
  setModalOpen,
  user,
  setCurrentEvent,
  setNotes,
}) => {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const uriEdited = useRef(false);
  const [formData, setFormData] = useState({
    eventType: 'wedding',
    hostNames: '',
    uri: '',
    date: '',
  });

  const handleModal = () => {
    if (!events || events.length === 0) return; // their first invitation: nothing to go back to
    setModalOpen(false);
  };

  const checkUriUniqueness = async (uri) => {
    try {
      const response = await fetch('/api/getEventUris');
      const { data: existingUris } = await response.json();
      return !existingUris.includes(uri);
    } catch (error) {
      console.error('Error checking URI uniqueness:', error);
      return true; // the server checks again when creating
    }
  };

  const debouncedUriCheck = useCallback(
    (() => {
      let timeoutId;
      return (uri) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (uri) {
            const isUnique = await checkUriUniqueness(uri);
            setErrors((prev) => ({
              ...prev,
              uri: isUnique ? undefined : { message: 'This link is already taken' },
            }));
          }
        }, 300);
      };
    })(),
    []
  );

  const update = (patch) => {
    const next = { ...formData, ...patch };
    if (('hostNames' in patch || 'eventType' in patch) && !uriEdited.current) {
      const typeSlug = next.eventType === 'wedding' ? '' : slugify(typeCopy(next.eventType).title);
      next.uri = slugify([next.hostNames, typeSlug].filter(Boolean).join(' '));
      setErrors((prev) => ({ ...prev, uri: undefined }));
      debouncedUriCheck(next.uri);
    }
    if ('uri' in patch) {
      uriEdited.current = true;
      next.uri = slugify(patch.uri);
      setErrors((prev) => ({ ...prev, uri: undefined }));
      debouncedUriCheck(next.uri);
    }
    setFormData(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const created = await postNewEvent(
      user,
      { ...formData, name: titleFor(formData.hostNames, formData.eventType), theme: 'classic' },
      setModalOpen,
      setErrors,
      setEvents,
      setCurrentEvent,
      setNotes
    );
    setSubmitting(false);
    if (created) router.push('/invitation');
  };

  const today = new Date().toISOString().split('T')[0];
  const first = !events || events.length === 0;

  return (
    <>
      <div className="modal-overlay" onClick={handleModal} />
      <div className="modal-backdrop" onClick={handleModal}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h2 className="modal-title">{first ? 'Create your invitation' : 'New invitation'}</h2>
              <p className="modal-sub">Free to make and send. You can add a gift registry later if you like.</p>
            </div>
            {!first && (
              <button className="modal-close-btn" onClick={handleModal} aria-label="Close">
                ×
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-content">
              <div className="input-group">
                <span className="input-label">What are you celebrating?</span>
                <div className="type-chips" role="radiogroup" aria-label="Event type">
                  {Object.entries(EVENT_TYPES).map(([id, t]) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={formData.eventType === id}
                      className={`type-chip${formData.eventType === id ? ' selected' : ''}`}
                      onClick={() => update({ eventType: id })}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="hostNames" className="input-label">
                  {formData.eventType === 'wedding' || formData.eventType === 'engagement' ? 'Your names' : 'Whose celebration is it?'}
                </label>
                <input
                  type="text"
                  id="hostNames"
                  value={formData.hostNames}
                  onChange={(e) => update({ hostNames: e.target.value })}
                  className={`modal-input ${errors.name ? 'input-error' : ''}`}
                  placeholder={formData.eventType === 'wedding' || formData.eventType === 'engagement' ? 'Sam & Alex' : 'Sam'}
                  maxLength={80}
                  required
                  autoFocus
                />
                {errors.name && <div className="error-message">{errors.name.message}</div>}
              </div>

              <div className="input-group">
                <label htmlFor="date" className="input-label">Date</label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  min={today}
                  onChange={(e) => update({ date: e.target.value })}
                  className="modal-input"
                  required
                />
                <div className="date-hint">Not sure yet? Pick your best guess, you can change it later.</div>
              </div>

              <div className="input-group">
                <label htmlFor="uri" className="input-label">Your invitation link</label>
                <div className="url-input-container">
                  <span className="url-prefix">{SENDER_HOST}/for/</span>
                  <input
                    type="text"
                    id="uri"
                    value={formData.uri}
                    onChange={(e) => update({ uri: e.target.value })}
                    className={`modal-input url-input ${errors.uri ? 'input-error' : ''}`}
                    placeholder="sam-and-alex"
                    required
                  />
                </div>
                {errors.uri && <div className="error-message">{errors.uri.message}</div>}
                <div className="url-hint">This can't be changed once guests have it.</div>
              </div>
            </div>

            <div className="modal-actions">
              {!first && (
                <button type="button" onClick={handleModal} className="btn btn-secondary">
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !formData.hostNames.trim() || !formData.uri || !formData.date || !!errors.uri}
              >
                {submitting ? 'Creating…' : 'Create invitation'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 100vw;
          background-color: rgba(0,0,0, 0.6);
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 100vw;
          z-index: 1001;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .modal-container {
          background-color: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0, 0.3);
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px 24px 0 24px;
          border-bottom: 1px solid var(--surface);
          margin-bottom: 24px;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .modal-sub {
          margin: 6px 0 20px;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .type-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .type-chip {
          padding: 9px 14px;
          border-radius: 100px;
          border: 1.5px solid var(--border);
          background: white;
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 500;
          text-transform: none;
          cursor: pointer;
        }

        .type-chip.selected {
          border-color: var(--accent);
          background: var(--accent-soft);
          color: var(--accent);
          font-weight: 600;
        }

        .modal-close-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          background-color: var(--bg);
          color: #333;
        }

        .modal-form {
          padding: 0 24px 24px 24px;
        }

        .form-content {
          margin-bottom: 32px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }

        .input-group:last-child {
          margin-bottom: 0;
        }

        .input-label {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 14px;
        }

        .modal-input {
          padding: 12px 16px;
          border: 2px solid var(--border);
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.2s ease;
          background-color: white;
        }

        .modal-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(180,83,42, 0.1);
        }

        .modal-input.input-error {
          border-color: var(--error);
        }

        .url-input-container {
          display: flex;
          align-items: center;
          border: 2px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .url-input-container:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(180,83,42, 0.1);
        }

        .url-prefix {
          padding: 12px 16px;
          background-color: var(--bg);
          color: var(--text-secondary);
          font-size: 14px;
          border-right: 1px solid var(--border);
          white-space: nowrap;
        }

        .url-input {
          border: none;
          border-radius: 0;
          flex: 1;
        }

        .url-input:focus {
          box-shadow: none;
        }

        .error-message {
          color: var(--error);
          font-size: 14px;
          margin-top: 4px;
        }

        .url-hint {
          color: var(--text-secondary);
          font-size: 14px;
          margin-top: 4px;
        }

        .date-hint {
          color: var(--text-secondary);
          font-size: 14px;
          margin-top: 4px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 32px;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          min-width: 100px;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: var(--accent);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(180,83,42, 0.3);
        }

        .btn-secondary {
          background-color: var(--surface);
          color: var(--text-primary);
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: var(--border);
        }

        @media (max-width: 640px) {
          .modal-container {
            margin: 20px;
            max-height: calc(100vh - 40px);
          }

          .modal-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default NewEventModal;
