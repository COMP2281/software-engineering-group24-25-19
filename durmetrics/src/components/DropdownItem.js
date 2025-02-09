import React from 'react';

const DropdownItem = ({ label, onClick, selected }) => (
        <div
                className={`dropdown-item ${selected ? 'selected' : ''}`}
                onClick={onClick}
        >
                {label}
        </div>
);

export default DropdownItem;