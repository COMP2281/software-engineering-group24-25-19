import React from 'react';

const DropdownFooter = ({ onDone }) => (
        <div className="dropdown-footer">
                <button className="dropdown-done-button" onClick={onDone}>
                        Done
                </button>
        </div>
);

export default DropdownFooter;