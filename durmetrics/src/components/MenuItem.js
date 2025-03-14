import React from 'react';


const MenuItem = (props) => {
        var isActive = props.item.route == window.location.pathname;

        if (window.location.pathname == "/" && props.item.route == '/tables') {
                isActive = true;
        }

        return (
                <a className={`menu-item ${isActive ? 'menu-item-selected' : ''}`} href={isActive ? "#" : props.item.route}>
                        <img src={`${props.item.icon}-icon.svg`} className="menu-icon" />
                        <div className="menu-text">{props.item.title}</div>
                </a>
        );
};

export default MenuItem;