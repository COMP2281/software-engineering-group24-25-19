import React, { useState, useRef, useEffect } from 'react';
import DropdownFooter from './DropdownFooter';
import DropdownItem from './DropdownItem';

const MultiDropdown = ({ items, changeSelection, label = "Items" }) => {
        const [selectedItems, setSelectedItems] = useState([]);
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);

        const toggleItem = (item) => {
                setSelectedItems((prev) =>
                        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
                );
        };

        const toggleAllItems = () => {
                setSelectedItems((prev) => (prev.length === items.length ? [] : items));
        };

        useEffect(() => {
                changeSelection(selectedItems);
        }, [selectedItems]);

        const isAllSelected = selectedItems.length === items.length;
        const dropdownTitle = isAllSelected
                ? `All ${label}`
                : selectedItems.length > 0
                        ? `${selectedItems.length} Selected`
                        : `Select ${label}`;

        useEffect(() => {
                const handleClickOutside = (event) => {
                        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                                setIsOpen(false);
                        }
                };
                document.addEventListener('mousedown', handleClickOutside);
                return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        return (
                <div className="dropdown-wrapper" ref={dropdownRef}>
                        <button className="dropdown-button" onClick={() => setIsOpen((prev) => !prev)}>
                                <span>{dropdownTitle}</span>
                                <img
                                        src={isOpen ? '/arrow-up.svg' : '/arrow-down.svg'}
                                        alt={isOpen ? 'Close' : 'Open'}
                                        className="dropdown-icon"
                                />
                        </button>
                        <div className={`dropdown-container ${isOpen ? 'open' : 'closed'}`}>
                                <div className="dropdown-scrollable">
                                        <DropdownItem
                                                label={`All ${label}`}
                                                onClick={toggleAllItems}
                                                selected={isAllSelected}
                                        />
                                        {items.map((item) => (
                                                <DropdownItem
                                                        key={item}
                                                        label={item}
                                                        onClick={() => toggleItem(item)}
                                                        selected={selectedItems.includes(item)}
                                                />
                                        ))}
                                </div>
                                <DropdownFooter onDone={() => setIsOpen(false)} />
                        </div>
                </div>
        );
};


export default MultiDropdown;
