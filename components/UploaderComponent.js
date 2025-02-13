import React, { useState } from 'react';

const SimpleImageUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setMessage('Please select an image file');
                return;
            }
            setSelectedFile(file);
            setMessage('');

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage('Please select a file first');
            return;
        }

        setUploading(true);
        setMessage('Uploading...');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            const response = await fetch('api/uploadToAWS', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Upload failed');

            // Simulated upload delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            setMessage('Upload successful!');

            
        } catch (error) {
            setMessage('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreview('');
        setMessage('');
        setUploading(false);
    };

    const containerStyle = {
        padding: '16px',
        border: '1px solid lightgrey',
        borderRadius: '8px',
    };

    const dropzoneStyle = {
        border: '2px dashed #ccc',
        borderRadius: '4px',
        padding: '20px',
        textAlign: 'center',
        marginBottom: '20px',
        cursor: 'pointer',
    };

    const previewStyle = {
        maxWidth: '100%',
        maxHeight: '200px',
        margin: '10px 0',
    };

    const buttonStyle = {
        backgroundColor: uploading ? '#ccc' : '#007bff',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: uploading ? 'not-allowed' : 'pointer',
        marginRight: '10px',
    };

    const messageStyle = {
        margin: '10px 0',
        color: message.includes('failed') ? 'red' : message.includes('successful') ? 'green' : 'black',
    };

    return (
        <div style={containerStyle}>
            <div style={dropzoneStyle}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="fileInput"
                />
                <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
                    {preview ? (
                        <img src={preview} alt="Preview" style={previewStyle} />
                    ) : (
                        'Click to select an image'
                    )}
                </label>
            </div>

            {message && <div style={messageStyle}>{message}</div>}

            <div>
                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    style={buttonStyle}
                >
                    {uploading ? 'Uploading...' : 'Upload to S3'}
                </button>

                {preview && (
                    <button
                        onClick={handleReset}
                        style={{
                            ...buttonStyle,
                            backgroundColor: '#dc3545',
                        }}
                    >
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
};

export default SimpleImageUpload;