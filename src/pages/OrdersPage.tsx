import React, { useEffect, useState } from 'react';
import axios from "../axiosConfig";
import './OrdersPage.css';

interface Item {
    id: number;
    quantity: number;
    name: string;
    price: string;
}

interface Order {
    id: number;
    session_id: string;
    table_id: number;
    is_approved: boolean;
    is_completed: boolean;
    created_at: string;
    eta_minutes: string;
    items: Item[];
}

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        const storedZoneId = localStorage.getItem('zone');
        const zoneId = storedZoneId ? parseInt(storedZoneId, 10) : null;
        axios.get<Order[]>(`/orders/zone/${zoneId}`)
            .then(response => {
                setOrders(response.data);
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
            });
    }, []);

    return (
        <div className="orders-page">
            <h2>Orders</h2>
            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                orders.map(order => (
                    <div key={order.id} className="order-card">
                        <div className="order-table-id">
                            Table #{order.table_id}.
                        </div>
                        <div className="order-items">
                            <table className="items-table">
                                <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                </tr>
                                </thead>
                                <tbody>
                                {order.items.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.price} MDL</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="footer">
                            <span className="order-table-id">
                                Pick up in
                            </span>
                            <span className="order-table-id">
                                {order.eta_minutes} minutes
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default OrdersPage;
