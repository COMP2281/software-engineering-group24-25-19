import React from 'react';
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";

const Graph = (props) => {
        const generateLineChart = () => {
                return
        };

        const generateBarChart = () => {

        };

        const generatePieChart = () => {

        };

        const generateGraph = () => {
                if (!props.isAvailable) return;

                switch (props.chart) {
                        case "Line":
                                generateLineChart();
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
                                )
                        case "Bar":
                                generateBarChart();
                                break;
                        case "Pie":
                                generatePieChart();
                                break;
                        default:
                                break;
                }
        };

        const displayGraph = () => {
                const graph = generateGraph();
        };

        return (
                props.isAvailable ? (
                        <div className="generate-button" onClick={displayGraph}>
                                Generate graph
                        </div>
                ) : (
                        <div className="insights-unavailable">Select filters to generate a graph</div>
                )
        );
};

export default Graph;




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