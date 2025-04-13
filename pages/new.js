import { useState, useEffect } from 'react';
import Link from 'next/link';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';

const NewNote = (props) => {
    const [form, setForm] = useState({
        event: props.currentEvent._id,
        title: '',
        price: '',
        description: '',
        noteUrl: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const router = useRouter();
    const [preview, setPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isSubmitting) {
            if (Object.keys(errors).length === 0) {
                createNote();
            } else {
                setIsSubmitting(false);
            }
        }
    }, [errors])

    const createNote = async () => {
        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            })
            router.push("/");
        } catch (error) {
            console.log(error);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        let errs = validate();
        setErrors(errs);
        setIsSubmitting(true);
    }

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

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
                body: formData
            });
            if (!response.ok) throw new Error('Upload failed');

            // Simulated upload delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const resJSON = await response.json()

            setForm({
                ...form,
                noteUrl: resJSON.url
            })
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

            handleUpload(file)

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePrice = (e) => {
        const cleanValue = e.target.value.replace(/[^\d.]/g, '');
        const parts = cleanValue.split('.');
        const formattedValue = parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, 2) : '');
        setForm({
            ...form,
            price: formattedValue
        })
    }

    const validate = () => {
        let err = {};

        if (!form.title) {
            err.title = 'Title is required';
        }
        if (!form.description) {
            err.description = 'Description is required';
        }

        return err;
    }

    return (
        <div className="container">
            <div className="smallwrapper">
                <Link href={"/"}>
                    <h4>{"< Back to Dashboard"}</h4>
                </Link>
                <h1>New Wish</h1>
                <div>
                    {isSubmitting
                        ? <div />
                        : <form onSubmit={handleSubmit}>
                            <label>Title</label>
                            <input
                                fluid
                                error={errors.title ? { content: 'Please enter a title', pointing: 'below' } : null}
                                label='Title'
                                placeholder='Trip to Bali'
                                name='title'
                                onChange={handleChange}
                                value={form.title}
                            />
                            <div className='gapver' />
                            <label>Price</label>
                            <input
                                fluid
                                error={errors.price ? { content: 'Please enter a price', pointing: 'below' } : null}
                                label='Price'
                                placeholder='670.00'
                                inputMode='decimal'
                                onChange={handlePrice}
                                value={form.price}
                            />
                            <div className='gapver' />
                            <label>Description</label>
                            <textarea
                                fluid
                                label='Description'
                                placeholder='5 days away with my lovely partner'
                                name='description'
                                error={errors.description ? { content: 'Please enter a description', pointing: 'below' } : null}
                                onChange={handleChange}
                                value={form.description}
                            />
                            <div className='gapver' />
                            {uploading ? (
                                <div>uploading...</div>
                            ) : (
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        style={{ display: "none" }}
                                        id="fileInput"
                                    />
                                    <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                style={{ width: '100%' }}
                                            />
                                        ) : (
                                            'Image'
                                        )}
                                    </label>
                                </>
                            )}

                            <div className='gapver' />

                            <button type='submit'>Create</button>
                        </form>
                    }
                </div>
            </div>
        </div>

    )
}

export default NewNote;