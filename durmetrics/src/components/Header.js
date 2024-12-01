import React from 'react';

const Header = () => {
        return (
                <div className="header">
                        <div class="header-side">
                                <div class="header-logo-container">
                                        <img class="header-logo" src="logo.png" />
                                </div>
                                <div class="header-access-level">
                                        <div class="access-level">Access Level&nbsp;&nbsp;&nbsp;<b>2&nbsp;&nbsp;(Edit)</b></div>
                                </div>
                        </div>
                        <div class="header-content">
                                <div class="header-title">Tables</div>
                                <div class="header-tabs">
                                        <div class="tab tab-selected">Carbon Emissions</div>
                                        <div class="tab">Electricity</div>
                                        <div class="tab">Gas</div>
                                        <div class="tab">Carbon (%)</div>
                                        <div class="tab">Gas Sites (%)</div>
                                        <div class="tab">Electricity (%)</div>
                                        <div class="tab">kWh per HDD</div>
                                        <div class="tab">Site Information</div>
                                </div>
                        </div>
                </div>
        );
};

export default Header;