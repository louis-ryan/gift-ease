import { useState } from "react";
import postNewEvent from "../requests/postNewEvent";

const NewEventModal = ({ events, setEvents, setModalOpen, user, setCurrentEvent, setNotes }) => {

    const [errors, setErrors] = useState({})
    const [formData, setFormData] = useState({
        user: user.sub,
        name: '',
        uri: '',
        date: '',
        description: '',
        current: true
    });

    const handleModal = () => {
        if (events.length === 0) return
        setModalOpen(false)
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prevData => {
            const newData = {
                ...prevData,
                [name]: type === 'checkbox' ? checked : value
            };
            if (name === 'name') {
                newData.uri = value
                    .toLowerCase() // Convert to lowercase
                    .replace(/[']/g, '') // Remove apostrophes
                    .replace(/[^a-z0-9-\s]/g, '') // Remove any special characters except hyphens
                    .replace(/\s+/g, '-') // Convert spaces to hyphens
                    .replace(/-+/g, '-') // Convert multiple consecutive hyphens to single hyphen
                    .trim() // Remove leading and trailing spaces
                    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
            }
            return newData;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        postNewEvent(user, formData, setModalOpen, setErrors, setEvents, setCurrentEvent, setNotes)
    };

    return (
        <>
            <div className='dark modalbackground' />
            <div
                className='clickable modalbackground'
                onClick={handleModal}
            >
                <div
                    className='modalcontainer'
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2>Create New Event</h2>
                    <form onSubmit={handleSubmit}>
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
                        <div className="doublegapver" />
                        <label htmlFor="name">Personalised URL:</label>
                        <div style={{ display: "flex" }}>
                            <p style={{width: "50%"}}> {"the-registry-web.site/for/"} </p>
                            <input
                                type="text"
                                id="uri"
                                name="uri"
                                value={formData.uri}
                                onChange={handleChange}
                                className={errors.name && "inputerror"}
                                required
                                style={{width: "50%"}}
                            />
                        </div>

                        <div className="error">{errors.name?.message}</div>
                        <div className="doublegapver" />
                        <label htmlFor="date">Event Date:</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <div className="doublegapver" />
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
                        <div className="doublegapver" />
                        <button
                            type="submit"
                            className="fullwidth"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </>
    )

}

export default NewEventModal;