import React from 'react';
import DataTable from '../components/DataTable';

const Insights = (props) => {
        return (
                <DataTable activeTab={props.activeTab} />
        );
};

export default Insights;