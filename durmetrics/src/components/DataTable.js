import React from 'react';
import SearchBar from './SearchBar';
import MultiDropdown from './MultiDropdown';
import report from '../data/report.csv';
import { TableVirtuoso } from 'react-virtuoso';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';

const DataTable = (props) => {
        const [selectedYears, setSelectedYears] = useState([]);
        const [tableColumns, setTableColumns] = useState([]);
        const [tableRows, setTableRows] = useState([]);
        const [filteredRows, setFilteredRows] = useState([]);
        const [searchText, setSearchText] = useState('');

        // Dropdown filter data
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => currentYear - i);

        const parseCSV = async (report) => {
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
                                        ...row,
                                }));

                                setTableRows(rows);
                                setFilteredRows(rows);
                        },
                });
        }

        useEffect(() => {
                // parse CSV and process data
                parseCSV(report);
        }, []);

        useEffect(() => {
                // filter rows based on search text
                if (searchText) {
                        setFilteredRows(
                                tableRows.filter((row) => {
                                        const firstCol = Object.keys(row)[1]; // first column key (site name)
                                        const secondCol = Object.keys(row)[2]; // second column key (site code)

                                        return (
                                                row[firstCol]?.toLowerCase().includes(searchText.toLowerCase()) ||
                                                row[secondCol]?.toLowerCase().includes(searchText.toLowerCase())
                                        );
                                })
                        );
                } else {
                        setFilteredRows(tableRows); // reset to all rows if no search text
                }
        }, [searchText, tableRows]);

        const handleSearchChange = (event) => {
                setSearchText(event.target.value);
        };

        const changeYears = (years) => {
                years = years.sort();
                setSelectedYears(years);
        };

        return (
                <>
                        {/* Filters Section */}
                        <div className="table-filters">
                                <SearchBar searchTable={handleSearchChange} />
                                <MultiDropdown items={years} changeSelection={setSelectedYears} label="Years" />
                        </div>


                        {/* Table Section */}
                        <div className="table-container">
                                <TableVirtuoso
                                        data={filteredRows}
                                        totalCount={filteredRows.length}
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
                                                const row = filteredRows[index];
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
                                                                style={{ tableLayout: 'fixed', width: '100%' }}
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