import React from 'react';
import { usePermissionsMenuContext } from '../contexts/PermissionsMenuContext';
import Tabs from './Tabs';

const Header = (props) => {
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
                                <Tabs activeTab={props.activeTab} setActiveTab={props.setActiveTab} page={window.location.pathname.split('/')[1]} />
                                {pageTitle == "Tables" &&
                                        <button className="header-export-button" onClick={props.onButtonClick}>
                                                <img src="export-icon.svg" alt="Export" className="export-icon" />
                                                Export table
                                        </button>}
                        </div>
                </div>
        );
};

export default Header;