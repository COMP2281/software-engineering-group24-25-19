import React, { useEffect } from 'react';
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { legendClasses } from '@mui/x-charts/ChartsLegend';
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
                                type: "band",
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

        const generateBarChartData = async () => {
                try {
                        if (!props.sites || props.sites.length === 0) {
                                alert("[Error] Please select a site for the Bar Chart");
                                return { xAxis: [], yAxis: [], series: [] };
                        }

                        const chosenSiteName = props.sites[0];

                        const sitesResp = await axios.get("https://durmetrics-api.sglre6355.net/sites");
                        const allSites = sitesResp.data || [];

                        const chosenSite = allSites.find((site) => site.name === chosenSiteName);
                        console.log("Chosen site:", chosenSite);
                        if (!chosenSite) {
                                alert("[Error] The site name you selected wasn't found in the database.");
                                return { xAxis: [], yAxis: [], series: [] };
                        }
                        const chosenSiteID = chosenSite.id;

                        const xAxis = [
                                {
                                        label: "Year",
                                        type: "band",
                                        scaleType: 'band',
                                        data: props.years.sort(),
                                        valueFormatter: (val) => `${Math.floor(val)}`,
                                }
                        ];

                        const yAxis = [
                                {
                                        label: "Usage/Cost",
                                }
                        ];

                        const series = [];

                        for (const category of props.categories) {
                                const usageEndpoint = categoryURLMap[category];
                                const usageKey = categoryDataMap[category];

                                const usageResp = await axios.get(
                                        `https://durmetrics-api.sglre6355.net/${usageEndpoint}/records`
                                );
                                const usageData = usageResp.data || [];

                                console.log("Fetched:", category, usageResp);

                                const barData = xAxis[0].data.map((year) => {
                                        const matchingRecords = usageData.filter(
                                                (r) => r.site_id === chosenSiteID && r.start_year === year
                                        );

                                        if (matchingRecords.length === 0) {
                                                return 0;
                                        }

                                        // If multiple records for the same (site, year), sum them up
                                        return matchingRecords.reduce((acc, rec) => acc + rec[usageKey], 0);
                                });

                                series.push({
                                        label: category,
                                        data: barData,
                                });
                        }

                        return { xAxis, yAxis, series };
                } catch (error) {
                        alert("[Error] Could not fetch bar chart data.");
                        return { xAxis: [], yAxis: [], series: [] };
                }
        };


        const generatePieChartData = async () => {
                try {
                        const chosenCategory = props.categories[0];
                        const chosenYear = props.years[0];

                        const sitesResp = await axios.get("https://durmetrics-api.sglre6355.net/sites");
                        const allSitesData = sitesResp.data || [];

                        const siteMap = {};
                        allSitesData.forEach((s) => {
                                siteMap[s.name] = s.id;
                        });

                        const usageEndpoint = categoryURLMap[chosenCategory];
                        const usageKey = categoryDataMap[chosenCategory];

                        const usageResp = await axios.get(
                                `https://durmetrics-api.sglre6355.net/${usageEndpoint}/records`
                        );
                        const usageData = usageResp.data || [];

                        // For each selected site, find usage for the chosen year and sum it
                        const pieData = props.sites.map((siteName) => {
                                const siteId = siteMap[siteName];
                                console.log(siteMap)
                                if (!siteId) {
                                        return { id: siteName, value: 0 };
                                }

                                const matching = usageData.filter(
                                        (r) => r.site_id === siteId && r.start_year === chosenYear
                                );
                                if (matching.length === 0) {
                                        return { id: siteName, value: 0 };
                                }
                                // Sum the usage key
                                const sum = matching.reduce((acc, rec) => acc + rec[usageKey], 0);
                                return { label: siteName, id: siteName, value: sum };
                        });

                        const series = [
                                {
                                        data: pieData,
                                },
                        ];

                        return { series };
                } catch (error) {
                        console.error(error);
                        alert("[Error] Could not fetch pie chart data.");
                        return { series: [] };
                }
        };

        const generateGraph = async () => {
                if (!props.isAvailable) return;

                let data;

                switch (props.chart) {
                        case "Line": {
                                data = await generateLineChartData();
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
                                data = await generateBarChartData();
                                setGraph(
                                        <BarChart
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
                        case "Pie":
                                data = await generatePieChartData();
                                const otherProps = {
                                        sx: {
                                                [`.${legendClasses.root}`]: {
                                                        transform: 'translate(-20px, 0)',
                                                },
                                        },
                                        pie: {
                                                colorMode: 'item',
                                        },
                                }
                                setGraph(
                                        <PieChart
                                                className="chart"
                                                series={data.series}
                                                width={1000}
                                                height={450}
                                                slotProps={{
                                                        legend: {
                                                                hidden: false,
                                                                direction: "column",
                                                                position: { vertical: 'middle', horizontal: 'right' },
                                                        },
                                                }}
                                                {...otherProps}
                                        />
                                );
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
