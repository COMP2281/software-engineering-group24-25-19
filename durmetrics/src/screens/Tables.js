import React, { useEffect, useCallback } from 'react';
import DataTable from '../components/DataTable';
import report from '../data/report.json'; // For now
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const Tables = (props) => {
        const [data, setData] = React.useState([]);
        const [unchangedData, setUnchangedData] = React.useState([]);
        const [dataForExport, setDataForExport] = React.useState([]);
        const [selectedYears, setSelectedYears] = React.useState([]);
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

                        // Make  first row (headers) bold
                        const headerRow = worksheet.getRow(1);
                        headerRow.font = { bold: true };

                        const buffer = await workbook.xlsx.writeBuffer();

                        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                        saveAs(blob, 'data.xlsx');

                } catch (error) {
                        console.error("Excel export failed:", error);
                }
        };

        const exportToCSV = () => {
                const headers = Object.keys(dataForExport[0] || {}).join(',');
                const csv = [headers, ...dataForExport.map(row => Object.values(row).join(','))].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'data.csv';
                a.click();
                window.URL.revokeObjectURL(url);
        };

        const fetchTableData = async () => {
                try {
                        const route = tabRouteMap[props.activeTab];
                        const result = await axios.get(`https://durmetrics-api.sglre6355.net/${route}/records`);
                        setUnchangedData(result.data);
                        setData(result.data);
                } catch (error) {
                        console.error("Error fetching data:", error);
                }
        };

        const fetchDataForYears = async (years) => {
                try {
                        const route = tabRouteMap[props.activeTab];
                        const yearsParameters = years.map(year => `start_years=${year}`).join('&');
                        const sitesParameters = dataForExport.map(row => `site_ids=${row.site_id}`).join('&');

                        const result = await axios.get(`https://durmetrics-api.sglre6355.net/${route}/records?${yearsParameters}&${sitesParameters}`);

                        // Aggregate data by site_id
                        const aggregatedData = result.data.reduce((acc, row) => {
                                const siteId = row.site_id;
                                const yearRange = `${row.start_year.toString().slice(-2)}-${row.end_year.toString().slice(-2)}`;

                                if (!acc[siteId]) {
                                        acc[siteId] = {
                                                site_id: siteId,
                                                site_name: row.site_name,
                                        };
                                }

                                acc[siteId][`Electricity ${yearRange}`] = row.energy_usage_kwh;
                                acc[siteId][`Cost (£) for ${yearRange}`] = row.cost_gbp;

                                return acc;
                        }, {});

                        const transformedData = Object.values(aggregatedData);

                        setData(transformedData);
                } catch (error) {
                        console.error("Error fetching data:", error);
                }
        };


        useEffect(() => {
                setData(report.data);
        }, []);

        useEffect(() => {
                fetchTableData();
        }, [props.activeTab]);

        useEffect(() => {
                if (selectedYears.length) fetchDataForYears(selectedYears);
        }, [selectedYears]);

        useEffect(() => {
                if (props.wantsCSVExport) exportToCSV();
                if (props.wantsExcelExport) exportToExcel();

                props.setWantsCSVExport(false);
                props.setWantsExcelExport(false);
        }, [props.wantsCSVExport, props.wantsExcelExport]);

        useEffect(() => {
                document.title = 'Tables - DurMetrics';
        }, []);

        return (
                <DataTable
                        activeTab={props.activeTab}
                        data={data}
                        setDataForExport={setDataForExport}
                        selectedYears={selectedYears}
                        setSelectedYears={stableSetSelectedYears}
                        unchangedData={unchangedData}
                />
        );
};

export default Tables;


// const [tableColumns, setTableColumns] = useState([]);
// const [tableRows, setTableRows] = useState([]);
// const [data, setData] = useState([]);

// useEffect(async () => {

//         let result = await axios.get("https://durmetrics-api.sglre6355.net/gas-usage/records");
//         console.log(result);
//         for (let row of result.data) {
//                 console.log(row.energy_usage_kwh);
//         }

//         const columns = Object.keys(result.data[0] || {}).map((key) => ({
//                 title: key,
//                 field: key,
//                 width: Math.max(
//                         key.length * 15, // approximate width of header text
//                         ...result.data.map((row) => (row[key]?.length || 0) * 8) // width of content
//                 ),
//         }));

//         setTableColumns(columns);

//         // map rows with matching keys
//         const rows = result.data.map((row, index) => ({
//                 id: index + 1,
//                 ...row,
//         }));
//         console.log(rows)
//         var filtered = rows.filter(row => { return row.start_year === 2020 })
//         console.log(filtered.map(row => row.energy_usage_kwh));
//         setTableRows(rows);

// }, []);