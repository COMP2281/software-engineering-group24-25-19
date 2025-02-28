import React from 'react';
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";

const Graph = (props) => {
        return (
                <LineChart
                        className="chart"
                        xAxis={[
                                {
                                        label: 'X Axis Label',
                                        data: [1, 2, 3, 4, 5, 6],
                                },
                        ]}
                        yAxis={[
                                {
                                        label: 'Y Axis Label',
                                },
                        ]}
                        series={[
                                { data: [2, 5.5, 2, 8.5, 1.5, 5], label: 'Series 1' },
                                { data: [1, 2, 3, 4, 5, 6], label: 'Series 2' },
                        ]}
                        width={1000}
                        height={450}
                        slotProps={{
                                legend: {
                                        hidden: false,
                                        direction: "row",
                                        position: { vertical: 'top', horizontal: 'middle' }, // Aligns it properly
                                },
                        }}
                />
        );
};

export default Graph;