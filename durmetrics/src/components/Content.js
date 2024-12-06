import React from 'react';
import DataTable from './DataTable';
import SearchBar from './SearchBar';
import Dropdown from './Dropdown';

const Content = () => {
        const searchTable = (e) => {};
        return (
                <div className="body">
                        <div class="table-filters">
                                <SearchBar searchTable={searchTable}/>
                                <Dropdown />
                        </div>
                        <div class="table-container">
                                <DataTable />
                        </div>
                </div>
        );
};

export default Content;