import React from 'react';


const MenuItem = (props) => {
        var isActive = props.item.route === window.location.pathname;

        if (window.location.pathname === "/" && props.item.route === '/tables') {
                isActive = true;
        }

        return (
                <>
                        {isActive ? (
                                <span className="menu-item menu-item-selected">
                                        <img src={`${props.item.icon}-icon.svg`} alt="menu-icon" className="menu-icon" />
                                        <div className="menu-text">{props.item.title}</div>
                                </span>
                        ) : (
                                <a className="menu-item" href={props.item.route}>
                                        <img src={`${props.item.icon}-icon.svg`} alt="menu-icon" className="menu-icon" />
                                        <div className="menu-text">{props.item.title}</div>
                                </a>
                        )}
                </>
        );
};

export default MenuItem;