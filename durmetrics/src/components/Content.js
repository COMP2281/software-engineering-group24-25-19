import React from 'react';
import DataTable from './DataTable';
import SearchBar from './SearchBar';
import Dropdown from './Dropdown';

const Content = () => {
        const [tableColumns, setTableColumns] = React.useState([
                { field: 'id', headerName: 'ID', width: 70 },
                { field: 'siteName', headerName: 'Site Name', width: 200 },
                { field: 'code', headerName: 'Code', width: 130 },
                { field: 'floorArea', headerName: 'Floor Area', type: 'number', width: 130 },
                { field: 'accountNumber', headerName: 'Account Number', width: 200 },
                { field: 'kWh', headerName: 'kWh', width: 130 },
                { field: 'cost', headerName: 'Cost', width: 130 },
        ]);
        const [tableRows, setTableRows] = React.useState([
                { id: 1, siteName: 'Annfield Plain Library', code: '0922S01', floorArea: 439, accountNumber: '6224653442', kWh: '13,123', cost: '5,404.60' },
                { id: 2, siteName: 'Barnard Castle Library (new)/C.A.P building', code: '0923S01', floorArea: 554, accountNumber: '6813747837', kWh: '22,307', cost: '8,685.90' },
                { id: 3, siteName: 'Belmont Library', code: '0949', floorArea: 227, accountNumber: '3259115544', kWh: '9,624', cost: '4,074.47' },
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
                                <DataTable rows={tableRows} columns={tableColumns} />
                        </div>
                </div>
        );
};

export default Content;