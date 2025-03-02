import React, { useEffect } from 'react';
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import axios from "axios";

const Graph = (props) => {
        const [graph, setGraph] = React.useState(null);

        const categoryURLMap = {
                "Electricity (kWh)": "electricity-usage",
                "Electricity (£)": "electricity-usage",
                "Gas (kWh)": "gas-usage",
                "Gas (£)": "gas-usage",
        };

        const categoryDataMap = {
                "Electricity (kWh)": "energy_usage_kwh",
                "Electricity (£)": "cost_gbp",
                "Gas (kWh)": "energy_usage_kwh",
                "Gas (£)": "cost_gbp",
        }

        const removeDuplicateTicks = () => {
                setTimeout(() => {
                        const ticks = document.querySelectorAll('.MuiChartsAxis-directionX > .MuiChartsAxis-tickContainer');
                        let lastValue = null;

                        ticks.forEach((tick) => {
                                const textElement = tick.querySelector('text');
                                if (textElement) {
                                        const currentValue = textElement.textContent.trim();
                                        if (currentValue === lastValue) {
                                                tick.style.display = 'none';
                                        } else {
                                                lastValue = currentValue;
                                        }
                                }
                        });
                }, 100);
        };

        useEffect(() => {
                if (props.renderGraph && props.chart === "Line") {
                        removeDuplicateTicks();

                        const observer = new MutationObserver(() => {
                                removeDuplicateTicks();
                        });

                        const chartContainer = document.querySelector('.MuiChartsAxis-directionX');
                        if (chartContainer) {
                                observer.observe(chartContainer, { childList: true, subtree: true });
                        }

                        return () => observer.disconnect();
                }
        }, [props.renderGraph, props.chart]);


        const generateLineChartData = async () => {
                try {
                        const usageResult = await axios.get(
                                `https://durmetrics-api.sglre6355.net/${categoryURLMap[props.categories[0]]}/records`
                        );
                        const usageData = usageResult.data;

                        if (!usageData || usageData.length === 0) {
                                alert("[Error] No data available.");
                                return { xAxis: [], yAxis: [], series: [] };
                        }

                        const siteIDs = usageData.map((record) => record.site_id);
                        const siteParameters = siteIDs.map((id) => `siteids=${id}`).join("&");
                        const siteResult = await axios.get(
                                `https://durmetrics-api.sglre6355.net/sites?${siteParameters}`
                        );
                        const siteNames = siteResult.data.map((site) => site.name);

                        if (!siteNames || siteNames.length === 0) {
                                alert("[Error] No site names available.");
                                return { xAxis: [], yAxis: [], series: [] };
                        }

                        const xAxis = [{
                                label: "Year",
                                data: [],
                                valueFormatter: (val) => `${Math.floor(val)}`,
                        }];
                        const yAxis = [{
                                label: props.categories[0],
                        }];

                        const siteDataMap = {};

                        usageData.forEach((record) => {
                                if (!props.years.includes(record.start_year)) return;

                                const siteName = siteNames[siteIDs.indexOf(record.site_id)];

                                if (!props.sites.includes(siteName)) return;

                                if (!siteDataMap[siteName]) {
                                        siteDataMap[siteName] = [];
                                }

                                siteDataMap[siteName].push(record[categoryDataMap[props.categories[0]]]);

                                const year = Math.floor(record.start_year);
                                xAxis[0].data.push(year);
                        });

                        const series = Object.entries(siteDataMap).map(([siteName, siteData]) => {
                                return { data: siteData, label: siteName };
                        });

                        xAxis[0].data = Array.from(new Set(xAxis[0].data));

                        return { xAxis, yAxis, series };
                } catch (error) {
                        alert("[Error] Could not fetch data.");
                        return { xAxis: [], yAxis: [], series: [] };
                }
        };

        const generateBarChartData = () => {
                return;
        };

        const generatePieChartData = () => {
                return;
        };

        const generateGraph = async () => {
                if (!props.isAvailable) return;

                switch (props.chart) {
                        case "Line": {
                                const data = await generateLineChartData();
                                setGraph(
                                        <LineChart
                                                className="chart"
                                                xAxis={data.xAxis}
                                                yAxis={data.yAxis}
                                                series={data.series}
                                                width={1000}
                                                height={450}
                                                slotProps={{
                                                        legend: {
                                                                hidden: false,
                                                                direction: "row",
                                                                position: { vertical: 'top', horizontal: 'middle' },
                                                        },
                                                }}
                                        />
                                );
                                break;
                        }
                        case "Bar":
                                generateBarChartData();
                                break;
                        case "Pie":
                                generatePieChartData();
                                break;
                        default:
                                break;
                }
        };

        useEffect(() => {
                if (!props.isAvailable) {
                        props.setRenderGraph(false);
                }
        }, [props.isAvailable]);

        return (
                <div>
                        {props.isAvailable ? (
                                <>
                                        {!props.renderGraph &&
                                                <div
                                                        className="generate-button"
                                                        onClick={() => {
                                                                generateGraph();
                                                                props.setRenderGraph(true);
                                                        }}
                                                >
                                                        Generate graph
                                                </div>
                                        }
                                </>
                        ) : (
                                <div className="insights-unavailable">
                                        Select filters to generate a graph
                                </div>
                        )}

                        {props.renderGraph && graph}
                </div>
        );
};

export default Graph;
