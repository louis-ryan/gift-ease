import { useEffect, useState } from 'react';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Link from 'next/link';

const Note = () => {
    const [note, setNote] = useState({})
    const [activeIndex, setActiveIndex] = useState(null);
    const [data, setData] = useState([{}])
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        price: '',
        noteUrl: ''
    });

    const router = useRouter();
    const noteId = router.query.id;

    const deleteNote = async () => {
        try {
            await fetch(`http://localhost:3000/api/notes/${noteId}`, {
                method: "Delete"
            });
            router.push("/");
        } catch (error) {
            console.log(error)
        }
    }

    const updateNote = async () => {
        try {
            const res = await fetch(`/api/notes/${noteId}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm)
            });
            
            if (res.ok) {
                const updatedNote = await res.json();
                setNote(updatedNote.data);
                setIsEditing(false);
                // Refresh payments data to update the chart
                getPaymentsData(noteId, updatedNote.data);
            }
        } catch (error) {
            console.error("Error updating note:", error);
        }
    }

    const handleEditClick = () => {
        setEditForm({
            title: note.title || '',
            description: note.description || '',
            price: note.price || '',
            noteUrl: note.noteUrl || ''
        });
        setIsEditing(true);
    }

    const handleCancelEdit = () => {
        setIsEditing(false);
    }

    const handleInputChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    }

    const getPaymentsData = async (noteId, note) => {
        try {
            const res = await fetch(`/api/getStripePaymentsForGift?giftId=${noteId}`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const resJSON = await res.json();
            const sortedData = resJSON.payments.map(payment => ({
                name: payment.senderName,
                value: payment.amount,
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                details: payment.description,
                gif: payment.gifUrl,
                cardHTML: payment.cardHTML
            }));
            const totalGoal = parseFloat(note.price)
            const totalPaid = resJSON.totalPaid
            const remaining = totalGoal - totalPaid;
            setData([
                ...sortedData,
                {
                    name: "Remaining",
                    value: remaining,
                    color: "#e0e0e0",
                    details: `$${remaining} remaining to goal`
                }
            ])

        } catch (error) {
            console.error("Error fetching payments:", error);
        }
    }

    const getInitialProps = async (noteId) => {
        const res = await fetch(`/api/notes/${noteId}`);
        const { data } = await res.json();
        getPaymentsData(noteId, data)
        setNote(data)
    }

    useEffect(() => {
        if (!noteId) return
        getInitialProps(noteId)
    }, [noteId])

    const getCardPosition = (index, totalCards) => {
        // Calculate positions in a circle around the chart
        const angle = (index / totalCards) * 360 - 90; // Start from top
        const radius = 80; // Smaller radius to fit within chart area
        const x = 50 + radius * Math.cos(angle * Math.PI / 180);
        const y = 50 + radius * Math.sin(angle * Math.PI / 180);
        return {
            left: `${x}%`,
            top: `${y}%`,
            transform: `translate(-50%, -50%) rotate(-5deg)`
        };
    };

    const getScatteredCardPosition = (index, totalCards) => {
        // Scattered layout for background cards - positioned within chart area
        const positions = [
            { left: "10%", top: "20%" },
            { left: "80%", top: "15%" },
            { left: "15%", top: "70%" },
            { left: "75%", top: "75%" },
            { left: "45%", top: "10%" },
            { left: "60%", top: "80%" },
            { left: "25%", top: "40%" },
            { left: "70%", top: "45%" }
        ];
        
        const position = positions[index % positions.length];
        const rotation = (index * 15) % 360;
        
        return {
            ...position,
            transform: `rotate(${rotation}deg)`
        };
    };

    return (
        <div className="container" style={{ 
            minHeight: "100vh", 
            backgroundColor: "#f5f5f5",
            padding: "16px"
        }}>
            <div style={{ 
                display: "flex", 
                flexDirection: "column",
                gap: "24px",
                maxWidth: "1200px",
                margin: "0 auto"
            }}>
                {/* Navigation */}
                <div style={{ 
                    display: "flex",
                    justifyContent: "flex-start"
                }}>
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <button style={{
                            padding: "8px 16px",
                            backgroundColor: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}>
                            ← Back to Dashboard
                        </button>
                    </Link>
                </div>

                {/* Header Section */}
                <div style={{ 
                    backgroundColor: "white", 
                    padding: "20px", 
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                    <div style={{ 
                        display: "flex", 
                        flexDirection: "column",
                        gap: "16px"
                    }}>
                        <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: "16px"
                        }}>
                            <div style={{ flex: "1", minWidth: "250px" }}>
                                <h1 style={{ 
                                    margin: "0 0 8px 0", 
                                    color: "#333",
                                    fontSize: "clamp(1.5rem, 4vw, 2.5rem)"
                                }}>{note.title}</h1>
                                <p style={{ 
                                    margin: "0", 
                                    color: "#666", 
                                    fontSize: "16px",
                                    lineHeight: "1.5"
                                }}>{note.description}</p>
                                {note.price && (
                                    <p style={{ 
                                        margin: "8px 0 0 0", 
                                        color: "#007bff", 
                                        fontSize: "18px",
                                        fontWeight: "bold"
                                    }}>
                                        Goal: ${note.price}
                                    </p>
                                )}
                            </div>
                            <div style={{ 
                                display: "flex", 
                                gap: "12px",
                                flexShrink: 0
                            }}>
                                <button 
                                    onClick={handleEditClick}
                                    style={{
                                        padding: "8px 16px",
                                        backgroundColor: "#007bff",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={deleteNote}
                                    style={{
                                        padding: "8px 16px",
                                        backgroundColor: "#dc3545",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        
                        {/* Debug: Show available note data */}
                        {process.env.NODE_ENV === 'development' && (
                            <div style={{ 
                                backgroundColor: "#f8f9fa", 
                                padding: "12px", 
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontFamily: "monospace"
                            }}>
                                <strong>Debug - Note data:</strong>
                                <pre>{JSON.stringify(note, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Form */}
                {isEditing && (
                    <div style={{ 
                        backgroundColor: "white", 
                        padding: "20px", 
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}>
                        <h3 style={{ margin: "0 0 16px 0", color: "#333" }}>Edit Gift Details</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold", color: "#333" }}>Title:</label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        fontSize: "16px",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold", color: "#333" }}>Description:</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    rows={3}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        fontSize: "16px",
                                        resize: "vertical",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold", color: "#333" }}>Price ($):</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editForm.price}
                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        fontSize: "16px",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold", color: "#333" }}>Image URL:</label>
                                <input
                                    type="url"
                                    value={editForm.noteUrl}
                                    onChange={(e) => handleInputChange('noteUrl', e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        fontSize: "16px",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
                                <button 
                                    onClick={updateNote}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#28a745",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    Save Changes
                                </button>
                                <button 
                                    onClick={handleCancelEdit}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#6c757d",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chart Section */}
                <div style={{ 
                    backgroundColor: "white", 
                    padding: "20px", 
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                    <h2 style={{ 
                        margin: "0 0 16px 0", 
                        textAlign: "center",
                        color: "#333",
                        fontSize: "clamp(1.2rem, 3vw, 1.8rem)"
                    }}>Contribution Progress</h2>
                    <div style={{ 
                        height: "clamp(400px, 70vh, 700px)",
                        width: "100%",
                        position: "relative"
                    }}>
                        {/* Background Cards */}
                        {data.filter(item => item.cardHTML && item.name !== "Remaining").map((item, index) => (
                            <div 
                                key={item.name}
                                style={{
                                    position: "absolute",
                                    width: "80px",
                                    height: "60px",
                                    transition: "all 0.3s ease",
                                    zIndex: 1,
                                    ...getScatteredCardPosition(index, data.filter(item => item.cardHTML && item.name !== "Remaining").length)
                                }}
                            >
                                <div 
                                    dangerouslySetInnerHTML={{ __html: item.cardHTML }}
                                    style={{ 
                                        width: "100%",
                                        height: "100%",
                                        transform: "scale(0.6)",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                        transformOrigin: "center center"
                                    }}
                                />
                                {/* Name and Amount Overlay */}
                                <div style={{
                                    position: "absolute",
                                    bottom: "-20px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    backgroundColor: "white",
                                    padding: "2px 6px",
                                    borderRadius: "3px",
                                    fontSize: "9px",
                                    textAlign: "center",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                    whiteSpace: "nowrap",
                                    minWidth: "50px"
                                }}>
                                    <div style={{ fontWeight: "bold", color: "#333" }}>{item.name}</div>
                                    <div style={{ color: "#007bff", fontSize: "8px" }}>${item.value}</div>
                                </div>
                            </div>
                        ))}

                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="50%"
                                    outerRadius="70%"
                                    dataKey="value"
                                    onMouseEnter={(_, index) => setActiveIndex(index)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                    paddingAngle={2}
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={entry.name}
                                            fill={entry.color}
                                            opacity={activeIndex === index ? 0.8 : 1}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Product Image in Center */}
                        {note.noteUrl && (
                            <div style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: "180px",
                                height: "180px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                border: "4px solid white",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                zIndex: 5
                            }}>
                                <img 
                                    src={note.noteUrl} 
                                    alt={note.title}
                                    style={{ 
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover"
                                    }}
                                    onError={(e) => {
                                        console.log("Image failed to load:", e.target.src);
                                        e.target.style.display = "none";
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Note;