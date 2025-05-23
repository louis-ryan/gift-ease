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
        noteUrl: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const router = useRouter();
    const [preview, setPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const { user } = useUser();

    useEffect(() => {
        if (isSubmitting) {
            if (Object.keys(errors).length === 0) {
                createNote();
            } else {
                setIsSubmitting(false);
            }
        }
    }, [errors])

    useEffect(() => {
        if (!user) return
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
        )
    }, [user])

    const createNote = async () => {
        try {
            const res = await fetch('/api/convertToUsd', {
                method: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    amount: form.amount,
                    currency: form.currency
                })
            })
            const { usdAmount } = await res.json()
            await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...form,
                    price: usdAmount
                })
            })
            router.push("/");
        } catch (error) {
            console.log(error);
        }
    }

    const setAccountCurrency = async (e) => {
        const newCurrency = e.target.value;
        try {
            const account = await fetch(`/api/setAccountCurrency?id=${props.stripeUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                body: JSON.stringify({
                    currency: newCurrency
                })
            });
            const { data } = await account.json();
            props.setSelectedCurrency(data.currency)
        } catch (error) {
            console.error('Error setting stripe user account id in Mongo:', error);
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

    const handlePrice = async (e) => {
        const cleanValue = e.target.value.replace(/[^\d.]/g, '');
        const parts = cleanValue.split('.');
        const formattedValue = parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, 2) : '');
        setForm({
            ...form,
            amount: formattedValue
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
                            <div style={{ display: "flex" }}>
                                <select
                                    name='currency'
                                    value={props.selectedCurrency}
                                    onChange={(e) => {
                                        handleChange(e)
                                        setAccountCurrency(e)
                                    }}
                                >
                                    {currencies.map((currency) => (
                                        <option key={currency.code} value={currency.code}>
                                            {currency.code}
                                        </option>
                                    ))}
                                </select>
                                <div style={{ width: "8px" }} />
                                <input
                                    fluid
                                    error={errors.amount ? { content: 'Please enter a price', pointing: 'below' } : null}
                                    label='Price'
                                    placeholder='670.00'
                                    inputMode='decimal'
                                    onChange={handlePrice}
                                    value={form.amount}
                                />
                            </div>

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