import { useEffect, useState } from 'react';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';


const Note = () => {

    const [note, setNote] = useState({})
    const [activeIndex, setActiveIndex] = useState(null);
    const [data, setData] = useState([{}])

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

    const getPaymentsData = async (noteId, note) => {
        try {
            const res = await fetch(`/api/getStripePaymentsForSingle?giftId=${noteId}`,
                {
                    method: 'GET',
                    credentials: 'include',  // Important for CORS with credentials
                    headers: {
                        'Content-Type': 'application/json',
                        // No need to explicitly set Origin as browser will do this
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
                gif: payment.gifUrl
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

    return (

        <div className="container">
            <div className="wrapper">
                <div style={{ display: "flex", justifyContent: "space-between" }}>

                    <div style={{ width: "20%" }}>
                        <h1>{note.title}</h1>
                        <p>{note.description}</p>
                        <button onClick={deleteNote}>Delete</button>
                    </div>

                    <div style={{ width: "80%" }}>
                        <ResponsiveContainer
                            width="100%"
                            height={600}
                        >
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={200}
                                    outerRadius={300}
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
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div style={{ backgroundColor: "white", padding: "16px", boxShadow: "0px 0px 8px lightgrey", borderRadius: "8px" }}>
                                                    <h3>{payload[0].payload.name}</h3>
                                                    <h4>${payload[0].value}</h4>
                                                    {payload[0].payload.details && (
                                                        <h4>{payload[0].payload.details}</h4>
                                                    )}
                                                    {payload[0].payload.gif && (
                                                        <img src={payload[0].payload.gif} alt="gif" />
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                    </div>
                </div>

                <div style={{ height: "24px" }} />

            </div>
        </div>


    )
}

export default Note;