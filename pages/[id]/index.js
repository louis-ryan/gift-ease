import { useEffect, useState } from 'react';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';


const Note = ({ note }) => {

    const [activeIndex, setActiveIndex] = useState(null);
    const [data, setData] = useState([{}])

    console.log("data: ", data)

    const router = useRouter();

    const noteId = router.query.id;

    console.log("note id: ", noteId)

    const deleteNote = async () => {
        try {
            const deleted = await fetch(`http://localhost:3000/api/notes/${noteId}`, {
                method: "Delete"
            });
            console.log("deleted: ", deleted)
            router.push("/");
        } catch (error) {
            console.log(error)
        }
    }

    const getPaymentsData = async (noteId) => {
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
            console.log("payments: ", resJSON)
            const sortedData = resJSON.payments.map(payment => ({
                name: payment.senderName,
                value: payment.amount,
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                details: payment.description
            }));
            console.log("note: ", note)
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

    useEffect(() => {
        if (!noteId) return
        getPaymentsData(noteId)
    }, [noteId])

    return (

        <div className="container">
            <div className="wrapper">
                <h1>{note.title}</h1>
                <p>{note.description}</p>

                <div style={{ border: "1px solid grey" }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
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
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-2">
                        {data.map((entry, index) => (
                            <div
                                key={entry.name}
                                className={`flex items-center gap-2 p-2 rounded ${activeIndex === index ? 'bg-gray-100' : ''
                                    }`}
                            >
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="font-medium">{entry.name}</span>
                                {activeIndex === index && (
                                    <span className="text-sm text-gray-600">{entry.details}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>


                <button onClick={deleteNote}>Delete</button>
            </div>
        </div>

    )
}

Note.getInitialProps = async ({ query: { id } }) => {
    const res = await fetch(`http://localhost:3000/api/notes/${id}`);
    const { data } = await res.json();

    return { note: data }
}

export default Note;