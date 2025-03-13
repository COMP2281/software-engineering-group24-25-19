import React, { useEffect, useCallback, useState } from 'react';
import DataTable from '../components/DataTable';
import report from '../data/report.json'; // For now
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import tableHeadersConfig from '../utils/tableHeadersConfig';
import percentageColumnConfig from '../utils/percentageColumnConfig';

const Tables = (props) => {
        const [data, setData] = useState([]);
        const [unchangedData, setUnchangedData] = useState([]); // Full aggregated master data
        const [dataForExport, setDataForExport] = useState([]);
        const [selectedYears, setSelectedYears] = useState([]);
        const [percentageChanges, setPercentageChanges] = useState([]);
        const [percentageTotals, setPercentageTotals] = useState([]);

        // Keep setSelectedYears stable to avoid loops
        const stableSetSelectedYears = useCallback(setSelectedYears, []);

        const tabRouteMap = {
                0: "carbon-emissions",
                1: "electricity-usage",
                2: "gas-usage",
                3: "carbon-percentage",
                4: "gas-sites-percentage",
                5: "electricity-percentage",
                6: "kwh-per-hdd",
                7: "site-information"
        };

        const exportToExcel = async () => {
                if (!dataForExport.length) {
                        alert("No data to export!");
                        return;
                }
                try {
                        const workbook = new ExcelJS.Workbook();
                        const worksheet = workbook.addWorksheet('Data');
                        const headers = Object.keys(dataForExport[0]);
                        worksheet.columns = headers.map((key) => ({
                                header: key,
                                key: key,
                        }));
                        dataForExport.forEach((obj) => {
                                worksheet.addRow(obj);
                        });
                        const headerRow = worksheet.getRow(1);
                        headerRow.font = { bold: true };
                        const buffer = await workbook.xlsx.writeBuffer();
                        const blob = new Blob([buffer], {
                                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        });
                        saveAs(blob, 'data.xlsx');
                } catch (error) {
                        console.error("Excel export failed:", error);
                }
        };

        const exportToCSV = () => {
                if (!dataForExport.length) {
                        alert("No data to export!");
                        return;
                }
                const headers = Object.keys(dataForExport[0]).join(',');
                const csv = [
                        headers,
                        ...dataForExport.map(row => Object.values(row).join(','))
                ].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'data.csv';
                a.click();
                window.URL.revokeObjectURL(url);
        };

        // Aggregation Helper
        // This converts raw API data (with start_year/end_year) into an aggregated shape
        // with columns like "Electricity 17-18" based on tableHeadersConfig import
        const aggregateServerData = (rows, route) => {
                const { staticFields = {}, dynamicFields = {} } = tableHeadersConfig[route] || {};
                const aggregator = rows.reduce((acc, row) => {
                        const siteId = row.site_id;
                        if (!acc[siteId]) acc[siteId] = {};
                        let y1 = "";
                        let y2 = "";
                        if (row.start_year) {
                                y1 = row.start_year.toString().slice(-2);
                        }
                        if (row.end_year) {
                                y2 = row.end_year.toString().slice(-2);
                        }
                        // Insert static fields
                        Object.keys(staticFields).forEach((apiField) => {
                                const displayLabel = staticFields[apiField];
                                acc[siteId][displayLabel] = row[apiField];
                        });
                        // Insert dynamic fields
                        Object.keys(dynamicFields).forEach((apiField) => {
                                let displayLabel = dynamicFields[apiField];
                                displayLabel = displayLabel.replace(/{year1}/g, y1).replace(/{year2}/g, y2);
                                acc[siteId][displayLabel] = row[apiField];
                        });
                        return acc;
                }, {});
                return Object.values(aggregator);
        };

        const fetchTableData = async () => {
                try {
                        const route = tabRouteMap[props.activeTab];
                        if (!route) return;
                        const result = await axios.get(`https://durmetrics-api.sglre6355.net/${route}/records`);
                        const rawRows = result.data || [];
                        console.log(rawRows)
                        const aggregatedRows = aggregateServerData(rawRows, route);
                        setUnchangedData(aggregatedRows); // store master data
                        setData(aggregatedRows); // set visible data (initially all)
                } catch (error) {
                        console.error("Error fetching data:", error);
                }
        };

        const fetchDataForYears = async (years) => {
                try {
                        const route = tabRouteMap[props.activeTab];
                        if (!route) return;
                        const yearsParameters = years.map(year => `start_years=${year}`).join('&');
                        const sitesParameters = dataForExport
                                .map(row => `site_ids=${row.site_id || row["Site ID"]}`)
                                .join('&');
                        const url = `https://durmetrics-api.sglre6355.net/${route}/records?${yearsParameters}&${sitesParameters}`;
                        const result = await axios.get(url);
                        const rawRows = result.data || [];
                        const aggregatedRows = aggregateServerData(rawRows, route);
                        const finalisedRows = await addSiteDetails(aggregatedRows);
                        setData(finalisedRows);
                } catch (error) {
                        console.error("Error fetching data:", error);
                }
        };

        const fetchSites = async (rows) => {
                try {
                        const sitesParameters = rows
                                .map(row => `site_ids=${row.site_id || row["Site ID"]}`)
                                .join('&');
                        const url = `https://durmetrics-api.sglre6355.net/sites?${sitesParameters}`;
                        const result = await axios.get(url);
                        const sites = result.data || [];
                        return sites;
                } catch (err) {
                        console.error("Error fetching sites:", err);
                        return [];
                }
        };

        const addSiteDetails = async (rows) => {
                // Takes in data rows and adds site name and code to each row
                const sites = await fetchSites(rows);
                let newRows = [];

                for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        const site = sites.find(site => site.id === (row.site_id || row["Site ID"]));
                        const { site_id, "Site ID": siteID, ...rowWithoutID } = row;
                        newRows.push({
                                "Site ID": siteID,
                                "Site Name": site.name !== 'None' ? site.name : "",
                                "Site Code": site.unique_property_reference_number !== 'None' ? site.unique_property_reference_number || "" : "",
                                ...rowWithoutID
                        });
                }
                console.log(newRows)
                return newRows;
        };

        // Load dummy data initially (local JSON) – for dev
        useEffect(() => {
                setData(report.data);
        }, []);

        // Fetch fresh data whenever the user switches tabs
        useEffect(() => {
                fetchTableData();
                // Also clear any percentage changes when tab changes
                setPercentageChanges([]);
        }, [props.activeTab]);

        // If user selects specific years, fetch data for those years
        useEffect(() => {
                if (selectedYears.length > 0) {
                        fetchDataForYears(selectedYears);
                }
        }, [selectedYears]);

        // Handle export triggers
        useEffect(() => {
                if (props.wantsCSVExport) exportToCSV();
                if (props.wantsExcelExport) exportToExcel();
                props.setWantsCSVExport(false);
                props.setWantsExcelExport(false);
        }, [props.wantsCSVExport, props.wantsExcelExport]);

        // Set the document title
        useEffect(() => {
                document.title = 'Tables - DurMetrics';
        }, []);

        // Whenever percentageChanges updates, add or remove the % Change columns
        // This uses unchangedData for calculations but shows columns based on data variable
        useEffect(() => {
                // If there's no data, do nothing
                if (!data.length) return;

                // Determine which column prefix to use based on current route
                const route = tabRouteMap[props.activeTab];

                const columnPrefix = percentageColumnConfig[route] || "Electricity";

                // Build a set of allowed % Change column names based on current percentageChanges
                const allowedPctCols = new Set(
                        percentageChanges.map(({ year1, year2 }) => {
                                const y1 = year1.toString().slice(-2);
                                const y2 = year2.toString().slice(-2);
                                return `% Change ${y1}-${y2}`;
                        })
                );

                let changedSomething = false;
                const updatedData = data.map((row) => {
                        // Convert row to entries for ordered manipulation
                        let rowEntries = Object.entries(row);

                        // Remove any % Change columns that are no longer allowed
                        const originalLength = rowEntries.length;
                        rowEntries = rowEntries.filter(([colName]) => {
                                if (colName.startsWith('% Change ')) {
                                        return allowedPctCols.has(colName);
                                }
                                return true;
                        });
                        if (rowEntries.length !== originalLength) {
                                changedSomething = true;
                        }

                        const siteId = row.site_id || row["Site ID"];
                        // Find the matching row in unchangedData for hidden values
                        const masterRow = unchangedData.find(
                                (r) => r.site_id === siteId || r["Site ID"] === siteId
                        );

                        // Helper: parse a column like "Electricity 17-18" or "Gas 17-18" to extract the numeric start year
                        function getColumnStartYear(colName) {
                                const regex = new RegExp(`^${columnPrefix}\\s+(\\d+)-\\d+$`);
                                const match = colName.match(regex);
                                return match ? parseInt(match[1], 10) : NaN;
                        }

                        // For each requested % change (only for allowed ones)
                        for (const { year1, year2 } of percentageChanges) {
                                const y1 = year1.toString().slice(-2);
                                const y2 = year2.toString().slice(-2);
                                const firstYearCol = `${columnPrefix} ${y1}-${parseInt(y1, 10) + 1}`;
                                const secondYearCol = `${columnPrefix} ${y2}-${parseInt(y2, 10) + 1}`;
                                const changeColName = `% Change ${y1}-${y2}`;

                                // If this column already exists in the current row, skip adding it
                                if (row[changeColName] !== undefined) {
                                        continue;
                                }

                                // Pull value for firstYearCol from row, fallback to masterRow if missing
                                let val1 = row[firstYearCol];
                                if (val1 === undefined && masterRow) {
                                        val1 = masterRow[firstYearCol];
                                }
                                val1 = parseFloat(val1) || 0;

                                // Pull value for secondYearCol from row, fallback to masterRow if missing
                                let val2 = row[secondYearCol];
                                if (val2 === undefined && masterRow) {
                                        val2 = masterRow[secondYearCol];
                                }
                                val2 = parseFloat(val2) || 0;

                                let pctChange = 0;
                                if (val1 !== 0) {
                                        pctChange = ((val2 - val1) / val1) * 100;
                                }

                                const finalNum = Number.isNaN(pctChange) ? 0 : +pctChange.toFixed(2)
                                const finalVal = `${finalNum > 0 ? "+" : ""}${finalNum}%`;

                                // Determine where to insert the new % Change column in rowEntries
                                const secondYearIndex = rowEntries.findIndex(
                                        ([colName]) => colName === secondYearCol
                                );
                                if (secondYearIndex !== -1) {
                                        // Insert right after the secondYearCol
                                        rowEntries.splice(secondYearIndex + 1, 0, [changeColName, finalVal]);
                                        changedSomething = true;
                                } else {
                                        // If secondYearCol is not visible, insert before the next-larger column with the given prefix
                                        const desiredYear = parseInt(y2, 10);
                                        let insertionIndex = -1;
                                        for (let i = 0; i < rowEntries.length; i++) {
                                                const [colName] = rowEntries[i];
                                                if (colName.startsWith(`${columnPrefix} `)) {
                                                        const colStart = getColumnStartYear(colName);
                                                        if (!isNaN(colStart) && colStart > desiredYear) {
                                                                insertionIndex = i;
                                                                break;
                                                        }
                                                }
                                        }
                                        if (insertionIndex === -1) {
                                                insertionIndex = rowEntries.length;
                                        }
                                        rowEntries.splice(insertionIndex, 0, [changeColName, finalVal]);
                                        changedSomething = true;
                                }
                        }
                        return Object.fromEntries(rowEntries);
                });
                if (changedSomething) {
                        setData(updatedData);
                }
        }, [data, unchangedData, percentageChanges, props.activeTab]);

        // Whenever percentageTotals updates, add or remove the % Total columns
        // This uses unchangedData for calculations but shows columns based on data variable
        useEffect(() => {
                console.log("Percentage Totals (Years):", percentageTotals);
                if (!data.length) return;

                const route = tabRouteMap[props.activeTab];
                const columnPrefix = percentageColumnConfig[route] || "Electricity";
                const columnTotals = {};

                // Calculate totals for each specified year's column
                unchangedData.forEach(dataRow => {
                        percentageTotals.forEach(year => {
                                const y1 = year.toString().slice(-2);
                                const columnName = `${columnPrefix} ${y1}-${parseInt(y1, 10) + 1}`;
                                const value = parseFloat(dataRow[columnName]) || 0;
                                columnTotals[columnName] = (columnTotals[columnName] || 0) + value;
                        });
                });

                let changedSomething = false;
                const updatedData = data.map((row) => {
                        let rowEntries = Object.entries(row);
                        const siteId = row.site_id || row["Site ID"];
                        const masterRow = unchangedData.find(
                                (r) => r.site_id === siteId || r["Site ID"] === siteId
                        );

                        // Remove any % Total columns that are no longer needed
                        const allowedPctTotalCols = new Set(
                                percentageTotals.map(year => {
                                        const y1 = year.toString().slice(-2);
                                        const columnName = `${columnPrefix} ${y1}-${parseInt(y1, 10) + 1}`;
                                        return `% Total for ${columnName}`;
                                })
                        );

                        const originalLength = rowEntries.length;
                        rowEntries = rowEntries.filter(([colName]) => {
                                if (colName.startsWith('% Total for ')) {
                                        return allowedPctTotalCols.has(colName);
                                }
                                return true;
                        });
                        if (rowEntries.length !== originalLength) {
                                changedSomething = true;
                        }

                        percentageTotals.forEach(year => {
                                const y1 = year.toString().slice(-2);
                                const columnName = `${columnPrefix} ${y1}-${parseInt(y1, 10) + 1}`;
                                const total = columnTotals[columnName];
                                const value = parseFloat(row[columnName]) || 0;
                                const pctTotal = total > 0 ? (value / total) * 100 : 0;
                                const pctTotalFormatted = `${pctTotal.toFixed(2)}%`;
                                const totalColName = `% Total for ${columnName}`;

                                if (row[totalColName] !== undefined) {
                                        return;
                                }

                                const columnIndex = rowEntries.findIndex(([key]) => key === columnName);
                                if (columnIndex !== -1) {
                                        rowEntries.splice(columnIndex + 1, 0, [totalColName, pctTotalFormatted]);
                                        changedSomething = true;
                                } else {
                                        rowEntries.push([totalColName, pctTotalFormatted]);
                                        changedSomething = true;
                                }
                        });
                        return Object.fromEntries(rowEntries);
                });

                if (changedSomething) {
                        setData(updatedData);
                }

        }, [data, unchangedData, percentageTotals, props.activeTab]);

        // Clear all percentageChanges when a new tab is clicked
        useEffect(() => {
                setPercentageChanges([]);
        }, [props.activeTab]);

        return (
                <DataTable
                        activeTab={props.activeTab}
                        data={data}
                        setDataForExport={setDataForExport}
                        selectedYears={selectedYears}
                        setSelectedYears={stableSetSelectedYears}
                        unchangedData={unchangedData}
                        percentageChanges={percentageChanges}
                        setPercentageChanges={setPercentageChanges}
                        percentageTotals={percentageTotals}
                        setPercentageTotals={setPercentageTotals}
                />
        );
};

export default Tables;
