import styled from 'styled-components';

const CoverImageContainer = styled.div`
  position: absolute;
  height: 200px;
  overflow: hidden;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  display: block;
`;

const UploadingContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f3f4f6;
`;

const UploadingText = styled.div`
  color: #6b7280;
  font-weight: 500;
`;

const EventInfoOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  padding: 20px;
  color: white;
`;

const EventTitle = styled.h1`
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8), 0 1px 4px rgba(0, 0, 0, 0.6);
  letter-spacing: 0.5px;
`;

const EventDate = styled.p`
  margin: 0;
  font-size: 14px;
  opacity: 0.95;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.6);
  font-weight: 500;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.label`
  position: absolute;
  z-index: 4;
  right: 24px;
  bottom: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UploadIcon = styled.img`
  height: 32px;
  width: 32px;
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
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const processAndUploadFile = async (file) => {
    if (!file) return;
    setUploading(true);

    try {
      let processedFile = file;

      // Handle HEIC files
      if (
        file.type === 'image/heic' ||
        file.name.toLowerCase().endsWith('.heic')
      ) {
        const heic2any = (await import('heic2any')).default;
        const jpegBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8,
        });

        processedFile = new File(
          [jpegBlob],
          file.name.replace('.heic', '.jpg'),
          {
            type: 'image/jpeg',
            lastModified: Date.now(),
          }
        );
      }

      // Compress the image
      const compressedFile = await compressImage(processedFile);

      // Upload to S3
      const formData = new FormData();
      formData.append('file', compressedFile);

      const response = await fetch('api/uploadToAWS', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const resJSON = await response.json();
      await assignUrlToEvent(resJSON.url);
    } catch (error) {
      console.error('Processing/upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (
      !file.type.startsWith('image/') &&
      !file.name.toLowerCase().endsWith('.heic')
    ) {
      return;
    }

    await processAndUploadFile(file);
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.onload = (event) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Image loading failed'));
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          let width = img.width;
          let height = img.height;
          if (width > height && width > 1200) {
            height = Math.round((height * 1200) / width);
            width = 1200;
          } else if (height > 1200) {
            width = Math.round((width * 1200) / height);
            height = 1200;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(
                new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                })
              );
            },
            'image/jpeg',
            0.8
          );
        };
      };
    });
  };

  const assignUrlToEvent = async (url) => {
    try {
      const res = await fetch(`api/addUrlToEvent?id=${currEvent}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(url),
      });
      const resJSON = await res.json();
      setCurrentEvent(resJSON.data);
    } catch (error) {
      console.error('Issue sending new event to server: ', error);
    }
  };

  return (
    <CoverImageContainer>
      {imageUrl ? (
        uploading ? (
          <UploadingContainer>
            <UploadingText>
              UPLOADING...
            </UploadingText>
          </UploadingContainer>
        ) : (
          <>
            <Image
              src={imageUrl}
              alt="header image"
            />
            <EventInfoOverlay>
              <EventTitle>
                {eventName || 'Untitled Event'}
              </EventTitle>
              {eventDate && (
                <EventDate>
                  {formatDate(eventDate)}
                </EventDate>
              )}
            </EventInfoOverlay>
          </>
        )
      ) : (
        <>
          <Image
            src={'header_placeholder.webp'}
            alt="header placeholder image"
          />
          <EventInfoOverlay>
            <EventTitle>
              {eventName || 'Untitled Event'}
            </EventTitle>
            {eventDate && (
              <EventDate>
                {formatDate(eventDate)}
              </EventDate>
            )}
          </EventInfoOverlay>
        </>
      )}

      <FileInput
        type="file"
        accept="image/*,.heic"
        onChange={handleFileSelect}
        id="fileInput"
      />

      <UploadButton htmlFor="fileInput">
        <UploadIcon
          src={'icon_image.png'}
          alt="icon image"
        />
      </UploadButton>
    </CoverImageContainer>
  );
};

export default CoverImage;
