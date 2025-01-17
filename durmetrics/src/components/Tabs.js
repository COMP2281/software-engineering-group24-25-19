import React from 'react';

const Tabs = () => {
        return (
                <div className="header-tabs">
                        <div className="tab tab-selected">Carbon Emissions</div>
                        <div className="tab">Electricity</div>
                        <div className="tab">Gas</div>
                        <div className="tab">Carbon (%)</div>
                        <div className="tab">Gas Sites (%)</div>
                        <div className="tab">Electricity (%)</div>
                        <div className="tab">kWh per HDD</div>
                        <div className="tab">Site Information</div>
                </div>
        );
};

export default Tabs;