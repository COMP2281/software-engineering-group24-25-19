import React, { useEffect } from 'react';
import DataTable from '../components/DataTable';
import report from '../data/report.json'; // For now
import axios from 'axios';

const Tables = (props) => {
        const [data, setData] = React.useState([]);

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

        useEffect(() => {
                setData(report.data);
        }, []);

        useEffect(() => {
                const fetchData = async () => {
                        try {
                                const route = tabRouteMap[props.activeTab];
                                const result = await axios.get(`https://durmetrics-api.sglre6355.net/${route}/records`);
                                setData(result.data);
                        } catch (error) {
                                console.error("Error fetching data:", error);
                        }
                };

                fetchData();
        }, [props.activeTab]);

        useEffect(() => {
                document.title = 'Tables - DurMetrics';
        }, []);


        return (
                <DataTable activeTab={props.activeTab} data={data} />
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