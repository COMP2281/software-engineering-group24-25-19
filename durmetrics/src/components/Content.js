import React from 'react';
import DataTable from './DataTable';
import SearchBar from './SearchBar';
import Dropdown from './Dropdown';

const Content = () => {
        const [tableRows, setTableRows] = React.useState([
                { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
                { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
                { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
                { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
                { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
                { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
                { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
                { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
                { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
        ]);

        const changeYears = (years) => {
                console.log(years);
        };

        return (
                <div className="body">
                        <div className="table-filters">
                                <div className="input-group">
                                        <div className="search-icon-container">
                                                <img className="search-icon" src="search-icon.svg" />
                                        </div>
                                        <input className="search-bar" placeholder="Search sites by name or code..." />
                                </div>
                                <Dropdown rows={tableRows} changeYears={changeYears} />
                        </div>
                        <div className="table-container">
                                <DataTable rows={tableRows} />
                        </div>
                </div>
        );
};

export default Content;