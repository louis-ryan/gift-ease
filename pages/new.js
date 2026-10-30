import { useState, useEffect, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import getOrCreateNewAccount from '../requests/getOrCreateNewAccount';
import Link from 'next/link';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';
import currencies from '../utils/currencyList';
import { formatGoal } from '../utils/money';
import styled from 'styled-components';
import Logo from '../components/Logo';

// ── Layout ────────────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  background: var(--bg);
`;

const TopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  border-bottom: 1px solid var(--surface);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
`;

const BackBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  transition: background 0.2s ease;

  &:hover { background: var(--border); }
`;

const Body = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 160px;
  display: flex;
  gap: 40px;
  align-items: flex-start;

  @media (max-width: 900px) {
    flex-direction: column;
    padding: 32px 24px;
    gap: 24px;
  }
`;

// ── Form panel ────────────────────────────────────────────────────────────
const FormPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const PageTitle = styled.h1`
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 4px 0;
`;

const PageSub = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--surface);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CardTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
`;

const Input = styled.input`
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  background: white;
  transition: border-color 0.2s ease;
  outline: none;

  &:focus { border-color: var(--accent); }
  &.error { border-color: var(--error); }
  &::placeholder { color: var(--text-tertiary); }
`;

const Textarea = styled.textarea`
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  background: white;
  resize: vertical;
  min-height: 90px;
  transition: border-color 0.2s ease;
  outline: none;
  font-family: inherit;

  &:focus { border-color: var(--accent); }
  &.error { border-color: var(--error); }
  &::placeholder { color: var(--text-tertiary); }
`;

const ErrorMsg = styled.span`
  color: var(--error);
  font-size: 12px;
  font-weight: 500;
`;

const CharCount = styled.div`
  font-size: 12px;
  color: var(--text-tertiary);
  text-align: right;
`;

const PriceRow = styled.div`
  display: flex;
  gap: 10px;
`;

const CurrencySelect = styled.select`
  padding: 10px 12px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: var(--text-primary);
  outline: none;
  cursor: pointer;
  min-width: 90px;

  &:focus { border-color: var(--accent); }
`;

const PriceInput = styled(Input)`
  flex: 1;
`;

// ── URL fetch bar ─────────────────────────────────────────────────────────
const FetchRow = styled.div`
  display: flex;
  gap: 10px;
`;

const FetchBtn = styled.button`
  padding: 10px 16px;
  background: var(--text-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s ease;

  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const StatusMsg = styled.div`
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;

  &.success { background: var(--success-soft); color: var(--success-dark); }
  &.error   { background: var(--error-soft); color: var(--error-dark); }
  &.warning { background: var(--honey-soft); color: var(--warning-dark); }
`;

// ── Image upload ──────────────────────────────────────────────────────────
const UploadArea = styled.div`
  border: 1.5px dashed var(--border-strong);
  border-radius: 12px;
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  background: var(--bg);
  transition: all 0.2s ease;

  &:hover, &.drag-active { border-color: var(--accent); background: rgba(180,83,42,0.03); }
  &.has-preview { padding: 0; border: none; background: transparent; }
`;

const UploadPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
`;

const UploadText = styled.p`
  font-size: 14px;
  color: var(--text-primary);
  margin: 0;
`;

const UploadLink = styled.span`
  color: var(--accent);
  text-decoration: underline;
  cursor: pointer;
`;

const UploadHint = styled.p`
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0;
`;

const UploadLoading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 8px;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top: 3px solid var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;

const ImgPreview = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
`;

const PreviewImg = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
`;

const ChangeImgBtn = styled.button`
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0,0,0,0.65);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 7px 14px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover { background: rgba(0,0,0,0.8); }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-tertiary);
  font-size: 13px;
  margin: 4px 0;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }
`;

const UrlRow = styled.div`
  display: flex;
  gap: 10px;
`;

const UrlInput = styled(Input)`
  flex: 1;
  &:disabled { background: var(--bg); color: var(--text-secondary); cursor: not-allowed; }
`;

const UrlBtn = styled.button`
  padding: 10px 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s ease;
  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

// ── Submit ────────────────────────────────────────────────────────────────
const SubmitBtn = styled.button`
  padding: 14px 28px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s ease;

  &:hover:not(:disabled) { opacity: 0.9; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

// ── Preview panel ─────────────────────────────────────────────────────────
const PreviewPanel = styled.div`
  width: 300px;
  flex-shrink: 0;
  position: sticky;
  top: 88px;

  @media (max-width: 900px) {
    width: 100%;
    position: static;
  }
`;

const PreviewCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--surface);
  box-shadow: 0 4px 16px rgba(91,58,33,0.08);
`;

const PreviewImgBox = styled.div`
  width: 100%;
  height: 180px;
  background: var(--surface);
  overflow: hidden;
`;

const PreviewImgFull = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PreviewBody = styled.div`
  padding: 16px;
`;

const PreviewTitle = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px 0;
`;

const PreviewDesc = styled.p`
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const PreviewPrice = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 14px;
`;

const PreviewPriceVal = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: var(--accent);
`;

const PreviewPriceCur = styled.span`
  font-size: 13px;
  color: var(--text-secondary);
`;

const PreviewProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: var(--surface);
  border-radius: 999px;
  margin-bottom: 6px;
  overflow: hidden;
`;

const PreviewProgressFill = styled.div`
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, var(--accent) 0%, var(--accent) 100%);
  border-radius: 999px;
`;

const PreviewMeta = styled.p`
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0 0 14px 0;
`;

const PreviewCTA = styled.div`
  width: 100%;
  padding: 10px;
  background: var(--accent);
  color: white;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
`;

const PreviewHint = styled.p`
  font-size: 12px;
  color: var(--text-tertiary);
  text-align: center;
  margin: 10px 0 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
`;

// ── Warning ───────────────────────────────────────────────────────────────
const EventWarning = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--honey-soft);
  border: 1px solid var(--honey);
  border-radius: 10px;
  color: var(--warning-dark);
  font-size: 13px;
  font-weight: 500;
`;

// ── Component ─────────────────────────────────────────────────────────────
const NewNote = (props) => {
  const [form, setForm] = useState({
    event: props.currentEvent._id,
    title: '',
    currency: props.selectedCurrency || 'USD',
    amount: '',
    description: '',
    noteUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' | 'warning' | 'error'
  const [dragActive, setDragActive] = useState(false);
  const [productUrl, setProductUrl] = useState('');
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    if (isSubmitting) {
      if (Object.keys(errors).length === 0) createNote();
      else setIsSubmitting(false);
    }
  }, [errors]);

  useEffect(() => {
    if (!user) return;
    getOrCreateNewAccount(
      user.sub, user.email,
      props.setCurrentEvent, props.setAccountId, props.setStripeUserId,
      props.setModalOpen, props.setNotes, props.setAccountSetupComplete, props.setSelectedCurrency,
    );
  }, [user]);

  // Start the wish in the account's default currency once it loads, unless the giftee (or
  // a product lookup) has already picked one for this wish. Changing it here never
  // changes the default; that's the currency menu in the top bar
  const currencyChosen = useRef(false);
  useEffect(() => {
    if (props.selectedCurrency && !currencyChosen.current) {
      setForm((prev) => ({ ...prev, currency: props.selectedCurrency }));
    }
  }, [props.selectedCurrency]);

  const createNote = async () => {
    try {
      const event = form.event || props.currentEvent?._id;
      if (!event) throw new Error('No event selected. Please refresh the page and try again.');

      const noteRes = await fetch('/api/notes', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        // The server fills in the USD price from amount + currency
        body: JSON.stringify({ ...form, event }),
      });
      if (!noteRes.ok) {
        const { error } = await noteRes.json();
        throw new Error(error || 'Failed to save wish');
      }
      router.push('/');
    } catch (error) {
      console.error(error);
      alert(error.message);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors(validate(form));
  };

  const validate = (form) => {
    const errors = {};
    if (!form.title) errors.title = 'Title is required';
    if (!(parseFloat(form.amount) > 0)) errors.amount = 'Amount is required';
    if (!form.description) errors.description = 'Description is required';
    else if (form.description.length > 1000) errors.description = 'Description cannot be more than 1000 characters';
    return errors;
  };

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await fetch('api/uploadToAWS', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const resJSON = await response.json();
      setForm({ ...form, noteUrl: resJSON.url });
    } catch (error) {
      console.log('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) return;
      handleUpload(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validateImageUrl = (url) => {
    try { new URL(url); return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url); }
    catch { return false; }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) { alert('Please enter a valid image URL'); return; }
    if (!validateImageUrl(urlInput)) { alert('Please enter a valid image URL (jpg, jpeg, png, gif, webp, svg)'); return; }
    setUrlLoading(true); setUploading(true);
    try {
      await new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = resolve; img.onerror = reject; img.src = urlInput;
      });
      setPreview(urlInput);
      setForm((prev) => ({ ...prev, noteUrl: urlInput }));
      setUrlInput('');
    } catch (error) {
      alert('The provided URL does not contain a valid image or is not accessible');
    } finally {
      setUrlLoading(false); setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleUpload(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handlePrice = (e) => {
    const cleanValue = e.target.value.replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    const formattedValue = parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, 2) : '');
    setForm({ ...form, amount: formattedValue });
  };

  const fetchProductDetails = async () => {
    if (!productUrl.trim()) { setMessage('Please enter a product URL'); setMessageType('error'); return; }
    setFetchingDetails(true); setMessage('');
    try {
      const response = await fetch('/api/fetchProductDetails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: productUrl.trim(), targetCurrency: form.currency }),
      });
      const data = await response.json().catch(() => ({}));
      if (!data.success) {
        setMessage(data.error || 'Failed to fetch product details');
        setMessageType('error');
        return;
      }

      const { title, price, currency, imageUrl, description, missing = [], originalPrice, originalCurrency } = data.data;
      // Use the product's own currency when the wish form supports it (the server converts the rest)
      const supported = currency && currencies.some((c) => c.code === currency);
      setForm((prev) => ({
        ...prev,
        title: title || prev.title,
        amount: price ? String(price) : prev.amount,
        currency: price && supported ? currency : prev.currency,
        noteUrl: imageUrl || prev.noteUrl,
        description: description || prev.description,
      }));
      if (price && supported) currencyChosen.current = true;
      if (imageUrl) setPreview(imageUrl);
      setProductUrl('');

      // Say exactly what was filled in and what still needs adding
      const labels = { title: 'name', price: 'price', imageUrl: 'image' };
      const notes = [];
      if (originalPrice && price) notes.push(`Converted from ${originalPrice} ${originalCurrency}.`);
      if (originalPrice && !price) notes.push(`The price is in ${originalCurrency}, which we couldn't convert.`);
      if (missing.length) notes.push(`Couldn't find the ${missing.map((f) => labels[f] || f).join(' or ')} — please add ${missing.length > 1 ? 'them' : 'it'}.`);
      setMessage(['Product details filled in. Please check them before saving.', ...notes].join(' '));
      setMessageType(missing.length ? 'warning' : 'success');
    } catch (error) {
      setMessage('Failed to fetch product details. Please try again.');
      setMessageType('error');
    } finally {
      setFetchingDetails(false);
    }
  };

  const displayImage = preview || form.noteUrl;

  return (
    <Page>
      <TopBar>
        <Logo />

        <BackBtn href="/">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Dashboard
        </BackBtn>

        <div style={{ width: 140 }} />
      </TopBar>

      <Body>
        <FormPanel>
          <div>
            <PageTitle>Add a New Wish</PageTitle>
            <PageSub>Tell your friends and family what you'd love to receive</PageSub>
          </div>

          {!form.event && (
            <EventWarning>
              ⚠️ <strong>No event selected</strong> — Please return to the dashboard to select an event.
            </EventWarning>
          )}

          {isSubmitting ? (
            <Card style={{ alignItems: 'center', padding: '48px' }}>
              <Spinner />
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>Creating your wish…</p>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Product URL autofill */}
              <Card>
                <CardTitle>Product URL (Optional)</CardTitle>
                <FormGroup>
                  <FetchRow>
                    <Input
                      placeholder="https://any-store.com/product/..."
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); fetchProductDetails(); } }}
                    />
                    <FetchBtn type="button" onClick={fetchProductDetails} disabled={fetchingDetails}>
                      {fetchingDetails ? 'Fetching…' : 'Fetch Details'}
                    </FetchBtn>
                  </FetchRow>
                  {message && (
                    <StatusMsg className={messageType}>
                      {message}
                    </StatusMsg>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Works with Amazon, Target, Walmart and any online store</span>
                </FormGroup>
              </Card>

              {/* Details */}
              <Card>
                <CardTitle>Gift Details</CardTitle>

                <FormGroup>
                  <Label>Title *</Label>
                  <Input
                    className={errors.title ? 'error' : ''}
                    placeholder="Sony WH-1000XM5 Headphones"
                    name="title"
                    onChange={handleChange}
                    value={form.title}
                  />
                  <CharCount>{form.title.length}/40 characters</CharCount>
                  {errors.title && <ErrorMsg>{errors.title}</ErrorMsg>}
                </FormGroup>

                <FormGroup>
                  <Label>Price *</Label>
                  <PriceRow>
                    <CurrencySelect
                      name="currency"
                      value={form.currency}
                      onChange={(e) => { currencyChosen.current = true; handleChange(e); }}
                    >
                      {currencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>{currency.code}</option>
                      ))}
                    </CurrencySelect>
                    <PriceInput
                      className={errors.amount ? 'error' : ''}
                      placeholder="349.00"
                      inputMode="decimal"
                      onChange={handlePrice}
                      value={form.amount}
                    />
                  </PriceRow>
                  {errors.amount && <ErrorMsg>{errors.amount}</ErrorMsg>}
                </FormGroup>

                <FormGroup>
                  <Label>Description *</Label>
                  <Textarea
                    className={errors.description ? 'error' : ''}
                    placeholder="Premium noise-cancelling headphones for my morning commute — a game changer!"
                    name="description"
                    onChange={handleChange}
                    value={form.description}
                    rows={3}
                  />
                  <CharCount>{form.description.length}/1000 characters</CharCount>
                  {errors.description && <ErrorMsg>{errors.description}</ErrorMsg>}
                </FormGroup>
              </Card>

              {/* Image */}
              <Card>
                <CardTitle>Image</CardTitle>
                <UploadArea
                  className={`${dragActive ? 'drag-active' : ''} ${displayImage ? 'has-preview' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {uploading ? (
                    <UploadLoading>
                      <Spinner />
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>Uploading image…</p>
                    </UploadLoading>
                  ) : displayImage ? (
                    <ImgPreview>
                      <PreviewImg src={displayImage} alt="Preview" />
                      <ChangeImgBtn type="button" onClick={() => document.getElementById('fileInput').click()}>
                        Change Image
                      </ChangeImgBtn>
                    </ImgPreview>
                  ) : (
                    <UploadPlaceholder onClick={() => document.getElementById('fileInput').click()}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#D9C7AC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <UploadText>
                        Drag and drop, or <UploadLink>browse</UploadLink>
                      </UploadText>
                      <UploadHint>JPG, PNG, GIF up to 10MB</UploadHint>
                    </UploadPlaceholder>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} id="fileInput" />
                </UploadArea>

                <Divider>or enter URL</Divider>
                <UrlRow>
                  <UrlInput
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    disabled={uploading}
                  />
                  <UrlBtn type="button" onClick={handleUrlSubmit} disabled={urlLoading || !urlInput.trim() || uploading}>
                    {urlLoading ? 'Loading…' : 'Use URL'}
                  </UrlBtn>
                </UrlRow>
              </Card>

              <SubmitBtn type="submit" disabled={isSubmitting}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Create Wish
              </SubmitBtn>
            </form>
          )}
        </FormPanel>

        {/* Preview panel */}
        <PreviewPanel>
          <p style={{ margin: '0 0 12px 0', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Preview</p>
          <PreviewCard>
            <PreviewImgBox>
              {displayImage ? (
                <PreviewImgFull src={displayImage} alt="preview" />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="#D9C7AC" strokeWidth="1.5"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="#D9C7AC"/>
                    <path d="M21 15l-5-5-4 4" stroke="#D9C7AC" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
            </PreviewImgBox>
            <PreviewBody>
              <PreviewTitle>{form.title || 'Wish title'}</PreviewTitle>
              <PreviewDesc>{form.description || 'Wish description will appear here…'}</PreviewDesc>
              <PreviewPrice>
                <PreviewPriceVal>{formatGoal(form.amount, form.currency)}</PreviewPriceVal>
                <PreviewPriceCur>goal</PreviewPriceCur>
              </PreviewPrice>
              <PreviewProgressBar><PreviewProgressFill /></PreviewProgressBar>
              <PreviewMeta>{formatGoal(0, form.currency)} raised · 0 contributors</PreviewMeta>
              <PreviewCTA>Contribute →</PreviewCTA>
            </PreviewBody>
          </PreviewCard>
          <PreviewHint>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            This is how your wish will appear to friends and family on your public wishlist page
          </PreviewHint>
        </PreviewPanel>
      </Body>
    </Page>
  );
};

export default NewNote;
