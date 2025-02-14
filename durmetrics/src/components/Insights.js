import { useEffect, useState } from 'react';
import report from '../data/report.csv';
import Papa from 'papaparse';
import { BarChart } from '@mui/x-charts';
import axios from "axios";
import { TableCell, TableRow } from '@mui/material';
/*
export default function ChartsOverviewDemo() {
    return(
        <BarChart
            series={[
                { data: [35, 44, 24, 34] },
                { data: [51, 6, 49, 30] },
                { data: [15, 25, 30, 50] },
                { data: [60, 50, 15, 25] },
            ]}
            height={290}
            xAxis={[{ data: ['Q1', 'Q2', 'Q3', 'Q4'], scaleType: 'band' }]}
            margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
        />
    );
}
*/

const Insights = (props) => {
    
    const [tableColumns, setTableColumns] = useState([]);
    const [tableRows, setTableRows] = useState([]);
    const [data, setData] = useState([]);

    useEffect(async() => {
        
        let result = await axios.get("https://durmetrics-api.sglre6355.net/gas-usage/records");
        console.log(result);
        for(let row of result.data) {
            console.log(row.energy_usage_kwh);
        }
        
        const columns = Object.keys(result.data[0] || {}).map((key) => ({
            title: key,
            field: key,
            width: Math.max(
                    key.length * 15, // approximate width of header text
                    ...result.data.map((row) => (row[key]?.length || 0) * 8) // width of content
            ),
            }));

        setTableColumns(columns);

        // map rows with matching keys
        const rows = result.data.map((row, index) => ({
                id: index + 1,
                ...row,
        }));
        console.log(rows)
        var filtered = rows.filter(row => { return row.start_year === 2020})
        console.log(filtered.map(row => row.energy_usage_kwh));
        setTableRows(rows);
        
    }, []);

    return (
        console.log("xx")
    );
}
export default Insights
