import React from 'react';
import Menu from './Menu';
import Content from './Content';

const Body = (props) => {
        return (
                <div className="lower">
                        <Menu />
                        <Content
                                activeTab={props.activeTab}
                                wantsCSVExport={props.wantsCSVExport}
                                setWantsCSVExport={props.setWantsCSVExport}
                                wantsExcelExport={props.wantsExcelExport}
                                setWantsExcelExport={props.setWantsExcelExport}
                        />
                </div>
        );
};

export default Body;