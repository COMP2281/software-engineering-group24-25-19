import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

const EmissionFactorGraph = ({ emissionFactors = [] }) => {
        if (!emissionFactors.length) {
                return <div>Loading emission factor data...</div>;
        }

        // Sort emissionFactors by years
        const sortedEmissionFactors = emissionFactors.sort((a, b) => {
                const yearA = Number(a.years.split('-')[0]);
                const yearB = Number(b.years.split('-')[0]);
                return yearA - yearB;
        });

        const years = sortedEmissionFactors.map((factor) => factor.years);

        // Format values to show 6 decimal places in tooltips
        const valueFormatter = (value) => {
                if (typeof value === 'number') {
                        return value.toFixed(6);
                }
                return value;
        };

        return (
                <div className="upload-panel ef-graph-container">
                        <div className="upload-title">History</div>
                        <div className="panel-bar"></div>
                        <LineChart
                                xAxis={[{
                                        data: years,
                                        scaleType: 'point',
                                        label: 'Years',
                                }]}
                                series={[
                                        {
                                                dataKey: 'electricity',
                                                label: 'Electricity',
                                                showMark: true,
                                                color: '#1976d2',
                                                valueFormatter,
                                        },
                                        {
                                                dataKey: 'gas',
                                                label: 'Gas',
                                                showMark: true,
                                                color: '#d21976',
                                                valueFormatter,
                                        },
                                ]}
                                dataset={sortedEmissionFactors}
                                width={900}
                                height={400}
                                slotProps={{
                                        tooltip: {
                                                itemContent: (item, { valueFormatter }) => {
                                                        return `${item.series.label}: ${Number(valueFormatter(item.value)).toFixed(6)}`;
                                                },
                                        },
                                }}
                        />
                </div>
        );
};

export default EmissionFactorGraph;