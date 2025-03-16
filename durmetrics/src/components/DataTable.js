import React, { useEffect, useState, useRef } from 'react';
import SearchBar from './SearchBar';
import MultiDropdown from './MultiDropdown';
import { TableVirtuoso } from 'react-virtuoso';
import PercentageChangeModal from './PercentageChangeModal';
import PercentageTotalModal from './PercentageTotalModal';

const DataTable = ({
        data,
        setDataForExport,
        selectedYears,
        setSelectedYears,
        unchangedData,
        percentageChanges,
        setPercentageChanges,
        percentageTotals,
        setPercentageTotals,
        route
}) => {
        const previousDataRef = useRef(null);
        const isResetting = useRef(false);
        const firstStickyHeaderRef = useRef(null); // Ref for the first sticky header

        const [tableColumns, setTableColumns] = useState();
        const [tableRows, setTableRows] = useState();
        const [filteredRows, setFilteredRows] = useState();
        const [searchText, setSearchText] = useState('');
        const [loading, setLoading] = useState(true);
        const [newSheetLoaded, setNewSheetLoaded] = useState(false);

        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => currentYear - i);

        /* eslint-disable react-hooks/exhaustive-deps */
        useEffect(() => {
                if (!data || data.length === 0) return;

                if (previousDataRef.current !== data && !isResetting.current) {
                        console.log("Tab switched, resetting years...");
                        setNewSheetLoaded(true);
                        isResetting.current = true; // Prevent multiple triggers
                        setLoading(true);

                        // If we're on the tab 'Site Information', we ignore selected years
                        if (route !== "sites") {
                                const currentYear = new Date().getFullYear();
                                const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => currentYear - i);

                                setSelectedYears(years);
                        } else {
                                setSelectedYears([]);
                        }

                        previousDataRef.current = data; // Update the stored reference

                        setTimeout(() => {
                                isResetting.current = false;
                                setLoading(false);
                                setNewSheetLoaded(false);
                        }, 500); // Small delay to prevent multiple quick triggers
                }
        }, [unchangedData, setSelectedYears]);
        /* eslint-enable react-hooks/exhaustive-deps */

        useEffect(() => {
                console.log("Data changed, updating table...", data);
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
                                if (row && Object.keys(row).length > 3) {
                                        const secondCol = Object.keys(row)[2];
                                        const thirdCol = Object.keys(row)[3];
                                        return (
                                                row[secondCol]?.toString().toLowerCase().includes(searchText.toLowerCase()) ||
                                                row[thirdCol]?.toString().toLowerCase().includes(searchText.toLowerCase())
                                        );
                                }
                                return false; // If row is invalid or doesn't have enough keys, don't include it in the filter
                        });
                }
                setFilteredRows(filtered);
                setDataForExport(filtered);
        }, [searchText, tableRows, setDataForExport]);

        useEffect(() => {
                if (Array.isArray(filteredRows) && filteredRows.length === 0) {
                        setFilteredRows([{ id: 'no-results', message: `No results found for "${searchText}".` }]);
                }
        }, [filteredRows, searchText]);

        const handleSearchChange = (event) => {
                setSearchText(event.target.value);
        };

        const formatNumber = (num) => {
                return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        };

        const getStickyStyles = (colIndex, zIndex) => {
                if (colIndex < 2) {
                        return {
                                position: 'sticky',
                                left: 0,
                                zIndex: zIndex,
                                background: '#f4f4f4',
                        };
                }
                return {};
        };

        return (
                <>
                        <div className="table-filters">
                                <SearchBar searchTable={handleSearchChange} />
                                {route !== "sites" && (
                                        <>
                                                <MultiDropdown
                                                        items={years}
                                                        changeSelection={setSelectedYears}
                                                        selectedYears={selectedYears}
                                                        newSheetLoaded={newSheetLoaded}
                                                        label="Years"
                                                        padLeft={true}
                                                />
                                                <PercentageChangeModal percentageChanges={percentageChanges} setPercentageChanges={setPercentageChanges} />
                                                <PercentageTotalModal percentageTotals={percentageTotals} setPercentageTotals={setPercentageTotals} />
                                        </>
                                )}
                        </div>

                        <div className="table-container" style={{ overflowX: 'auto' }}>
                                {loading ? (
                                        <div className="loader-container">
                                                <div className="loader"></div>
                                        </div>
                                ) : (
                                        <TableVirtuoso
                                                data={filteredRows}
                                                totalCount={filteredRows.length}
                                                fixedHeaderContent={() => (
                                                        <thead>
                                                                <tr>
                                                                        {tableColumns.map((col, colIndex) => {
                                                                                let style = {
                                                                                        minWidth: `${col.minWidth}px`,
                                                                                        whiteSpace: 'nowrap',
                                                                                };
                                                                                if (colIndex === 0) {
                                                                                        style.display = 'none';
                                                                                }

                                                                                const stickyStyles = getStickyStyles(colIndex, 2);
                                                                                style = { ...style, ...stickyStyles };

                                                                                if (colIndex === 1) {
                                                                                        return (
                                                                                                <th
                                                                                                        key={col.field}
                                                                                                        style={style}
                                                                                                        ref={firstStickyHeaderRef}
                                                                                                >
                                                                                                        {col.title}
                                                                                                </th>
                                                                                        );
                                                                                }

                                                                                return (
                                                                                        <th key={col.field} style={style}>
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
                                                                                let style = {
                                                                                        textAlign:
                                                                                                typeof row[col.field] === 'number' || col.field.includes("%")
                                                                                                        ? 'right'
                                                                                                        : 'left',
                                                                                        minWidth: `${col.minWidth}px`,
                                                                                        whiteSpace: 'nowrap',
                                                                                };
                                                                                if (colIndex === 0) {
                                                                                        style.display = 'none';
                                                                                }

                                                                                const stickyStyles = getStickyStyles(colIndex, 1);
                                                                                style = { ...style, ...stickyStyles };

                                                                                // If the column is a % Change column, apply conditional styling.
                                                                                let customCellStyle = {};
                                                                                if (col.field.includes("% Change")) {
                                                                                        const cellVal = row[col.field];
                                                                                        const numericVal = parseFloat(cellVal);
                                                                                        if (!isNaN(numericVal)) {
                                                                                                customCellStyle = {
                                                                                                        color: numericVal <= 0 ? 'green' : '#a70000',
                                                                                                        backgroundColor: numericVal <= 0 ? '#00bd002b' : '#a700002b',
                                                                                                        fontWeight: 'bold',
                                                                                                };
                                                                                        }
                                                                                }

                                                                                return (
                                                                                        <td
                                                                                                key={col.field}
                                                                                                style={{ ...style, ...customCellStyle }}
                                                                                        >
                                                                                                {typeof row[col.field] === 'number'
                                                                                                        ? formatNumber(row[col.field])
                                                                                                        : row[col.field]}
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
                                                                                        let style = {
                                                                                                minWidth: `${col.minWidth}px`,
                                                                                                whiteSpace: 'nowrap',
                                                                                        };
                                                                                        if (colIndex === 0) {
                                                                                                style.display = 'none';
                                                                                        }
                                                                                        const stickyStyles = getStickyStyles(colIndex, 2);
                                                                                        style = { ...style, ...stickyStyles };

                                                                                        if (colIndex === 1) {
                                                                                                return (
                                                                                                        <th
                                                                                                                key={col.field}
                                                                                                                style={style}
                                                                                                                ref={firstStickyHeaderRef}
                                                                                                        >
                                                                                                                {col.title}
                                                                                                        </th>
                                                                                                );
                                                                                        }

                                                                                        return (
                                                                                                <th key={col.field} style={style}>
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
                                )}
                        </div>
                </>
        );
};

export default DataTable;