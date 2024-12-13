import React, { useState, useRef, useEffect } from 'react';

const DropdownItem = ({ label, onClick, selected }) => (
        <div
                className={`dropdown-item ${selected ? 'selected' : ''}`}
                onClick={onClick}
        >
                {label}
        </div>
);

const DropdownFooter = ({ onDone }) => (
        <div className="dropdown-footer">
                <button className="dropdown-done-button" onClick={onDone}>
                        Done
                </button>
        </div>
);

const Dropdown = () => {
        const years = Array.from({ length: 2024 - 2017 + 1 }, (_, i) => 2024 - i);
        const [selectedYears, setSelectedYears] = useState([]);
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);

        const toggleYear = (year) => {
                setSelectedYears((prev) =>
                        prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
                );
        };

        const toggleAllYears = () => {
                setSelectedYears((prev) =>
                        prev.length === years.length ? [] : years
                );
        };

        const isAllSelected = selectedYears.length === years.length;
        const dropdownTitle = isAllSelected
                ? 'All Years'
                : selectedYears.length > 0
                        ? `${selectedYears.length} Selected`
                        : 'Select Years';

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
                                                label="All Years"
                                                onClick={toggleAllYears}
                                                selected={isAllSelected}
                                        />
                                        {years.map((year) => (
                                                <DropdownItem
                                                        key={year}
                                                        label={year}
                                                        onClick={() => toggleYear(year)}
                                                        selected={selectedYears.includes(year)}
                                                />
                                        ))}
                                </div>
                                <DropdownFooter onDone={() => setIsOpen(false)} />
                        </div>
                </div>
        );
};

export default Dropdown;
