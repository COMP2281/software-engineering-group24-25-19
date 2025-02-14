import React, { useEffect } from 'react';
import DataTable from '../components/DataTable';

const Insights = (props) => {
        useEffect(() => {
                document.title = 'Insights - DurMetrics';
        }, []);

        return (
                <DataTable activeTab={props.activeTab} />
        );
};

export default Insights;