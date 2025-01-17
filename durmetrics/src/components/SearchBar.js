import React from 'react';

const SearchBar = (props) => {
        const handleInputChange = (event) => {
                const inputValue = event.target.value;
                props.searchTable(inputValue);
        };

        return (
                <div className="input-group">
                        <div className="search-icon-container">
                                <img className="search-icon" src="/search-icon.svg" alt="Search Icon" />
                        </div>
                        <input className="search-bar" placeholder="Search sites by name or code..." onChange={handleInputChange} />
                </div>
        );
};

export default SearchBar;