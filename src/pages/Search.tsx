import { useEffect, useRef, useState } from 'react';
import axios from "../axiosConfig";
import './Search.css';

type MenuItem = {
    id: number;
    name: string;
    description: string;
    price: string;
    is_available: boolean;
    created_at: string;
};

type SearchProps = {
    onItemSelect: (item: MenuItem) => void;
};

export function Search({ onItemSelect }: SearchProps) {
    const [query, setQuery] = useState('');
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchMenuItems() {
            try {
                const response = await axios.get('/menu-items/');
                setMenuItems(response.data);
            } catch (error) {
                console.error('Failed to fetch menu items:', error);
            }
        }
        fetchMenuItems();
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        const filtered = menuItems.filter(item =>
            item.name.toLowerCase().includes(value.toLowerCase()) ||
            item.description.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredItems(filtered);
        setShowDropdown(true);
    };

    const handleInputFocus = () => {
        if (query.trim() === '') {
            setFilteredItems(menuItems);
        }
        setShowDropdown(true);
    };

    const handleSelectItem = (item: MenuItem) => {
        onItemSelect(item);
        setQuery('');
        setFilteredItems([]);
        setShowDropdown(false);
    };

    return (
        <div className="search-container" ref={containerRef}>
            <input
                type="text"
                placeholder="Search menu items..."
                value={query}
                onChange={handleSearchChange}
                onFocus={handleInputFocus}
                className="search-input"
            />
            {showDropdown && filteredItems.length > 0 && (
                <ul className="search-dropdown">
                    {filteredItems.map(item => (
                        <li
                            key={item.id}
                            className="search-item"
                            onClick={() => handleSelectItem(item)}
                        >
                            <div className="search-item-name">{item.name}</div>
                            <div className="search-item-description">{item.description}</div>
                            <div className="search-item-price">{item.price} €</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
