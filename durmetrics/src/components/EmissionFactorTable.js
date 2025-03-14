import React, { useEffect, useState } from 'react';
import { TableVirtuoso } from 'react-virtuoso';

const EmissionFactorTable = ({ emissionFactors }) => {
        const [transposedData, setTransposedData] = useState([]);
        const [dynamicColumns, setDynamicColumns] = useState([]);

        useEffect(() => {
                if (!emissionFactors || emissionFactors.length === 0) return;

                // Extract categories and years
                const categories = ['Electricity', 'Gas'];
                const years = emissionFactors.map(ef => ef.years.toString());

                // Create dynamic columns
                const newDynamicColumns = [
                        { title: 'Years', field: 'category', minWidth: 100 },
                        ...years.map(year => ({
                                title: year,
                                field: year,
                                minWidth: 100
                        }))
                ];

                // Create transposed data
                const newTransposedData = categories.map(category => {
                        const row = { category };
                        emissionFactors.forEach(ef => {
                                const yearKey = ef.years.toString();
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
                                                        {dynamicColumns.map((col) => {
                                                                const style = {
                                                                        minWidth: `${col.minWidth}px`,
                                                                        whiteSpace: 'nowrap',
                                                                        background: '#f4f4f4',
                                                                };
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
                                                {dynamicColumns.map((col, colIndex) => {
                                                        const style = {
                                                                minWidth: `${col.minWidth}px`,
                                                                whiteSpace: 'nowrap',
                                                                textAlign: col.field === 'category' ? 'left' : 'right',
                                                        };
                                                        if (colIndex === 0) {
                                                                style.background = '#f4f4f4';
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