import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useUser } from '@auth0/nextjs-auth0/client';
import styled from 'styled-components';
import Logo from '../components/Logo';
import Invitation from '../components/Invitation';
import getOrCreateNewAccount from '../requests/getOrCreateNewAccount';
import getEventsForThisUser from '../requests/getEventsForThisUser';
import {
  THEMES, THEME_ORDER, EVENT_TYPES, typeCopy, toDayInput,
} from '../utils/invitationDesign';
import { senderLink, SENDER_HOST } from '../utils/senderUrl';

const MAX_SCHEDULE = 8;

// ── Layout ────────────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  background: var(--bg);
`;

const TopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 20;
  background: white;
  border-bottom: 1px solid var(--surface);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 32px;

  @media (max-width: 640px) { padding: 0 16px; }
`;

const TopActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BackBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  white-space: nowrap;

  &:hover { background: var(--border); }
`;

const SaveBtn = styled.button`
  && {
    padding: 9px 18px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    text-transform: none;
    background: ${(p) => (p.$saved ? 'var(--success)' : 'var(--accent)')};
    color: white;
    white-space: nowrap;
  }
  &&:disabled { opacity: 0.6; cursor: default; }
`;

const Body = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: 32px;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    padding: 16px 16px 96px;
  }
`;

const FormCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 960px) {
    display: ${(p) => (p.$hidden ? 'none' : 'flex')};
  }
`;

const PreviewCol = styled.div`
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 112px);
  overflow-y: auto;

  @media (max-width: 960px) {
    display: ${(p) => (p.$hidden ? 'none' : 'block')};
    position: static;
    max-height: none;
  }
`;

const PreviewLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin: 0 0 8px;

  @media (max-width: 960px) { display: none; }
`;

const MobileToggle = styled.div`
  display: none;

  @media (max-width: 960px) {
    display: flex;
    position: fixed;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    z-index: 30;
    background: var(--text-primary);
    border-radius: 100px;
    padding: 4px;
    box-shadow: var(--shadow-raised);
  }
`;

const ToggleBtn = styled.button`
  && {
    background: ${(p) => (p.$active ? 'white' : 'transparent')};
    color: ${(p) => (p.$active ? 'var(--text-primary)' : 'white')};
    border-radius: 100px;
    padding: 9px 20px;
    font-size: 14px;
    font-weight: 600;
    text-transform: none;
  }
`;

const Card = styled.section`
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CardTitle = styled.h2`
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
`;

const CardHint = styled.p`
  font-size: 13px;
  color: var(--text-secondary);
  margin: -10px 0 0;
  line-height: 1.5;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
`;

const Hint = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
`;

const inputCss = `
  width: 100%;
  box-sizing: border-box;
  padding: 11px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  color: var(--text-primary);
  background: white;

  &:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
`;

const Input = styled.input`${inputCss}`;
const Select = styled.select`${inputCss}`;
const TextArea = styled.textarea`
  ${inputCss}
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
`;

const Themes = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;

  @media (max-width: 480px) { grid-template-columns: repeat(3, 1fr); }
`;

const ThemeBtn = styled.button`
  && {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 10px 6px;
    background: white;
    border: 1.5px solid ${(p) => (p.$selected ? 'var(--accent)' : 'var(--border)')};
    box-shadow: ${(p) => (p.$selected ? '0 0 0 3px var(--accent-soft)' : 'none')};
    border-radius: 12px;
    color: var(--text-primary);
    font-size: 12px;
    font-weight: 600;
    text-transform: none;
  }
`;

const Swatch = styled.span`
  width: 100%;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  line-height: 1;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button`
  && {
    padding: 8px 14px;
    border-radius: 100px;
    border: 1.5px solid ${(p) => (p.$selected ? 'var(--accent)' : 'var(--border)')};
    background: ${(p) => (p.$selected ? 'var(--accent-soft)' : 'white')};
    color: ${(p) => (p.$selected ? 'var(--accent)' : 'var(--text-primary)')};
    font-size: 13px;
    font-weight: ${(p) => (p.$selected ? 600 : 500)};
    text-transform: none;
  }
`;

const ScheduleRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr 36px;
  gap: 8px;
  align-items: center;
`;

const IconBtn = styled.button`
  && {
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 8px;
    background: var(--surface);
    color: var(--text-secondary);
    font-size: 18px;
    font-weight: 500;
  }
`;

const GhostBtn = styled.button`
  && {
    align-self: flex-start;
    background: none;
    color: var(--accent);
    padding: 4px 0;
    font-size: 14px;
    font-weight: 600;
    text-transform: none;
  }
  &&:disabled { color: var(--text-muted); }
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);

  input { width: 18px; height: 18px; accent-color: var(--accent); }
`;

const CoverRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const CoverThumb = styled.div`
  width: 64px;
  height: 80px;
  border-radius: 999px 999px 6px 6px;
  overflow: hidden;
  background: var(--surface);
  flex-shrink: 0;

  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const SmallBtn = styled.button`
  && {
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    text-transform: none;
    background: ${(p) => (p.$quiet ? 'var(--surface)' : 'var(--text-primary)')};
    color: ${(p) => (p.$quiet ? 'var(--text-primary)' : 'white')};
  }
`;

const LinkBox = styled.div`
  font-size: 14px;
  padding: 11px 14px;
  border-radius: 10px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  overflow-wrap: anywhere;
`;

const ErrorText = styled.p`
  margin: 0;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--error-soft);
  color: var(--error-dark);
  font-size: 14px;
`;

const Loading = styled.div`
  padding: 80px 16px;
  text-align: center;
  color: var(--text-secondary);
`;

// The editable fields, from a stored event
const formFrom = (e) => ({
  name: e.name || '',
  eventType: e.eventType || 'wedding',
  theme: e.theme || 'classic',
  hostNames: e.hostNames || '',
  inviteLine: e.inviteLine || '',
  date: toDayInput(e.date),
  startTime: e.startTime || '',
  venueName: e.venueName || '',
  venueAddress: e.venueAddress || '',
  description: e.description || '',
  schedule: (e.schedule || []).map((s) => ({ time: s.time || '', title: s.title || '' })),
  dressCode: e.dressCode || '',
  rsvpEnabled: e.rsvpEnabled !== false,
  rsvpDeadline: toDayInput(e.rsvpDeadline),
  imageUrl: e.imageUrl || '',
});

const MESSAGE_PLACEHOLDER = {
  wedding: "We can't wait to celebrate with you. Join us for the ceremony, followed by dinner and dancing.",
  engagement: "We're engaged! Come and raise a glass with us.",
  party: 'Food, drinks and good company. We would love to see you there.',
  other: 'Tell your guests what to expect.',
};

export default function InvitationEditor(props) {
  const { user } = useUser();
  const event = props.currentEvent || {};
  const [form, setForm] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mobileView, setMobileView] = useState('edit');
  const fileRef = useRef(null);
  const loadedFor = useRef(null);

  useEffect(() => {
    if (!user) return;
    getOrCreateNewAccount(
      user.sub, user.email,
      props.setCurrentEvent, props.setAccountId, props.setStripeUserId,
      props.setModalOpen, props.setNotes, props.setAccountSetupComplete, props.setSelectedCurrency,
    );
  }, [user]);

  // Fill the form once the current event arrives (and again if they switch event)
  useEffect(() => {
    if (!event._id || loadedFor.current === event._id) return;
    loadedFor.current = event._id;
    setForm(formFrom(event));
    setDirty(false);
  }, [event._id]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
    setError('');
  };

  const setScheduleItem = (i, patch) =>
    set({ schedule: form.schedule.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/updateEvent/${event._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Could not save');
      props.setCurrentEvent(json.data);
      if (user) getEventsForThisUser(user.sub, props.setEvents);
      setDirty(false);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const uploadCover = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      let upload = file;
      if (/heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name)) {
        const heic2any = (await import('heic2any')).default;
        upload = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
      }
      const data = new FormData();
      data.append('file', upload);
      const res = await fetch('/api/uploadToAWS', { method: 'POST', body: data });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || 'Upload failed');
      set({ imageUrl: json.url });
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (!form) {
    return (
      <Page>
        <TopBar><Logo /></TopBar>
        <Loading>{props.modalOpen ? 'Create an invitation first from your dashboard.' : 'Loading your invitation…'}</Loading>
      </Page>
    );
  }

  const couple = form.eventType === 'wedding' || form.eventType === 'engagement';
  const justSaved = !dirty && savedAt && Date.now() - savedAt < 4000;

  return (
    <Page>
      <Head><title>Edit invitation · Wishlistagogo</title></Head>
      <TopBar>
        <Logo />
        <TopActions>
          <BackBtn href="/">Dashboard</BackBtn>
          <SaveBtn onClick={save} disabled={saving || uploading || !dirty} $saved={justSaved}>
            {saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}
          </SaveBtn>
        </TopActions>
      </TopBar>

      <Body>
        <FormCol $hidden={mobileView !== 'edit'}>
          {error && <ErrorText role="alert">{error}</ErrorText>}

          <Card>
            <CardTitle>Design</CardTitle>
            <Themes role="radiogroup" aria-label="Design">
              {THEME_ORDER.map((id) => {
                const t = THEMES[id];
                return (
                  <ThemeBtn
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={form.theme === id}
                    $selected={form.theme === id}
                    onClick={() => set({ theme: id })}
                  >
                    <Swatch style={{ background: t.bg, color: t.accent, fontFamily: t.names, fontStyle: t.namesStyle }}>
                      Aa
                    </Swatch>
                    {t.label}
                  </ThemeBtn>
                );
              })}
            </Themes>

            <Field>
              <Label as="span">Photo</Label>
              <CoverRow>
                <CoverThumb>{form.imageUrl && <img src={form.imageUrl} alt="" />}</CoverThumb>
                <SmallBtn type="button" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? 'Uploading…' : form.imageUrl ? 'Change photo' : 'Add a photo'}
                </SmallBtn>
                {form.imageUrl && (
                  <SmallBtn type="button" $quiet onClick={() => set({ imageUrl: '' })}>Remove</SmallBtn>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.heic,.heif"
                  style={{ display: 'none' }}
                  onChange={(e) => uploadCover(e.target.files?.[0])}
                />
              </CoverRow>
              <Hint>A portrait photo of the two of you works best.</Hint>
            </Field>
          </Card>

          <Card>
            <CardTitle>The invitation</CardTitle>
            <Field>
              <Label as="span">Occasion</Label>
              <Chips role="radiogroup" aria-label="Occasion">
                {Object.entries(EVENT_TYPES).map(([id, t]) => (
                  <Chip key={id} type="button" role="radio" aria-checked={form.eventType === id} $selected={form.eventType === id} onClick={() => set({ eventType: id })}>
                    {t.label}
                  </Chip>
                ))}
              </Chips>
            </Field>
            <Field>
              <Label htmlFor="hostNames">{couple ? 'Your names' : 'Whose celebration'}</Label>
              <Input id="hostNames" value={form.hostNames} maxLength={100} placeholder={couple ? 'Sam & Alex' : 'Sam'} onChange={(e) => set({ hostNames: e.target.value })} />
            </Field>
            <Field>
              <Label htmlFor="inviteLine">Invitation line</Label>
              <Input
                id="inviteLine"
                value={form.inviteLine}
                maxLength={160}
                placeholder={typeCopy(form.eventType).line || 'e.g. invite you to join them'}
                onChange={(e) => set({ inviteLine: e.target.value })}
              />
              <Hint>Leave empty to use the line shown.</Hint>
            </Field>
            <Row>
              <Field>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => set({ date: e.target.value })} />
              </Field>
              <Field>
                <Label htmlFor="startTime">Time</Label>
                <Input id="startTime" type="time" value={form.startTime} onChange={(e) => set({ startTime: e.target.value })} />
              </Field>
            </Row>
          </Card>

          <Card>
            <CardTitle>Where</CardTitle>
            <Field>
              <Label htmlFor="venueName">Venue</Label>
              <Input id="venueName" value={form.venueName} maxLength={120} placeholder="The Orangery, Kew Gardens" onChange={(e) => set({ venueName: e.target.value })} />
            </Field>
            <Field>
              <Label htmlFor="venueAddress">Address</Label>
              <TextArea id="venueAddress" style={{ minHeight: 72 }} value={form.venueAddress} maxLength={300} placeholder="Street, town, postcode" onChange={(e) => set({ venueAddress: e.target.value })} />
              <Hint>Guests get an “Open in Maps” link.</Hint>
            </Field>
          </Card>

          <Card>
            <CardTitle>Your message</CardTitle>
            <TextArea
              aria-label="Your message"
              value={form.description}
              maxLength={1000}
              placeholder={MESSAGE_PLACEHOLDER[form.eventType]}
              onChange={(e) => set({ description: e.target.value })}
            />
            <Hint>{form.description.length}/1000</Hint>
          </Card>

          <Card>
            <CardTitle>The day</CardTitle>
            <CardHint>Optional. Ceremony, drinks, dinner, dancing…</CardHint>
            {form.schedule.map((s, i) => (
              <ScheduleRow key={i}>
                <Input type="time" aria-label={`Time ${i + 1}`} value={s.time} onChange={(e) => setScheduleItem(i, { time: e.target.value })} />
                <Input aria-label={`What happens ${i + 1}`} value={s.title} maxLength={80} placeholder="Ceremony" onChange={(e) => setScheduleItem(i, { title: e.target.value })} />
                <IconBtn type="button" aria-label="Remove" onClick={() => set({ schedule: form.schedule.filter((_, j) => j !== i) })}>×</IconBtn>
              </ScheduleRow>
            ))}
            <GhostBtn
              type="button"
              disabled={form.schedule.length >= MAX_SCHEDULE}
              onClick={() => set({ schedule: [...form.schedule, { time: '', title: '' }] })}
            >
              + Add to the day
            </GhostBtn>
            <Field>
              <Label htmlFor="dressCode">Dress code</Label>
              <Input id="dressCode" value={form.dressCode} maxLength={80} placeholder="Optional, e.g. Black tie" onChange={(e) => set({ dressCode: e.target.value })} />
            </Field>
          </Card>

          <Card>
            <CardTitle>RSVPs</CardTitle>
            <Toggle>
              <input type="checkbox" checked={form.rsvpEnabled} onChange={(e) => set({ rsvpEnabled: e.target.checked })} />
              Let guests RSVP on the invitation
            </Toggle>
            {form.rsvpEnabled && (
              <Field>
                <Label htmlFor="rsvpDeadline">Reply by</Label>
                <Input id="rsvpDeadline" type="date" value={form.rsvpDeadline} max={form.date || undefined} onChange={(e) => set({ rsvpDeadline: e.target.value })} />
                <Hint>Optional. Replies close after this day.</Hint>
              </Field>
            )}
          </Card>

          <Card>
            <CardTitle>Title and link</CardTitle>
            <Field>
              <Label htmlFor="name">Title</Label>
              <Input id="name" value={form.name} maxLength={100} onChange={(e) => set({ name: e.target.value })} />
              <Hint>Shown on your dashboard and when the link is shared in WhatsApp or iMessage.</Hint>
            </Field>
            <Field>
              <Label as="span">Link</Label>
              <LinkBox>{SENDER_HOST}/for/{event.uri}</LinkBox>
              <Hint>
                <a href={senderLink(event.uri)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: 'inherit', fontWeight: 600 }}>
                  Open as a guest
                </a>
                {dirty ? ' (save first to see your changes)' : ''}
              </Hint>
            </Field>
          </Card>
        </FormCol>

        <PreviewCol $hidden={mobileView !== 'preview'}>
          <PreviewLabel>Preview</PreviewLabel>
          <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            <Invitation event={{ ...form, uri: event.uri }}>
              {form.rsvpEnabled && <span className="preview-rsvp">RSVP</span>}
            </Invitation>
          </div>
        </PreviewCol>
      </Body>

      <MobileToggle>
        <ToggleBtn type="button" $active={mobileView === 'edit'} onClick={() => setMobileView('edit')}>Edit</ToggleBtn>
        <ToggleBtn type="button" $active={mobileView === 'preview'} onClick={() => { setMobileView('preview'); window.scrollTo({ top: 0 }); }}>Preview</ToggleBtn>
      </MobileToggle>

      <style jsx global>{`
        .preview-rsvp {
          display: inline-block;
          padding: 12px 36px;
          background: var(--inv-accent);
          color: var(--inv-card);
          font-size: 13px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          border-radius: 2px;
        }
      `}</style>
    </Page>
  );
}
