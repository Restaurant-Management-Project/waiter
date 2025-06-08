import { useState } from 'react';
import { Search } from './Search';
import './OrderPage.css';
import axios from "../axiosConfig";

type MenuItem = {
    id: number;
    name: string;
    description: string;
    ingredients: string;
    price: string;
    is_available: boolean;
    created_at: string;
};

type SelectedItem = MenuItem & {
    quantity: number;
    expanded?: boolean;
    customIngredients?: { [ingredient: string]: number };
};

export function OrderPage() {
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [tableNumber, setTableNumber] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleItemSelect = (item: MenuItem) => {
        const ingredientsList = parseIngredients(item.ingredients);
        const ingredientsMap = Object.fromEntries(ingredientsList.map(ing => [ing, 1]));

        setSelectedItems(prev => {
            const existing = prev.find(selected => selected.id === item.id);
            if (existing) {
                return prev.map(selected =>
                    selected.id === item.id
                        ? { ...selected, quantity: selected.quantity + 1 }
                        : selected
                );
            } else {
                return [
                    ...prev,
                    {
                        ...item,
                        quantity: 1,
                        customIngredients: ingredientsMap,
                        expanded: false,
                    },
                ];
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

            setSelectedItems([]); // Clear selected items
            setIsModalOpen(false); // Close modal
        } catch (error) {
            console.error('Error sending order:', error);
        }
    };

    const parseIngredients = (ingredients: string): string[] => {
        return ingredients.split(',').map(i => i.trim());
    }

    const toggleItemExpand = (itemId: number) => {
        setSelectedItems(prev =>
            prev.map(item =>
                item.id === itemId ? { ...item, expanded: !item.expanded } : item
            )
        );
    };

    const updateIngredientQuantity = (itemId: number, ingredient: string, delta: number) => {
        setSelectedItems(prev =>
            prev.map(item => {
                if (item.id === itemId && item.customIngredients) {
                    const current = item.customIngredients[ingredient];
                    return {
                        ...item,
                        customIngredients: {
                            ...item.customIngredients,
                            [ingredient]: Math.max(0, current + delta),
                        }
                    };
                }
                return item;
            })
        );
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
                            <div className="item-top-row">
                                <div className="item-icon-and-info">
                                <span className={`chevron ${item.expanded ? 'expanded' : ''}`}>▼</span>
                                <div className="item-info" onClick={() => toggleItemExpand(item.id)}>
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-price">{item.price} MDL</span>
                                    <div className="quantity-controls">
                                        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }}>+</button>
                                    </div>
                                </div>
                                </div>
                                <button
                                    className="remove-button"
                                    onClick={() => handleRemoveItem(item.id)}
                                >
                                    Remove
                                </button>
                            </div>

                            {item.expanded && item.customIngredients && (
                                <div className="ingredients-list">
                                    <h4>Ingredients:</h4>
                                    <ul>
                                        {Object.entries(item.customIngredients).map(([ingredient, qty]) => (
                                            <li key={ingredient} className="ingredient-item">
                                                <span>{ingredient}</span>
                                                <div className="ingredient-controls">
                                                    <button onClick={() => updateIngredientQuantity(item.id, ingredient, -1)}>-</button>
                                                    <span>{qty}</span>
                                                    <button onClick={() => updateIngredientQuantity(item.id, ingredient, 1)}>+</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
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
