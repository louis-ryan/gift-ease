import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import getOrCreateNewAccount from '../requests/getOrCreateNewAccount';
import Link from 'next/link';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';
import currencies from '../utils/currencyList';

const NewNote = (props) => {
  const [form, setForm] = useState({
    event: props.currentEvent._id,
    title: '',
    currency: props.selectedCurrency,
    amount: '',
    price: '',
    description: '',
    noteUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [productUrl, setProductUrl] = useState('');
  const [fetchingDetails, setFetchingDetails] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    if (isSubmitting) {
      if (Object.keys(errors).length === 0) {
        createNote();
      } else {
        setIsSubmitting(false);
      }
    }
  }, [errors]);

  useEffect(() => {
    if (!user) return;
    getOrCreateNewAccount(
      user.sub,
      user.email,
      props.setCurrentEvent,
      props.setAccountId,
      props.setStripeUserId,
      props.setModalOpen,
      props.setNotes,
      props.setAccountSetupComplete,
      props.setSelectedCurrency
    );
  }, [user]);

  // Update event field when currentEvent becomes available
  useEffect(() => {
    if (
      props.currentEvent &&
      props.currentEvent._id &&
      form.event !== props.currentEvent._id
    ) {
      setForm((prev) => ({
        ...prev,
        event: props.currentEvent._id,
      }));
    }
  }, [props.currentEvent, form.event]);

  const createNote = async () => {
    try {
      // Validate that we have an event ID
      if (!form.event) {
        console.error('No event ID available:', {
          formEvent: form.event,
          currentEvent: props.currentEvent,
          currentEventId: props.currentEvent?._id,
        });
        throw new Error(
          'No event selected. Please refresh the page and try again.'
        );
      }

      const res = await fetch('/api/convertToUsd', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: form.amount,
          currency: form.currency,
        }),
      });

      if (!res.ok) {
        throw new Error('Currency conversion failed');
      }

      const { usdAmount } = await res.json();

      // Create the note with only the required fields
      const noteData = {
        event: form.event,
        title: truncateTitle(form.title), // Use the truncated title
        currency: form.currency,
        amount: form.amount, // Original amount in user's currency
        price: usdAmount.toString(), // Converted USD amount
        description: truncateDescription(form.description),
        noteUrl: form.noteUrl,
      };

      console.log('Sending note data:', noteData);

      const noteRes = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!noteRes.ok) {
        const errorData = await noteRes.json();
        throw new Error(errorData.error || 'Failed to create wish');
      }

      router.push('/');
    } catch (error) {
      console.log(error);
      setMessage(error.message || 'Failed to create wish. Please try again.');
      setIsSubmitting(false);
    }
  };

  const setAccountCurrency = async (e) => {
    const newCurrency = e.target.value;
    try {
      const account = await fetch(
        `/api/setAccountCurrency?id=${props.stripeUserId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
          body: JSON.stringify({
            currency: newCurrency,
          }),
        }
      );
      const { data } = await account.json();
      props.setSelectedCurrency(data.currency);
    } catch (error) {
      console.error('Error setting stripe user account id in Mongo:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let errs = validate();
    setErrors(errs);
    setIsSubmitting(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await fetch('api/uploadToAWS', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');

      // Simulated upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const resJSON = await response.json();

      setForm({
        ...form,
        noteUrl: resJSON.url,
      });
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
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleUpload(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handlePrice = async (e) => {
    const cleanValue = e.target.value.replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    const formattedValue =
      parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, 2) : '');
    setForm({
      ...form,
      amount: formattedValue,
    });
  };

  const fetchProductDetails = async () => {
    if (!productUrl.trim()) {
      setMessage('Please enter a product URL');
      return;
    }

    setFetchingDetails(true);
    setMessage('');

    try {
      const response = await fetch('/api/fetchProductDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: productUrl.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        const { title, price, imageUrl, description } = data.data;

        setForm((prev) => ({
          ...prev,
          title: title || prev.title,
          amount: price || prev.amount,
          noteUrl: imageUrl || prev.noteUrl,
          description: description || prev.description,
        }));

        if (imageUrl) {
          setPreview(imageUrl);
        }

        setMessage('Product details fetched successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to fetch product details');
      }
    } catch (error) {
      setMessage('Failed to fetch product details. Please try again.');
    } finally {
      setFetchingDetails(false);
    }
  };

  const validate = () => {
    let err = {};

    if (!form.event) {
      err.event = 'No event selected. Please refresh the page and try again.';
    }
    if (!form.title) {
      err.title = 'Title is required';
    }
    if (!form.description) {
      err.description = 'Description is required';
    }
    if (!form.amount) {
      err.amount = 'Price is required';
    }
    if (
      form.description &&
      truncateDescription(form.description).length > 200
    ) {
      err.description = 'Description cannot be more than 200 characters';
    }
    if (form.title && truncateTitle(form.title).length > 40) {
      err.title = 'Title cannot be more than 40 characters';
    }

    return err;
  };

  const truncateDescription = (text) => {
    if (!text) return '';

    // If text is already within limit, return as is
    if (text.length <= 200) return text;

    // Find the last complete sentence within the limit
    const maxLength = 200;
    let truncated = text.substring(0, maxLength);

    // Look for sentence endings (., !, ?) in the last 50 characters
    const lastFifty = truncated.substring(Math.max(0, truncated.length - 50));
    const sentenceEndings = ['.', '!', '?'];

    for (const ending of sentenceEndings) {
      const lastIndex = lastFifty.lastIndexOf(ending);
      if (lastIndex !== -1) {
        // Found a sentence ending, truncate there
        const actualIndex = truncated.length - 50 + lastIndex + 1;
        return truncated.substring(0, actualIndex);
      }
    }

    // If no sentence ending found, look for the last word boundary
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.7) {
      // Only if we're not too far back
      return truncated.substring(0, lastSpace) + '.';
    }

    // Fallback: just truncate and add ellipsis
    return truncated.substring(0, maxLength - 3) + '...';
  };

  const truncateTitle = (text) => {
    if (!text) return '';

    // If text is already within limit, return as is
    if (text.length <= 40) return text;

    // For titles, we want to be more aggressive with truncation
    const maxLength = 40;
    let truncated = text.substring(0, maxLength);

    // Look for word boundaries in the last 15 characters
    const lastFifteen = truncated.substring(Math.max(0, truncated.length - 15));
    const lastSpace = lastFifteen.lastIndexOf(' ');

    if (lastSpace !== -1 && lastSpace > 5) {
      // Only if we're not too far back
      // Found a good word boundary, truncate there
      const actualIndex = truncated.length - 15 + lastSpace;
      return truncated.substring(0, actualIndex);
    }

    // Fallback: just truncate and add ellipsis
    return truncated.substring(0, maxLength - 3) + '...';
  };

  return (
    <div className="container">
      <div className="wish-container">
        <div className="back-link">
          <Link href={'/'}>
            <div className="back-button">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 12H5M12 19L5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Back to Dashboard</span>
            </div>
          </Link>
        </div>

        <div className="wish-content">
          <div className="wish-header">
            <h1 className="wish-title">New Wish</h1>
            <p className="wish-subtitle">
              Create a new wish for your gift registry
            </p>
          </div>

          {!form.event && (
            <div className="event-warning">
              <div className="warning-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="warning-text">
                <strong>No event selected</strong> - Please refresh the page or
                return to the dashboard to select an event.
              </div>
            </div>
          )}

          {isSubmitting ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Creating your wish...</p>
            </div>
          ) : (
            <div className="form-container">
              <form onSubmit={handleSubmit} className="wish-form">
                <div className="form-group">
                  <label className="form-label">Product URL (Optional)</label>
                  <div className="url-input-group">
                    <input
                      className="form-input url-input"
                      placeholder="https://any-store.com/product/..."
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          fetchProductDetails();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="fetch-btn"
                      onClick={fetchProductDetails}
                      disabled={fetchingDetails}
                    >
                      {fetchingDetails ? 'Fetching...' : 'Fetch Details'}
                    </button>
                  </div>
                  {message && (
                    <div
                      className={`message ${message.includes('successfully') ? 'success' : 'error'}`}
                    >
                      {message}
                    </div>
                  )}
                  <p className="url-hint">
                    Works with any e-commerce site worldwide! Paste a product
                    URL from Amazon, Target, Walmart, or any online store.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    className={`form-input ${errors.title ? 'error' : ''}`}
                    placeholder="Trip to Bali"
                    name="title"
                    onChange={handleChange}
                    value={form.title}
                  />
                  <div
                    className={`char-counter ${truncateTitle(form.title).length > 40 ? 'char-counter-warning' : ''}`}
                  >
                    {truncateTitle(form.title).length}/40 characters
                    {form.title.length > 40 &&
                      truncateTitle(form.title).length <= 40 && (
                        <span className="truncation-notice">
                          {' '}
                          (will be truncated)
                        </span>
                      )}
                  </div>
                  {errors.title && (
                    <span className="error-message">{errors.title}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Price</label>
                  <div className="price-input-group">
                    <select
                      className="currency-select"
                      name="currency"
                      value={props.selectedCurrency}
                      onChange={(e) => {
                        handleChange(e);
                        setAccountCurrency(e);
                      }}
                    >
                      {currencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code}
                        </option>
                      ))}
                    </select>
                    <input
                      className={`form-input price-input ${errors.amount ? 'error' : ''}`}
                      placeholder="670.00"
                      inputMode="decimal"
                      onChange={handlePrice}
                      value={form.amount}
                    />
                  </div>
                  {errors.amount && (
                    <span className="error-message">{errors.amount}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className={`form-textarea ${errors.description ? 'error' : ''}`}
                    placeholder="5 days away with my lovely partner"
                    name="description"
                    onChange={handleChange}
                    value={form.description}
                    rows="4"
                  />
                  <div
                    className={`char-counter ${truncateDescription(form.description).length > 200 ? 'char-counter-warning' : ''}`}
                  >
                    {truncateDescription(form.description).length}/200
                    characters
                    {form.description.length > 200 &&
                      truncateDescription(form.description).length <= 200 && (
                        <span className="truncation-notice">
                          {' '}
                          (will be truncated)
                        </span>
                      )}
                  </div>
                  {errors.description && (
                    <span className="error-message">{errors.description}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Image</label>
                  <div
                    className={`image-upload-area ${dragActive ? 'drag-active' : ''} ${preview ? 'has-preview' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {uploading ? (
                      <div className="upload-loading">
                        <div className="spinner"></div>
                        <p>Uploading image...</p>
                      </div>
                    ) : preview ? (
                      <div className="image-preview">
                        <img
                          src={preview}
                          alt="Preview"
                          className="preview-image"
                        />
                        <button
                          type="button"
                          className="change-image-btn"
                          onClick={() =>
                            document.getElementById('fileInput').click()
                          }
                        >
                          Change Image
                        </button>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <div className="upload-icon">
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7,10 12,15 17,10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </div>
                        <p className="upload-text">
                          Drag and drop an image here, or{' '}
                          <span className="upload-link">browse</span>
                        </p>
                        <p className="upload-hint">
                          Supports JPG, PNG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      id="fileInput"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Wish'}
                </button>
              </form>
            </div>
          )}
        </div>

        <style jsx>{`
          .container {
            padding: 24px;
            max-width: 800px;
            margin: 0 auto;
          }

          .wish-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }

          .back-link {
            margin-bottom: 32px;
          }

          .back-button {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #6b7280;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            transition: color 0.2s ease;
          }

          .back-button:hover {
            color: #374151;
          }

          .wish-content {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow:
              0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .wish-header {
            margin-bottom: 32px;
          }

          .wish-title {
            font-size: 32px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 8px 0;
          }

          .wish-subtitle {
            font-size: 16px;
            color: #6b7280;
            margin: 0;
          }

          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            padding: 40px;
          }

          .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #e5e7eb;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          .form-container {
            max-width: 600px;
          }

          .wish-form {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
          }

          .form-group {
            margin-bottom: 24px;
          }

          .form-label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #374151;
            font-size: 14px;
          }

          .form-input,
          .form-textarea {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 16px;
            transition: all 0.2s ease;
            background: white;
          }

          .form-input:focus,
          .form-textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .form-input.error,
          .form-textarea.error {
            border-color: #ef4444;
          }

          .error-message {
            color: #ef4444;
            font-size: 14px;
            margin-top: 4px;
            display: block;
          }

          .url-input-group {
            display: flex;
            gap: 12px;
          }

          .url-input {
            flex: 1;
          }

          .fetch-btn {
            padding: 12px 20px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
          }

          .fetch-btn:hover:not(:disabled) {
            background: #059669;
            transform: translateY(-1px);
          }

          .fetch-btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
            transform: none;
          }

          .message {
            margin-top: 8px;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
          }

          .message.success {
            background: #f0fdf4;
            color: #166534;
            border: 1px solid #bbf7d0;
          }

          .message.error {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
          }

          .url-hint {
            font-size: 12px;
            color: #6b7280;
            margin: 8px 0 0 0;
          }

          .price-input-group {
            display: flex;
            gap: 12px;
          }

          .currency-select {
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 16px;
            background: white;
            min-width: 100px;
          }

          .price-input {
            flex: 1;
          }

          .image-upload-area {
            border: 2px dashed #d1d5db;
            border-radius: 12px;
            padding: 40px 20px;
            text-align: center;
            transition: all 0.2s ease;
            background: #f9fafb;
            cursor: pointer;
            position: relative;
          }

          .image-upload-area:hover {
            border-color: #3b82f6;
            background: #f0f9ff;
          }

          .image-upload-area.drag-active {
            border-color: #3b82f6;
            background: #eff6ff;
            transform: scale(1.02);
          }

          .image-upload-area.has-preview {
            padding: 0;
            border: none;
            background: transparent;
          }

          .upload-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }

          .upload-icon {
            color: #6b7280;
            margin-bottom: 8px;
          }

          .upload-text {
            font-size: 16px;
            color: #374151;
            margin: 0;
          }

          .upload-link {
            color: #3b82f6;
            text-decoration: underline;
            cursor: pointer;
          }

          .upload-hint {
            font-size: 14px;
            color: #6b7280;
            margin: 0;
          }

          .upload-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }

          .image-preview {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
          }

          .preview-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 12px;
          }

          .change-image-btn {
            position: absolute;
            bottom: 16px;
            right: 16px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s ease;
          }

          .change-image-btn:hover {
            background: rgba(0, 0, 0, 0.8);
          }

          .submit-btn {
            width: 100%;
            padding: 16px 24px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-top: 24px;
          }

          .submit-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, #2563eb, #1e40af);
            transform: translateY(-1px);
          }

          .submit-btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
            transform: none;
          }

          .char-counter {
            font-size: 12px;
            color: #6b7280;
            margin-top: 4px;
            text-align: right;
          }

          .char-counter-warning {
            color: #ef4444; /* Red for warning */
          }

          .truncation-notice {
            margin-left: 4px;
            font-size: 12px;
            color: #ef4444; /* Red for truncation notice */
          }

          .event-warning {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 8px;
            margin-bottom: 24px;
            color: #92400e;
            font-size: 14px;
            font-weight: 500;
          }

          .warning-icon {
            color: #f59e0b;
          }

          .warning-text {
            flex: 1;
          }

          @media (max-width: 640px) {
            .wish-container {
              padding: 20px 16px;
            }

            .wish-content {
              padding: 24px;
            }

            .wish-title {
              font-size: 24px;
            }

            .url-input-group {
              flex-direction: column;
            }

            .fetch-btn {
              width: 100%;
            }

            .price-input-group {
              flex-direction: column;
            }

            .currency-select {
              min-width: auto;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default NewNote;
