import React from 'react';
import DataTable from './DataTable';
import SearchBar from './SearchBar';
import Dropdown from './Dropdown';
import Papa from 'papaparse';
import report from '../data/report.csv';

const Content = () => {
        React.useEffect(() => {
                Papa.parse(report, {
                        header: true,
                        download: true,
                        complete: (result) => {
                                const columns = Object.keys(result.data[0]).map((key) => ({
                                        title: key,
                                        field: key,
                                }));
                                setTableColumns(columns);

                                const rows = result.data.map((row, index) => {
                                        const formattedRow = { id: index + 1 };
                                        columns.forEach((col) => {
                                                formattedRow[col.field] = row[col.title];
                                        });
                                        return formattedRow;
                                });
                                setTableRows(rows);
                        },
                });
        }, []);

        const [tableColumns, setTableColumns] = React.useState([]);
        const [tableRows, setTableRows] = React.useState([]);

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