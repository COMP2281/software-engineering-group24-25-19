import React, { useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import MultiDropdown from './MultiDropdown';
import { TableVirtuoso } from 'react-virtuoso';

const DataTable = ({ data, setDataForExport, selectedYears, setSelectedYears }) => {
        const [tableColumns, setTableColumns] = useState([]);
        const [tableRows, setTableRows] = useState([]);
        const [filteredRows, setFilteredRows] = useState([]);
        const [searchText, setSearchText] = useState('');

        // Dropdown filter data
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => currentYear - i);

        useEffect(() => {
                if (data && data.length > 0) {
                        const columns = Object.keys(data[0]).map((key) => ({
                                title: key,
                                field: key,
                                width: Math.max(
                                        key.length * 15, // approximate width of header text
                                        ...data.map((row) => (row[key]?.length || 0) * 8) // width of content
                                ),
                        }));

                        setTableColumns(columns);

                        // map rows with matching keys
                        const rows = data.map((row, index) => ({
                                id: index + 1,
                                ...row,
                        }));

                        setTableRows(rows);
                        setFilteredRows(rows);
                        setDataForExport(rows); // set filtered data initially
                }
        }, [data, setDataForExport]);

        useEffect(() => {
                // filter rows based on search text
                let filtered = tableRows;
                if (searchText) {
                        filtered = tableRows.filter((row) => {
                                const firstCol = Object.keys(row)[1]; // first column key (site name)
                                const secondCol = Object.keys(row)[2]; // second column key (site code)

                                return (
                                        row[firstCol].toString().toLowerCase().includes(searchText.toLowerCase()) ||
                                        row[secondCol].toString().toLowerCase().includes(searchText.toLowerCase())
                                );
                        });
                }
                setFilteredRows(filtered);
                setDataForExport(filtered); // set filtered data after search
        }, [searchText, tableRows, setDataForExport]);

        useEffect(() => {
                if (filteredRows.length === 0) {
                        setFilteredRows([{ id: 'no-results', message: `No results found for ${searchText}.` }]);
                }
        }, [filteredRows]);

        const handleSearchChange = (event) => {
                setSearchText(event.target.value);
        };

        const changeYears = (years) => {
                years = years.sort();
                setSelectedYears(years);
        };

        return (
                <>
                        <div className="table-filters">
                                <SearchBar searchTable={handleSearchChange} />
                                <MultiDropdown items={years} changeSelection={setSelectedYears} label="Years" />
                        </div>

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
                                                if (row.id === 'no-results') {
                                                        return (
                                                                <div className="no-results">
                                                                        {row.message}
                                                                </div>
                                                        );
                                                }
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
