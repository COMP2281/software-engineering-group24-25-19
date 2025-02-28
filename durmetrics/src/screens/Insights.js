import { useEffect, useState } from 'react';
import axios from "axios";
import GraphFilters from '../components/GraphFilters';
import Graph from '../components/Graph';

const Insights = (props) => {

        const [years, setYears] = useState([]);
        const [categories, setCategories] = useState("");
        const [sites, setSites] = useState("");
        const [chart, setChart] = useState("");

        const setData = (years, categories, sites, chart) => {
                setYears(years);
                setCategories(categories);
                setSites(sites);
                setChart(chart);
        }

        useEffect(() => {
                if (years.length > 0 && categories && sites && chart) {
                        return;
                }
        }, [years, categories, sites, chart]);

        return (
                <div className="insights-container">
                        <GraphFilters setData={setData} />
                        <Graph isAvailable={years.length > 0 && categories && sites && chart} years={years} categories={categories} sites={sites} chart={chart} />
                </div>
        );
}
export default Insights



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


// if (years.length > 0 && category && type && chart) {
//         const fetchData = async () => {
//                 try {
//                         let result = await axios.get(`https://durmetrics-api.sglre6355.net/${category}/records`);
//                         console.log(result);

//                 } catch (error) {
//                         alert("[Error] Could not fetch data: ", error);
//                 }
//         };

//         fetchData();
// }