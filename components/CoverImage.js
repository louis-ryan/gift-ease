

const CoverImage = ({ uploading, imageUrl, eventName, eventDate, currEvent, setCurrentEvent, setUploading }) => {

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
            if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
                const heic2any = (await import('heic2any')).default;
                const jpegBlob = await heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.8
                });

                processedFile = new File([jpegBlob], file.name.replace('.heic', '.jpg'), {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });
            }

            // Compress the image
            const compressedFile = await compressImage(processedFile);

            // Upload to S3
            const formData = new FormData();
            formData.append('file', compressedFile);

            const response = await fetch('api/uploadToAWS', {
                method: 'POST',
                body: formData
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

        if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.heic')) {
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

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        }));
                    }, 'image/jpeg', 0.8);
                };
            };
        });
    };

    const assignUrlToEvent = async (url) => {
        try {
            const res = await fetch(`api/addUrlToEvent?id=${currEvent}`, {
                method: 'PATCH',
                headers: { "Accept": "application/json", "Content-Type": "application/json" },
                body: JSON.stringify(url)
            });
            const resJSON = await res.json();
            setCurrentEvent(resJSON.data);
        } catch (error) {
            console.error("Issue sending new event to server: ", error);
        }
    };

    return (
        <div style={{
            height: "200px", // Reduced from 400px
            overflow: "hidden",
            position: "relative",
            width: "100vw",
            marginLeft: "calc(-50vw + 50%)",
            marginRight: "calc(-50vw + 50%)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" // Subtle shadow
        }}>
            {imageUrl ? (
                uploading ? (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "#f3f4f6"
                        }}
                    >
                        <div style={{ color: "#6b7280", fontWeight: "500" }}>
                            UPLOADING...
                        </div>
                    </div>
                ) : (
                    <>
                        <img
                            src={imageUrl}
                            alt="header image"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                position: "relative",
                                display: "block"
                            }}
                        />
                        {/* Event info overlay */}
                        <div style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                            padding: "20px",
                            color: "white"
                        }}>
                            <h1 style={{
                                margin: "0 0 4px 0",
                                fontSize: "24px",
                                fontWeight: "700",
                                textShadow: "0 2px 8px rgba(0, 0, 0, 0.8), 0 1px 4px rgba(0, 0, 0, 0.6)",
                                letterSpacing: "0.5px"
                            }}>
                                {eventName || "Untitled Event"}
                            </h1>
                            {eventDate && (
                                <p style={{
                                    margin: 0,
                                    fontSize: "14px",
                                    opacity: 0.95,
                                    textShadow: "0 1px 4px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.6)",
                                    fontWeight: "500"
                                }}>
                                    {formatDate(eventDate)}
                                </p>
                            )}
                        </div>
                    </>
                )
            ) : (
                <>
                    <img
                        src={"header_placeholder.webp"}
                        alt="header placeholder image"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            position: "relative",
                            display: "block"
                        }}
                    />
                    {/* Event info overlay for placeholder */}
                    <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                        padding: "20px",
                        color: "white"
                    }}>
                        <h1 style={{
                            margin: "0 0 4px 0",
                            fontSize: "24px",
                            fontWeight: "700",
                            textShadow: "0 2px 8px rgba(0, 0, 0, 0.8), 0 1px 4px rgba(0, 0, 0, 0.6)",
                            letterSpacing: "0.5px"
                        }}>
                            {eventName || "Untitled Event"}
                        </h1>
                        {eventDate && (
                            <p style={{
                                margin: 0,
                                fontSize: "14px",
                                opacity: 0.95,
                                textShadow: "0 1px 4px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.6)",
                                fontWeight: "500"
                            }}>
                                {formatDate(eventDate)}
                            </p>
                        )}
                    </div>
                </>
            )}
            
            {/* Upload functionality */}
            <input
                type="file"
                accept="image/*,.heic"
                onChange={handleFileSelect}
                id="fileInput"
                style={{ display: "none" }}
            />

            <label
                htmlFor="fileInput"
                style={{ 
                    position: "absolute", 
                    zIndex: "4", 
                    right: "24px", 
                    bottom: "20px", 
                    backgroundColor: "rgba(255, 255, 255, 0.9)", 
                    padding: "8px", 
                    cursor: "pointer", 
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.5)"
                }}
            >
                <img
                src={"icon_image.png"}
                alt="icon image"
                style={{height: "16px", width: "16px"}}
                />
            </label>
        </div>
    )
};

export default CoverImage;