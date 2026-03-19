import styled from 'styled-components';
import { useState } from 'react';

const CoverImageContainer = styled.div`
  position: absolute;
  height: 320px;
  overflow: hidden;
  width: 100%;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  display: block;
`;

const GradientOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);
`;

const UploadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  gap: 12px;
`;

const UploadingText = styled.div`
  color: white;
  font-weight: 500;
  font-size: 14px;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EventInfoOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 160px;
`;

const EventTitle = styled.h1`
  font-family: 'Playfair Display', serif;
  margin: 0 0 4px 0;
  font-size: 36px;
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
`;

const EventDate = styled.p`
  margin: 0;
  font-size: 13px;
  color: rgba(255,255,255,0.85);
  font-weight: 500;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  position: absolute;
  z-index: 4;
  right: 24px;
  bottom: 20px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.3);
  cursor: pointer;
  border-radius: 8px;
  padding: 7px 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255,255,255,0.3);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 28px;
  width: 90%;
  max-width: 460px;
  box-shadow: 0 24px 40px rgba(0,0,0,0.15);
  position: relative;
`;

const ModalTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
  color: #18181B;
`;

const OptionButton = styled.button`
  width: 100%;
  padding: 14px;
  margin-bottom: 10px;
  border: 1.5px solid #E4E4E7;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #3F3F46;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    border-color: #8B5CF6;
    background: #FAFAFA;
  }

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const UrlInputContainer = styled.div`
  margin-top: 16px;
`;

const UrlInput = styled.input`
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #E4E4E7;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #8B5CF6;
  }

  &::placeholder {
    color: #A1A1AA;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const Btn = styled.button`
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.$primary ? `
    background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
    color: white;
    border: none;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  ` : `
    background: white;
    color: #3F3F46;
    border: 1.5px solid #E4E4E7;
    &:hover { border-color: #D1D5DB; }
  `}
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #71717A;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  line-height: 1;

  &:hover {
    background: #F4F4F5;
    color: #18181B;
  }
`;

const CoverImage = ({
  uploading,
  imageUrl,
  eventName,
  eventDate,
  currEvent,
  setCurrentEvent,
  setUploading,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.heic')) return;
    await processAndUploadFile(file);
  };

  const processAndUploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      let processedFile = file;
      if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
        const heic2any = (await import('heic2any')).default;
        const jpegBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
        processedFile = new File([jpegBlob], file.name.replace('.heic', '.jpg'), { type: 'image/jpeg', lastModified: Date.now() });
      }
      const formData = new FormData();
      formData.append('file', processedFile);
      const response = await fetch('api/uploadToAWS', { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
      const resJSON = await response.json();
      await assignUrlToEvent(resJSON.url);
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const assignUrlToEvent = async (url) => {
    try {
      const res = await fetch(`api/addUrlToEvent?id=${currEvent}`, {
        method: 'PATCH',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(url),
      });
      const resJSON = await res.json();
      setCurrentEvent(resJSON.data);
    } catch (error) {
      console.error('Issue sending new event to server: ', error);
    }
  };

  const validateImageUrl = (url) => {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
    } catch { return false; }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) { alert('Please enter a valid image URL'); return; }
    if (!validateImageUrl(urlInput)) { alert('Please enter a valid image URL (jpg, jpeg, png, gif, webp, svg)'); return; }
    setUrlLoading(true);
    setUploading(true);
    try {
      await new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = urlInput;
      });
      await assignUrlToEvent(urlInput);
      setShowModal(false);
      setUrlInput('');
    } catch (error) {
      alert('The provided URL does not contain a valid image or is not accessible');
    } finally {
      setUrlLoading(false);
      setUploading(false);
    }
  };

  return (
    <CoverImageContainer>
      <Image src={imageUrl || 'header_placeholder.webp'} alt="cover" />
      <GradientOverlay />
      <EventInfoOverlay>
        <EventTitle>{eventName || 'Untitled Event'}</EventTitle>
        {eventDate && <EventDate>{formatDate(eventDate)}</EventDate>}
      </EventInfoOverlay>

      {uploading && (
        <UploadingOverlay>
          <Spinner />
          <UploadingText>Uploading cover image…</UploadingText>
        </UploadingOverlay>
      )}

      <FileInput type="file" accept="image/*,.heic" onChange={handleFileSelect} id="fileInput" disabled={uploading} />

      <UploadButton
        onClick={() => setShowModal(true)}
        style={{ opacity: uploading ? 0.5 : 1, pointerEvents: uploading ? 'none' : 'auto' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Edit Cover
      </UploadButton>

      {showModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <ModalContent>
            <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            <ModalTitle>Update Cover Image</ModalTitle>
            <OptionButton onClick={() => { setShowModal(false); document.getElementById('fileInput').click(); }}>
              📁 Upload from Device
            </OptionButton>
            <UrlInputContainer>
              <UrlInput
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <ButtonGroup>
                <Btn onClick={() => setShowModal(false)}>Cancel</Btn>
                <Btn $primary onClick={handleUrlSubmit} disabled={urlLoading || !urlInput.trim()}>
                  {urlLoading ? 'Loading…' : 'Use URL'}
                </Btn>
              </ButtonGroup>
            </UrlInputContainer>
          </ModalContent>
        </Modal>
      )}
    </CoverImageContainer>
  );
};

export default CoverImage;
