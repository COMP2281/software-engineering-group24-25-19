import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import SearchBar from './SearchBar';
import Dropdown from './Dropdown';
import report from '../data/report.csv';
import { TableVirtuoso } from 'react-virtuoso';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';


const paginationModel = { page: 0, pageSize: 100 };


const DataTable = (props) => {
        const [selectedYears, setSelectedYears] = useState([]);

        const [tableColumns, setTableColumns] = useState([]);
        const [tableRows, setTableRows] = useState([]);

        useEffect(() => {
            // parse CSV and process data
                Papa.parse(report, {
                        header: true,
                        download: true,
                        complete: (result) => {

                                const columns = Object.keys(result.data[0] || {}).map((key) => ({
                                        title: key,
                                        field: key,
                                        width: Math.max(
                                                key.length * 15, // approximate width of header text
                                                ...result.data.map((row) => (row[key]?.length || 0) * 8) // width of content
                                        ),
                                }));
                                
                                setTableColumns(columns);

                                // map rows with matching keys
                                const rows = result.data.map((row, index) => ({
                                        id: index + 1,
                                        ...row, // Spread row data
                                        }));
                                
                                setTableRows(rows);
                        },
                });
        }, []);

        const changeYears = (years) => {
                years = years.sort();
                setSelectedYears(years);
        };

        return (
        <>
                {/* Filters Section */}
                <div className="table-filters">
                        <div className="input-group">
                                <div className="search-icon-container">
                                        <img className="search-icon" src="search-icon.svg" alt="Search" />
                                </div>
                        <input className="search-bar" placeholder="Search sites by name or code..." />
                        </div>
                        <Dropdown rows={tableRows} changeYears={changeYears} />
                </div>

                {/* Table Section */}
                <div className="table-container">
                        <TableVirtuoso
                        data={tableRows}
                        totalCount={tableRows.length}
                        fixedHeaderContent={() => (
                                <thead>
                                        <tr>
                                                {tableColumns.map((col) => (
                                                <th key={col.field} style={{ width: `${col.width}px` }}>
                                                {col.title}
                                                </th>
                                                ))}
                                        </tr>
                                </thead>
                        )}
                        itemContent={(index) => {
                                const row = tableRows[index];
                                return (
                                <>
                                        {tableColumns.map((col) => (
                                        <td key={col.field}>{row[col.field]}</td>
                                ))}
                                </>
                        );
                }}
                        components={{
                                Table: (props) => (
                                        <table
                                                {...props}
                                                className="data-table"
                                                style={{ tableLayout: "fixed", width: "100%" }}
                                        />
                                ),
                                TableHead: (props) => (
                                <thead {...props}>
                                        <tr>
                                        {tableColumns.map((col) => (
                                                <th key={col.field}>{col.title}</th>
                                        ))}
                                        </tr>
                                </thead>
                                ),
                                TableRow: (props) => <tr {...props} />,
                        }}
                        />
                </div>
        </>
        );
};

export default DataTable;