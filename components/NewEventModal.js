import { useState } from "react";
import postNewEvent from "../requests/postNewEvent";

const NewEventModal = ({ events, setEvents, setModalOpen, user, setCurrentEvent, setNotes }) => {
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        user: user.sub,
        name: '',
        uri: '',
        date: new Date().toISOString().split('T')[0], // Set today's date as default
        description: '',
        current: true
    });

    const handleModal = () => {
        if (events.length === 0) return;
        setModalOpen(false);
    };

    const checkUriUniqueness = async (uri) => {
        try {
            const response = await fetch('/api/getEventUris');
            const { data: existingUris } = await response.json();
            return !existingUris.includes(uri);
        } catch (error) {
            console.error('Error checking URI uniqueness:', error);
            return false;
        }
    };

    const handleChange = async (e) => {
        const { name, value, type, checked } = e.target;

        let newData = {
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        };

        if (name === 'name') {
            newData.uri = value
                .toLowerCase()
                .replace(/[']/g, '')
                .replace(/[^a-z0-9-\s]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
                .replace(/^-+|-+$/g, '');
        }

        if (name === 'uri' || name === 'name') {
            const isUnique = await checkUriUniqueness(newData.uri);
            
            if (!isUnique) {
                const newErrors = {
                    ...errors,
                    uri: { message: 'This URL is already taken' }
                };
                setErrors(newErrors);
            } else {
                const newErrors = {
                    ...errors,
                    uri: undefined
                };
                setErrors(newErrors);
            }
        }
        
        setFormData(newData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        postNewEvent(user, formData, setModalOpen, setErrors, setEvents, setCurrentEvent, setNotes);
    };

    return (
        <>
            <div className="modal-overlay" onClick={handleModal} />
            <div className="modal-backdrop" onClick={handleModal}>
                <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 className="modal-title">Create New Event</h2>
                        <button 
                            className="modal-close-btn" 
                            onClick={handleModal}
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="modal-form">
                        <div className="form-content">
                            <div className="input-group">
                                <label htmlFor="name" className="input-label">Event Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`modal-input ${errors.name ? "input-error" : ""}`}
                                    placeholder="e.g., Sarah's Wedding, John's Birthday"
                                    required
                                />
                                {errors.name && <div className="error-message">{errors.name.message}</div>}
                            </div>

                            <div className="input-group">
                                <label htmlFor="uri" className="input-label">Custom URL</label>
                                <div className="url-input-container">
                                    <span className="url-prefix">the-registry-web.site/for/</span>
                                    <input
                                        type="text"
                                        id="uri"
                                        name="uri"
                                        value={formData.uri}
                                        onChange={handleChange}
                                        className={`modal-input url-input ${errors.uri ? "input-error" : ""}`}
                                        placeholder="sarah-wedding"
                                        required
                                    />
                                </div>
                                {errors.uri && <div className="error-message">{errors.uri.message}</div>}
                                <div className="url-hint">This will be the unique link for your event</div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="date" className="input-label">Event Date</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="modal-input"
                                    required
                                />
                                <div className="date-hint">Choose a future date for your event</div>
                            </div>
                        </div>
                        
                        <div className="modal-actions">
                            <button
                                type="button"
                                onClick={handleModal}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!formData.name || !formData.uri || !formData.date || errors.uri}
                            >
                                Create Event
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
                    background-color: rgba(0, 0, 0, 0.6);
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
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
                    align-items: center;
                    padding: 24px 24px 0 24px;
                    border-bottom: 1px solid #f0f0f0;
                    margin-bottom: 24px;
                }

                .modal-title {
                    font-size: 24px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin: 0;
                }

                .modal-close-btn {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #666;
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
                    background-color: #f5f5f5;
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
                    color: #374151;
                    font-size: 14px;
                }

                .modal-input {
                    padding: 12px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: all 0.2s ease;
                    background-color: white;
                }

                .modal-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .modal-input.input-error {
                    border-color: #ef4444;
                }

                .url-input-container {
                    display: flex;
                    align-items: center;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    overflow: hidden;
                    transition: all 0.2s ease;
                }

                .url-input-container:focus-within {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .url-prefix {
                    padding: 12px 16px;
                    background-color: #f9fafb;
                    color: #6b7280;
                    font-size: 14px;
                    border-right: 1px solid #e5e7eb;
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
                    color: #ef4444;
                    font-size: 14px;
                    margin-top: 4px;
                }

                .url-hint {
                    color: #6b7280;
                    font-size: 14px;
                    margin-top: 4px;
                }

                .date-hint {
                    color: #6b7280;
                    font-size: 14px;
                    margin-top: 4px;
                }

                .modal-actions {
                    display: flex;
                    justify-content: space-between;
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
                    background-color: #3b82f6;
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    background-color: #2563eb;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                .btn-secondary {
                    background-color: #f3f4f6;
                    color: #374151;
                }

                .btn-secondary:hover:not(:disabled) {
                    background-color: #e5e7eb;
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