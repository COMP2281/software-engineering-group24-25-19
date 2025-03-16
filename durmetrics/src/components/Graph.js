import React, { useEffect } from 'react';
import axios from "axios";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import GraphLegend from './GraphLegend';

const theme = createTheme({});

// Fixed palette to assign different colours to series
const colourPalette = [
        "#02B2AF",
        "#2E96FF",
        "#B800D8",
        "#60009B",
        "#2731C8",
        "#03008D"
];


const Graph = ({ isAvailable, setRenderGraph, ...props }) => {
        const [graph, setGraph] = React.useState(null);
        const [chartSeries, setChartSeries] = React.useState([]);

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
        };

        const removeDuplicateTicks = () => {
                setTimeout(() => {
                        const ticks = document.querySelectorAll(
                                '.MuiChartsAxis-directionX > .MuiChartsAxis-tickContainer'
                        );
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
                        const observer = new MutationObserver(() => removeDuplicateTicks());
                        const chartContainer = document.querySelector('.MuiChartsAxis-directionX');
                        if (chartContainer) {
                                observer.observe(chartContainer, { childList: true, subtree: true });
                        }
                        return () => observer.disconnect();
                }
        }, [props.renderGraph, props.chart]);

        const generateLineChartData = async () => {
                try {
                        const usageResp = await axios.get(
                                `https://durmetrics-api.sglre6355.net/${categoryURLMap[props.categories[0]]}/records`
                        );
                        const usageData = usageResp.data;
                        if (!usageData || usageData.length === 0) {
                                alert("[Error] No data for line chart.");
                                return { xAxis: [], yAxis: [], series: [] };
                        }

                        const siteIDs = usageData.map((record) => record.site_id);
                        const siteParams = siteIDs.map((id) => `siteids=${id}`).join("&");
                        const siteResult = await axios.get(
                                `https://durmetrics-api.sglre6355.net/sites?${siteParams}`
                        );
                        const siteNames = siteResult.data.map((site) => site.name);

                        const xAxis = [
                                {
                                        label: "Year",
                                        type: "band",
                                        data: [],
                                        valueFormatter: (val) => `${Math.floor(val)}`,
                                },
                        ];
                        const yAxis = [{ label: props.categories[0] }];
                        const siteDataMap = {};

                        usageData.forEach((rec) => {
                                if (!props.years.includes(rec.start_year)) return;
                                const index = siteIDs.indexOf(rec.site_id);
                                const siteName = siteNames[index];

                                if (!props.sites.includes(siteName)) return;
                                if (!siteDataMap[siteName]) {
                                        siteDataMap[siteName] = [];
                                }

                                siteDataMap[siteName].push(rec[categoryDataMap[props.categories[0]]]);
                                xAxis[0].data.push(Math.floor(rec.start_year));
                        });

                        xAxis[0].data = [...new Set(xAxis[0].data)];

                        const series = Object.entries(siteDataMap).map(([siteName, data], i) => ({
                                label: siteName,
                                data,
                                colour: colourPalette[i % colourPalette.length],
                        }));

                        return { xAxis, yAxis, series };
                } catch (err) {
                        alert("[Error] Could not fetch line chart data.");
                        return { xAxis: [], yAxis: [], series: [] };
                }
        };

        const generateBarChartData = async () => {
                try {
                        if (!props.sites || props.sites.length === 0) {
                                alert("[Error] Please select at least one site for the Bar Chart.");
                                return { xAxis: [], yAxis: [], series: [] };
                        }
                        const chosenSite = props.sites[0];
                        const sitesResp = await axios.get("https://durmetrics-api.sglre6355.net/sites");
                        const allSites = sitesResp.data || [];
                        const matchingSite = allSites.find((s) => s.name === chosenSite);
                        if (!matchingSite) {
                                alert("[Error] The site you selected wasn't found.");
                                return { xAxis: [], yAxis: [], series: [] };
                        }

                        const xAxis = [
                                {
                                        label: "Year",
                                        type: "band",
                                        scaleType: 'band',
                                        data: props.years.sort(),
                                        valueFormatter: (val) => `${Math.floor(val)}`,
                                },
                        ];
                        const yAxis = [{ label: "Usage/Cost" }];
                        const series = [];

                        for (const category of props.categories) {
                                const usageEndpoint = categoryURLMap[category];
                                const usageKey = categoryDataMap[category];
                                const usageResp = await axios.get(
                                        `https://durmetrics-api.sglre6355.net/${usageEndpoint}/records`
                                );
                                const usageData = usageResp.data || [];

                                const barData = xAxis[0].data.map((year) => {
                                        const matching = usageData.filter(
                                                (r) => r.site_id === matchingSite.id && r.start_year === year
                                        );
                                        if (matching.length === 0) return 0;
                                        return matching.reduce((acc, rec) => acc + rec[usageKey], 0);
                                });

                                series.push({
                                        label: category,
                                        data: barData,
                                        colour: colourPalette[series.length % colourPalette.length],
                                });
                        }

                        return { xAxis, yAxis, series };
                } catch (err) {
                        alert("[Error] Could not fetch bar chart data.");
                        return { xAxis: [], yAxis: [], series: [] };
                }
        };

        const generatePieChartData = async () => {
                try {
                        const chosenCategory = props.categories[0];
                        const chosenYear = props.years[0];
                        const usageEndpoint = categoryURLMap[chosenCategory];
                        const usageKey = categoryDataMap[chosenCategory];
                        const sitesResp = await axios.get("https://durmetrics-api.sglre6355.net/sites");
                        const allSites = sitesResp.data || [];
                        const siteMap = {};
                        allSites.forEach((s) => {
                                siteMap[s.name] = s.id;
                        });

                        const usageResp = await axios.get(
                                `https://durmetrics-api.sglre6355.net/${usageEndpoint}/records`
                        );
                        const usageData = usageResp.data || [];

                        // Assign colours from the palette for each site in order
                        const pieData = props.sites.map((siteName, i) => {
                                const siteId = siteMap[siteName];
                                if (!siteId) {
                                        return { label: siteName, value: 0, colour: colourPalette[i % colourPalette.length] };
                                }
                                const matching = usageData.filter(
                                        (r) => r.site_id === siteId && r.start_year === chosenYear
                                );
                                if (!matching.length) {
                                        return { label: siteName, value: 0, colour: colourPalette[i % colourPalette.length] };
                                }
                                const total = matching.reduce((acc, rec) => acc + rec[usageKey], 0);
                                return { label: siteName, value: total, colour: colourPalette[i % colourPalette.length] };
                        });

                        const series = [{ data: pieData }];
                        return { series };
                } catch (err) {
                        alert("[Error] Could not fetch pie chart data.");
                        return { series: [] };
                }
        };

        const generateGraph = async () => {
                if (!isAvailable) return;
                let data;
                switch (props.chart) {
                        case "Line": {
                                data = await generateLineChartData();
                                setChartSeries(data.series);
                                setGraph(
                                        <LineChart
                                                width={1000}
                                                height={450}
                                                xAxis={data.xAxis}
                                                yAxis={data.yAxis}
                                                series={data.series}
                                                slotProps={{
                                                        legend: { hidden: true },
                                                }}
                                        />
                                );
                                break;
                        }
                        case "Bar": {
                                data = await generateBarChartData();
                                setChartSeries(data.series);
                                setGraph(
                                        <BarChart
                                                width={1000}
                                                height={450}
                                                xAxis={data.xAxis}
                                                yAxis={data.yAxis}
                                                series={data.series}
                                                slotProps={{
                                                        legend: { hidden: true },
                                                }}
                                        />
                                );
                                break;
                        }
                        case "Pie": {
                                data = await generatePieChartData();
                                setChartSeries(data.series[0]?.data || []);
                                setGraph(
                                        <PieChart
                                                width={1000}
                                                height={450}
                                                series={data.series}
                                                slotProps={{
                                                        legend: { hidden: true },
                                                }}
                                                pie={{ colourMode: 'item' }}
                                        />
                                );
                                break;
                        }
                        default:
                                break;
                }
        };

        useEffect(() => {
                if (!isAvailable) {
                        setRenderGraph(false);
                }
        }, [isAvailable, setRenderGraph]);

        return (
                <ThemeProvider theme={theme}>
                        <div style={{ width: '100%' }}>
                                {isAvailable ? (
                                        <>
                                                {!props.renderGraph && (
                                                        <div
                                                                className="generate-button"
                                                                onClick={() => {
                                                                        generateGraph();
                                                                        setRenderGraph(true);
                                                                }}
                                                        >
                                                                Generate graph
                                                        </div>
                                                )}
                                        </>
                                ) : (
                                        <div className="insights-unavailable">
                                                Select filters to generate a graph
                                        </div>
                                )}

                                {props.renderGraph && (
                                        <>
                                                {props.chart === "Pie" && <div style={{ height: "30px" }}></div>}
                                                <Box mt={2} display={props.chart === "Pie" ? "flex" : "block"}>
                                                        {props.chart === "Pie" ? (
                                                                <>
                                                                        {graph}
                                                                        <GraphLegend
                                                                                items={chartSeries}
                                                                                width={props.containerWidth}
                                                                                orientation="vertical"
                                                                        />
                                                                </>
                                                        ) : (
                                                                <>
                                                                        <GraphLegend
                                                                                items={chartSeries}
                                                                                width={props.containerWidth}
                                                                                orientation="horizontal"
                                                                        />
                                                                        {graph}
                                                                </>
                                                        )}
                                                </Box>
                                        </>
                                )}
                        </div>
                </ThemeProvider>
        );
};

export default Graph;