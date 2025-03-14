import React, { useEffect, useState } from 'react';
import { TableVirtuoso } from 'react-virtuoso';

const EmissionFactorTable = ({ emissionFactors }) => {
        const [transposedData, setTransposedData] = useState();
        const [dynamicColumns, setDynamicColumns] = useState();

        useEffect(() => {
                if (!emissionFactors || emissionFactors.length === 0) {
                        setDynamicColumns([{ title: 'Years', field: 'category', minWidth: 100 }]);
                        setTransposedData();
                        return;
                }

                // Extract categories
                const categories = ['Electricity', 'Gas'];

                // Extract unique years
                const uniqueYears = Array.from(new Set(emissionFactors.map(ef => ef.years)));

                // Sort years based on the starting year
                const sortedYears = uniqueYears.sort((a, b) => {
                        const startYearA = parseInt(a.split('-')[0], 10);
                        const startYearB = parseInt(b.split('-')[0], 10);
                        return startYearA - startYearB;
                });

                // Create dynamic columns with sorted years
                const newDynamicColumns = [
                        { title: 'Years', field: 'category', minWidth: 100 }
                        , ...sortedYears.map(year => ({
                                title: year,
                                field: year,
                                minWidth: 100
                        }))
                ];

                // Create transposed data
                const newTransposedData = categories.map(category => {
                        const row = { category };
                        emissionFactors.forEach(ef => {
                                const yearKey = ef.years;
                                row[yearKey] = ef[category.toLowerCase()];
                        });
                        return row;
                });

                setDynamicColumns(newDynamicColumns);
                setTransposedData(newTransposedData);
        }, [emissionFactors]);

        return (
                <div className="upload-panel ef-table-container" style={{ width: '100%' }}>
                        <div className="upload-title">Current Data</div>
                        <div className="panel-bar"></div>
                        <TableVirtuoso
                                className="ef-table"
                                style={{ width: '100%', height: 'calc(100vh - 300px)' }}
                                data={transposedData}
                                fixedHeaderContent={() => (
                                        <thead>
                                                <tr className="table-header">
                                                        {Array.isArray(dynamicColumns) && dynamicColumns.map((col, colIndex) => {
                                                                const style = {
                                                                        minWidth: `${col.minWidth}px`,
                                                                        whiteSpace: 'nowrap',
                                                                        background: '#f4f4f4',
                                                                };
                                                                if (colIndex === 0) {
                                                                        style.position = 'sticky';
                                                                        style.left = 0;
                                                                        style.zIndex = 1;
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
                                itemContent={(index, row) => (
                                        <tr className="table-row">
                                                {Array.isArray(dynamicColumns) && dynamicColumns.map((col, colIndex) => {
                                                        const style = {
                                                                minWidth: `${col.minWidth}px`,
                                                                whiteSpace: 'nowrap',
                                                                textAlign: col.field === 'category' ? 'left' : 'right',
                                                        };
                                                        if (colIndex === 0) {
                                                                style.position = 'sticky';
                                                                style.left = 0;
                                                                style.background = '#f4f4f4';
                                                                style.zIndex = 1;
                                                        }
                                                        return (
                                                                <td key={col.field} style={style}>
                                                                        {row[col.field]}
                                                                </td>
                                                        );
                                                })}
                                        </tr>
                                )}
                                components={{
                                        Table: (props) => (
                                                <table
                                                        {...props}
                                                        className="data-table"
                                                        style={{ tableLayout: 'auto', width: '100%' }}
                                                />
                                        ),
                                        TableHead: (props) => <thead {...props} />,
                                        TableRow: (props) => <tr {...props} />,
                                }}
                        />
                </div>
        );
};

export default EmissionFactorTable;