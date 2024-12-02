import React from 'react';
import MenuItem from './MenuItem';
import { usePermissionsMenuContext } from '../contexts/PermissionsMenuContext';

const Menu = () => {
        const { menuContent } = usePermissionsMenuContext();
        console.log(menuContent)

        return (
                <div className="menu">

                </div>
        );
};

export default Menu;