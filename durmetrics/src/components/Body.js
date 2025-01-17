import React from 'react';
import Menu from './Menu';
import Content from './Content';

const Body = (props) => {
        return (
                <div className="lower">
                        <Menu />
                        <Content activeTab={props.activeTab} />
                </div>
        );
};

export default Body;