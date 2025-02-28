import React, { useState, useEffect, useRef } from 'react';
import DropdownItem from './DropdownItem';
import DropdownFooter from './DropdownFooter';

const Dropdown = ({ items, onSelect, label = "Select an option", size = "regular", align = "middle", disabled = false }) => {
        const [selectedItem, setSelectedItem] = useState(null);
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);

        // Handles selecting a single item and auto-closing the dropdown
        const handleSelectItem = (item) => {
                setSelectedItem(item);
                if (onSelect) onSelect(item);
                setIsOpen(false); // Auto-close after picking
        };

        // Close the dropdown if the user clicks outside of it
        useEffect(() => {
                const handleClickOutside = (event) => {
                        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                                setIsOpen(false);
                        }
                };
                document.addEventListener('mousedown', handleClickOutside);
                return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        // Title for the dropdown button
        const dropdownTitle = selectedItem || label;

        return (
                <div className={`dropdown-wrapper dropdown-${size} align-${align}`} ref={dropdownRef}>
                        <button
                                className={`dropdown-button dropdown-single dropdown-${size} align-${align}`}
                                onClick={() => {
                                        if (disabled) return;
                                        setIsOpen((prev) => !prev)
                                }}
                        >
                                <span>{dropdownTitle}</span>
                                <img
                                        src={isOpen ? '/arrow-up.svg' : '/arrow-down.svg'}
                                        alt={isOpen ? 'Close' : 'Open'}
                                        className="dropdown-icon"
                                />
                        </button>

                        {/* Dropdown container, same structure as MultiDropdown */}
                        <div className={`dropdown-container ${isOpen ? 'open' : 'closed'} dropdown-${size}`}>
                                <div className="dropdown-scrollable">
                                        {items.map((item) => (
                                                <DropdownItem
                                                        key={item}
                                                        label={item}
                                                        onClick={() => handleSelectItem(item)}
                                                        selected={item === selectedItem}
                                                />
                                        ))}
                                </div>
                        </div>
                </div >
        );
};

export default Dropdown;