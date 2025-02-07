import React from 'react';

const SearchBar = (props) => {
        return (
                <div className="input-group">
                        <div className="search-icon-container">
                                <img className="search-icon" src="/search-icon.svg" alt="Search Icon" />
                        </div>
                        <input className="search-bar" placeholder="Search sites by name or code..." onChange={props.searchTable} />
                </div>
        );
};

export default SearchBar;