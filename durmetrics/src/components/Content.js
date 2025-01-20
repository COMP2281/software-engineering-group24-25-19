import React, { useEffect, useState } from "react";
import DataTable from './DataTable';
import { Routes, Route } from 'react-router-dom';

const Content = (props) => {
        return (
                <div className="body">
                        <Routes>
                                <Route path="/" element={<DataTable activeTab={props.activeTab} />} />
                                <Route path="/tables" element={<DataTable activeTab={props.activeTab} />} />
                                <Route path="/insights" element={<DataTable activeTab={props.activeTab} />} />
                                <Route path="/upload" element={<p>Hello</p>} />
                        </Routes>
                </div>
        );
};
export default Content;