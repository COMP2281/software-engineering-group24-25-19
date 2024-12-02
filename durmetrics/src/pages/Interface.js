import React from 'react';
import Header from '../components/Header';
import Body from '../components/Body';
import { PermissionsMenuContextProvider } from '../contexts/PermissionsMenuContext';

const Interface = () => {
        return (
                <PermissionsMenuContextProvider>
                        <Header />
                        <Body />
                </PermissionsMenuContextProvider>
        );
};

export default Interface;