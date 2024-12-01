import React, { useState, createContext, useContext } from 'react';

export const MenuContext = createContext();

export const MenuContextProvider = (props) => {
        const [menuContent, setMenuContent] = useState(
                [
                        {
                                title: 'Tables',
                                route: '/tables',
                                icon: 'table'
                        },
                        {
                                title: 'Insights',
                                route: '/insights',
                                icon: 'chart-column'
                        },
                        {
                                title: 'Upload',
                                route: '/upload',
                                icon: 'upload'
                        }
                ]
        );

        return (
                <MenuContext.Provider value={menuContent}>
                        {props.children}
                </MenuContext.Provider>
        );
};

export const useMenuContext = () => useContext(MenuContext);