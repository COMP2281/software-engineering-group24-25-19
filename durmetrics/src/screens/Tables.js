import React, { useEffect } from 'react';
import DataTable from '../components/DataTable';

const Tables = (props) => {
        useEffect(() => {
                document.title = 'Tables - DurMetrics';
        }, []);

        return (
                <DataTable activeTab={props.activeTab} />
        );
};

export default Tables;