import React from 'react';
import Menu from './Menu';
import Content from './Content';

const Body = () => {
        return (
                <div className="lower">
                        <Menu />
                        <Content />
                </div>
        );
};

export default Body;