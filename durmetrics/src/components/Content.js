import React from 'react';
import DataTable from './DataTable';
// import SearchBar from './SearchBar';
import Dropdown from './Dropdown';

const Content = () => {
        return (
                <div className="body">
                        <div class="table-filters">
                                <div class="input-group">
                                        <div class="search-icon-container">
                                                <img class="search-icon" src="search-icon.svg" />
                                        </div>
                                        <input class="search-bar" placeholder="Search sites by name or code..." />
                                </div>
                                <div class="years-dropdown">
                                        Display Years
                                        <img src="arrow-down.svg" class="dropdown-icon" />
                                </div>
                        </div>
                        <div class="table-container">
                                <DataTable />
                        </div>
                </div>
        );
};

export default Content;