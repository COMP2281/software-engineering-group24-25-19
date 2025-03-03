import React from 'react';
import Menu from './Menu';
import Content from './Content';

const Body = (props) => {
        return (
                <div className="lower">
                        <Menu />
                        <Content activeTab={props.activeTab} wantsExport={props.wantsExport} setWantsExport={props.setWantsExport} />
                </div>
        );
};

export default Body;