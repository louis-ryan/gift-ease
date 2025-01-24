import { useState } from "react";
import postNewEvent from "../requests/postNewEvent";

const NewEventModal = ({ events, setEvents, setModalOpen, user, setCurrentEvent, setNotes }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        user: user.sub,
        name: '',
        uri: '',
        date: '',
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

        if (currentStep === 2 && (name === 'uri' || name === 'name')) {
            console.log('Checking URI uniqueness for:', newData.uri);
            const isUnique = await checkUriUniqueness(newData.uri);
            console.log('Is URI unique?', isUnique);
            
            if (!isUnique) {
                const newErrors = {
                    ...errors,
                    uri: { message: 'This URL is already taken' }
                };
                console.log('Setting errors:', newErrors);
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

    const nextStep = async () => {
        if (currentStep === 2) {
            const isUnique = await checkUriUniqueness(formData.uri);
            if (!isUnique) {
                setErrors(prev => ({
                    ...prev,
                    uri: { message: 'This URL is already taken. Each event URL must be unique.' }
                }));
                return;
            }
        }
        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const renderStep = () => {
        switch(currentStep) {
            case 1:
                return (
                    <>
                        <h3>Step 1: Event Name</h3>
                        <label htmlFor="name">Event Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={errors.name && "inputerror"}
                            required
                        />
                        <div className="error">{errors.name?.message}</div>
                    </>
                );
            case 2:
                return (
                    <>
                        <h3>Step 2: Custom URL</h3>
                        <label htmlFor="uri">Personalised URL:</label>
                        <div className="flex">
                            <p className="w-1/2">{"the-registry-web.site/for/"}</p>
                            <input
                                type="text"
                                id="uri"
                                name="uri"
                                value={formData.uri}
                                onChange={handleChange}
                                className={errors.uri ? "inputerror w-1/2" : "w-1/2"}
                                required
                            />
                        </div>
                        <div className="error">{errors.uri?.message}</div>
                    </>
                );
            case 3:
                return (
                    <>
                        <h3>Step 3: Event Date</h3>
                        <label htmlFor="date">Event Date:</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </>
                );
            case 4:
                return (
                    <>
                        <h3>Step 4: Event Description</h3>
                        <label htmlFor="description">Event Description:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={errors.description && "inputerror"}
                            rows="4"
                        ></textarea>
                        <div className="error">{errors.description?.message}</div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className="dark modalbackground" />
            <div
                className="clickable modalbackground"
                onClick={handleModal}
            >
                <div
                    className="modalcontainer"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2>Create New Event</h2>
                    <form onSubmit={handleSubmit}>
                        {renderStep()}
                        <div className="flex justify-between mt-8">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="w-24"
                                disabled={currentStep === 1}
                            >
                                Back
                            </button>
                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-24"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="w-24"
                                >
                                    Submit
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default NewEventModal;