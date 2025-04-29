import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";

interface Action {
    request_type: string;
    id: number;
    tabel_id: number;
    created_at: number;
    is_handled: boolean;
}

const RequestsPage: React.FC = () => {
    const [activeActions, setActiveActions] = useState<Action[]>([]);
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [_tick, setTick] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("/requests");
                const reversedData = response.data.slice().reverse();
                const filteredActions = reversedData.filter((action: Action) => !action.is_handled);
                setActiveActions(filteredActions);
            } catch (error) {
                console.error("Error fetching active requests:", error);
            }
        };

        fetchData();

        const socket = new WebSocket("ws://localhost:8001/ws/requests/");

        socket.onopen = () => {
            console.log("WebSocket connected");
        };

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            console.log("New WebSocket message:", data);

            const newAction: Action = {
                request_type: data.request_type,
                id: data.request_id,
                tabel_id: data.table_id,
                created_at: data.customer_request.created_at,
                is_handled: data.customer_request.is_handled,
            };

            setActiveActions(prev =>
                [newAction, ...prev].filter(action => !action.is_handled).sort((a, b) => b.created_at - a.created_at)
            );
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socket.onclose = () => {
            console.log("WebSocket closed");
        };

        return () => {
            socket.close();
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTimeDifference = (timestamp: number): string => {
        const requestTime = new Date(timestamp).getTime();
        const currentTime = Date.now();
        const difference = Math.floor((currentTime - requestTime) / 1000);
        const minutes = Math.floor(difference / 60);
        const seconds = difference % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const handleOkAction = async (requestId: number) => {
        try {
            await axios.post(`/handle-request/${requestId}/`);

            setActiveActions(prev => prev.filter(action => action.id !== requestId));
            setSelectedRow(null);
        } catch (error) {
            console.error("Error handling action:", error);
        }
    };

    const handleRowClick = (index: number) => {
        setSelectedRow(index === selectedRow ? null : index);
    };

    const getRowBackgroundColor = (timestamp: number): string => {
        const requestTime = new Date(timestamp).getTime();
        const currentTime = Date.now();
        const difference = Math.floor((currentTime - requestTime) / 1000);

        if (difference < 120) {
            return "green-background";
        } else if (difference < 240) {
            return "orange-background";
        } else {
            return "red-background";
        }
    };

    return (
        <div className="container">
            <h2>Active Requests</h2>
            <table className="actions-table">
                <thead>
                <tr>
                    <th>Table №</th>
                    <th>Request</th>
                    <th>Time</th>
                </tr>
                </thead>
                <tbody>
                {activeActions.map((action, index) => (
                    <React.Fragment key={action.id}>
                        <tr
                            onClick={() => handleRowClick(index)}
                            className={getRowBackgroundColor(action.created_at)}
                        >
                            <td>{action.tabel_id}</td>
                            <td>{action.request_type}</td>
                            <td>{formatTimeDifference(action.created_at)}</td>
                        </tr>
                        {selectedRow === index && (
                            <tr className="buttons">
                                <td colSpan={3}>
                                    <button
                                        className="ok-button"
                                        onClick={() => handleOkAction(action.id)}
                                    >
                                        Ok
                                    </button>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default RequestsPage;
