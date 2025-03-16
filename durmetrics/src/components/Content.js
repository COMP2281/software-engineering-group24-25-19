import React from "react";
import { Routes, Route } from 'react-router-dom';
import Tables from '../screens/Tables';
import Insights from '../screens/Insights';
import Upload from '../screens/Upload';

const Content = (props) => {
        return (
                <div className="body">
                        <Routes>
                                <Route path="/" element={<Tables activeTab={props.activeTab} wantsCSVExport={props.wantsCSVExport} setWantsCSVExport={props.setWantsCSVExport} wantsExcelExport={props.wantsExcelExport} setWantsExcelExport={props.setWantsExcelExport} />} />
                                <Route path="/tables" element={<Tables activeTab={props.activeTab} wantsCSVExport={props.wantsCSVExport} setWantsCSVExport={props.setWantsCSVExport} wantsExcelExport={props.wantsExcelExport} setWantsExcelExport={props.setWantsExcelExport} />} />
                                <Route path="/insights" element={<Insights activeTab={props.activeTab} />} />
                                <Route path="/upload" element={<Upload activeTab={props.activeTab} />} />
                        </Routes>
                </div>
        );
};
export default Content;