import React, { useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import MultiDropdown from './MultiDropdown';
import { TableVirtuoso } from 'react-virtuoso';

const DataTable = ({ data, setDataForExport, selectedYears, setSelectedYears }) => {
        const [tableColumns, setTableColumns] = useState([]);
        const [tableRows, setTableRows] = useState([]);
        const [filteredRows, setFilteredRows] = useState([]);
        const [searchText, setSearchText] = useState('');

        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => currentYear - i);

        useEffect(() => {
                if (data && data.length > 0) {
                        const columns = Object.keys(data[0]).map((key) => ({
                                title: key,
                                field: key,
                                minWidth: 100,
                        }));
                        setTableColumns(columns);

                        const rows = data.map((row, index) => ({
                                id: index + 1,
                                ...row,
                        }));
                        setTableRows(rows);
                        setFilteredRows(rows);
                        setDataForExport(rows);
                }
        }, [data, setDataForExport]);

        useEffect(() => {
                let filtered = tableRows;
                if (searchText) {
                        filtered = tableRows.filter((row) => {
                                const firstCol = Object.keys(row)[1];
                                const secondCol = Object.keys(row)[2];
                                return (
                                        row[firstCol]?.toString().toLowerCase().includes(searchText.toLowerCase()) ||
                                        row[secondCol]?.toString().toLowerCase().includes(searchText.toLowerCase())
                                );
                        });
                }
                setFilteredRows(filtered);
                setDataForExport(filtered);
        }, [searchText, tableRows, setDataForExport]);

        useEffect(() => {
                if (filteredRows.length === 0) {
                        setFilteredRows([{ id: 'no-results', message: `No results found for ${searchText}.` }]);
                }
        }, [filteredRows]);

        const handleSearchChange = (event) => {
                setSearchText(event.target.value);
        };

        const formatNumber = (num) => {
                return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        };

        return (
                <>
                        <div className="table-filters">
                                <SearchBar searchTable={handleSearchChange} />
                                <MultiDropdown items={years} changeSelection={setSelectedYears} label="Years" />
                        </div>

                        <div className="table-container" style={{ overflowX: 'auto' }}>
                                <TableVirtuoso
                                        data={filteredRows}
                                        totalCount={filteredRows.length}
                                        fixedHeaderContent={() => (
                                                <thead>
                                                        <tr>
                                                                {tableColumns.map((col, colIndex) => {
                                                                        const stickyStyles =
                                                                                colIndex < 2
                                                                                        ? {
                                                                                                position: 'sticky',
                                                                                                left: colIndex === 0 ? 0 : `${tableColumns[0].minWidth}px`,
                                                                                                zIndex: 2,
                                                                                                background: '#fff',
                                                                                        }
                                                                                        : {};
                                                                        return (
                                                                                <th
                                                                                        key={col.field}
                                                                                        style={{
                                                                                                minWidth: `${col.minWidth}px`,
                                                                                                whiteSpace: 'nowrap',
                                                                                                ...stickyStyles,
                                                                                        }}
                                                                                >
                                                                                        {col.title}
                                                                                </th>
                                                                        );
                                                                })}
                                                        </tr>
                                                </thead>
                                        )}
                                        itemContent={(index) => {
                                                const row = filteredRows[index];
                                                if (row.id === 'no-results') {
                                                        return <div className="no-results">{row.message}</div>;
                                                }
                                                return (
                                                        <>
                                                                {tableColumns.map((col, colIndex) => {
                                                                        const stickyStyles =
                                                                                colIndex < 2
                                                                                        ? {
                                                                                                position: 'sticky',
                                                                                                left: colIndex === 0 ? 0 : `${tableColumns[0].minWidth}px`,
                                                                                                zIndex: 1,
                                                                                                background: '#fff',
                                                                                        }
                                                                                        : {};
                                                                        return (
                                                                                <td
                                                                                        key={col.field}
                                                                                        style={{
                                                                                                textAlign: typeof row[col.field] === 'number' ? 'right' : 'left',
                                                                                                minWidth: `${col.minWidth}px`,
                                                                                                whiteSpace: 'nowrap',
                                                                                                ...stickyStyles,
                                                                                        }}
                                                                                >
                                                                                        {typeof row[col.field] === 'number' ? formatNumber(row[col.field]) : row[col.field]}
                                                                                </td>
                                                                        );
                                                                })}
                                                        </>
                                                );
                                        }}
                                        components={{
                                                Table: (props) => (
                                                        <table
                                                                {...props}
                                                                className="data-table"
                                                                style={{
                                                                        tableLayout: 'auto',
                                                                        width: 'auto',
                                                                }}
                                                        />
                                                ),
                                                TableHead: (props) => (
                                                        <thead {...props}>
                                                                <tr>
                                                                        {tableColumns.map((col, colIndex) => {
                                                                                const stickyStyles =
                                                                                        colIndex < 2
                                                                                                ? {
                                                                                                        position: 'sticky',
                                                                                                        left: colIndex === 0 ? 0 : `${tableColumns[0].minWidth}px`,
                                                                                                        zIndex: 2,
                                                                                                        background: '#fff',
                                                                                                }
                                                                                                : {};
                                                                                return (
                                                                                        <th
                                                                                                key={col.field}
                                                                                                style={{
                                                                                                        minWidth: `${col.minWidth}px`,
                                                                                                        whiteSpace: 'nowrap',
                                                                                                        ...stickyStyles,
                                                                                                }}
                                                                                        >
                                                                                                {col.title}
                                                                                        </th>
                                                                                );
                                                                        })}
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
