import React from 'react';
import MenuItem from './MenuItem';
import MenuFooter from './MenuFooter';
import { usePermissionsMenuContext } from '../contexts/PermissionsMenuContext';

const Menu = () => {
        const { menuContent } = usePermissionsMenuContext();

        return (
                <div className="menu">
                        {menuContent.map((item) => {
                                return <MenuItem key={item.route} item={item} />
                        })}
                        <MenuFooter />
                </div>
        );
};

export default Menu;