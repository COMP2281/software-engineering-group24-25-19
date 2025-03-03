import React, { useEffect } from 'react';
import DataTable from '../components/DataTable';
import report from '../data/report.json';

const Tables = (props) => {
        const [data, setData] = React.useState([]);

        useEffect(() => {
                setData(report.data);
        }, []);

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