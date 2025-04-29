import { useState } from 'react';
import { Search } from './Search';
import './OrderPage.css';
import axios from "../axiosConfig";

type MenuItem = {
    id: number;
    name: string;
    description: string;
    price: string;
    is_available: boolean;
    created_at: string;
};

type SelectedItem = MenuItem & {
    quantity: number;
};

export function OrderPage() {
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [tableNumber, setTableNumber] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleItemSelect = (item: MenuItem) => {
        setSelectedItems(prev => {
            const existing = prev.find(selected => selected.id === item.id);
            if (existing) {
                return prev.map(selected =>
                    selected.id === item.id
                        ? { ...selected, quantity: selected.quantity + 1 }
                        : selected
                );
            } else {
                return [...prev, { ...item, quantity: 1 }];
            }
        });
    };

    const handleRemoveItem = (itemId: number) => {
        setSelectedItems(prev => prev.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId: number, delta: number) => {
        setSelectedItems(prev =>
            prev
                .map(item =>
                    item.id === itemId
                        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                        : item
                )
        );
    };

    const handleConfirmOrder = async () => {
        if (!tableNumber) {
            alert('Please enter a table number.');
            return;
        }

        try {
            // Send each item separately to the backend
            for (const item of selectedItems) {
                const payload = {
                    menu_item_id: item.id,
                    quantity: item.quantity,
                };

                await axios.post(`/tables/${tableNumber}/add-item/`, payload);
            }

            alert('Order successfully sent!');
            setSelectedItems([]); // Clear selected items
            setIsModalOpen(false); // Close modal
        } catch (error) {
            console.error('Error sending order:', error);
            alert('Failed to send order.');
        }
    };

    return (
        <div className="order-page-container">
            <h2 className="order-page-title">Create New Order</h2>
            <Search onItemSelect={handleItemSelect} />

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Enter Table Number</h3>
                        <input
                            type="number"
                            placeholder="Table Number"
                            value={tableNumber ?? ''}
                            onChange={(e) => setTableNumber(Number(e.target.value))}
                        />
                        <div className="modal-actions">
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button onClick={handleConfirmOrder}>Confirm Order</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="selected-items-container">
                <h3>Selected Items</h3>
                {selectedItems.length === 0 && <p>No items selected yet.</p>}
                <ul className="selected-items-list">
                    {selectedItems.map(item => (
                        <li key={item.id} className="selected-item">
                            <div className="item-info">
                                <span className="item-name">{item.name}</span>
                                <span className="item-price">{item.price} €</span>
                                <div className="quantity-controls">
                                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                </div>
                            </div>
                            <button
                                className="remove-button"
                                onClick={() => handleRemoveItem(item.id)}
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
                {selectedItems.length > 0 && (
                    <button className="confirm-order-button" onClick={() => setIsModalOpen(true)}>
                        Confirm Order
                    </button>
                )}
            </div>
        </div>
    );
}
