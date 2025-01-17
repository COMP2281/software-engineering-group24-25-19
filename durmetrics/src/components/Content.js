import React, { useEffect, useState } from "react";
import DataTable from './DataTable';

const Content = (props) => {
        return (
                <div className="body">
                        <DataTable activeTab={props.activeTab} />
                </div>
        );
};
export default Content;