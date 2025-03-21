import React, { useState, useRef, useEffect } from 'react';
import DropdownFooter from './DropdownFooter';
import DropdownItem from './DropdownItem';

const MultiDropdown = ({ items, changeSelection, selectedYears, newSheetLoaded, label = "Items", align = "middle", type = "classic", width = "", scrollWidth = "", disabled = false, padLeft = false }) => {
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

        useEffect(() => {
                if (JSON.stringify(selectedYears) !== JSON.stringify(selectedItems) && newSheetLoaded) {
                        setSelectedItems(selectedYears);
                }
        }, [selectedYears]);

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
                <div className={`dropdown-wrapper align-${align}`} ref={dropdownRef} style={{ width, marginLeft: `${padLeft ? "15px" : "initial"}` }}>
                        <button className={`dropdown-button align-${align} dropdown-${type}`} style={{ width }} onClick={
                                () => {
                                        if (disabled) return;
                                        setIsOpen((prev) => !prev)
                                }
                        }>
                                <span>{dropdownTitle}</span>
                                <img
                                        src={isOpen ? '/arrow-up.svg' : '/arrow-down.svg'}
                                        alt={isOpen ? 'Close' : 'Open'}
                                        className="dropdown-icon"
                                />
                        </button>
                        <div className={`dropdown-container ${isOpen ? 'open' : 'closed'}`} style={{ width: scrollWidth || width }}>
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
