import React, { useState, useRef, useEffect } from 'react';
import DropdownFooter from './DropdownFooter';
import DropdownItem from './DropdownItem';

const MultiDropdown = ({ items, changeSelection, selectedYears, newSheetLoaded, label = "Items", align = "middle", type = "classic", width = "", scrollWidth = "", disabled = false, padLeft = false }) => {
        // State to track selected items
        const [selectedItems, setSelectedItems] = useState([]);
        // State to track whether the dropdown is open or closed
        const [isOpen, setIsOpen] = useState(false);
        // Ref to track the dropdown element for click detection
        const dropdownRef = useRef(null);

        // Toggles the selection of a single item
        const toggleItem = (item) => {
                setSelectedItems((prev) =>
                        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
                );
        };

        // Toggles the selection of all items (select all or deselect all)
        const toggleAllItems = () => {
                setSelectedItems((prev) => (prev.length === items.length ? [] : items));
        };

        /* eslint-disable react-hooks/exhaustive-deps */
        // Notify parent component whenever the selected items change
        useEffect(() => {
                changeSelection(selectedItems);
        }, [selectedItems]);

        // Sync selected items with `selectedYears` when `newSheetLoaded` is true
        useEffect(() => {
                if (JSON.stringify(selectedYears) !== JSON.stringify(selectedItems) && newSheetLoaded) {
                        setSelectedItems(selectedYears);
                }
        }, [selectedYears]);
        /* eslint-enable react-hooks/exhaustive-deps */

        // Determine if all items are selected
        const isAllSelected = selectedItems.length === items.length;

        // Generate the dropdown title based on the selection state
        const dropdownTitle = isAllSelected
                ? `All ${label}`
                : selectedItems.length > 0
                        ? `${selectedItems.length} Selected`
                        : `Select ${label}`;

        // Close the dropdown if a click occurs outside of it
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
                        {/* Dropdown button to toggle open/close state */}
                        <button className={`dropdown-button align-${align} dropdown-${type}`} style={{ width }} onClick={
                                () => {
                                        if (disabled) return; // Prevent interaction if disabled
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
                        {/* Dropdown container to display items */}
                        <div className={`dropdown-container ${isOpen ? 'open' : 'closed'}`} style={{ width: scrollWidth || width }}>
                                <div className="dropdown-scrollable">
                                        {/* Option to select/deselect all items */}
                                        <DropdownItem
                                                label={`All ${label}`}
                                                onClick={toggleAllItems}
                                                selected={isAllSelected}
                                        />
                                        {/* Render each item as a dropdown option */}
                                        {items.map((item) => (
                                                <DropdownItem
                                                        key={item}
                                                        label={item}
                                                        onClick={() => toggleItem(item)}
                                                        selected={selectedItems.includes(item)}
                                                />
                                        ))}
                                </div>
                                {/* Footer with a "Done" button to close the dropdown */}
                                <DropdownFooter onDone={() => setIsOpen(false)} />
                        </div>
                </div>
        );
};

export default MultiDropdown;
