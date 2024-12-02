import React from 'react';
import { usePermissionsMenuContext } from '../contexts/PermissionsMenuContext';

const Header = () => {
        const { permissionLevel, menuContent } = usePermissionsMenuContext();
        const permissionsTags = { 2: "Edit", 1: "View", 0: "None" };

        const getPageTitle = () => {
                if (window.location.pathname == "/") return "Tables";

                for (let i = 0; i < menuContent.length; i++) {
                        if (menuContent[i].route == window.location.pathname) {
                                return menuContent[i].title;
                        }
                }
        }

        const pageTitle = getPageTitle();


        return (
                <div className="header">
                        <div className="header-side">
                                <div className="header-logo-container">
                                        <img className="header-logo" src="logo.png" />
                                </div>
                                <div className="header-access-level">
                                        <div className="access-level">Access Level&nbsp;&nbsp;&nbsp;
                                                <b>{permissionLevel || 0}&nbsp;&nbsp;({permissionsTags[permissionLevel || 0]})</b>
                                        </div>
                                </div>
                        </div>
                        <div className="header-content">
                                <div className="header-title">{pageTitle}</div>
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
                        </div>
                </div>
        );
};

export default Header;