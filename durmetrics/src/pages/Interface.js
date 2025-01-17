import React from 'react';
import Header from '../components/Header';
import Body from '../components/Body';
import { PermissionsMenuContextProvider } from '../contexts/PermissionsMenuContext';

const Interface = () => {
        // Tabs numbered from 0 to 7
        const [activeTab, setActiveTab] = React.useState(0);

        return (
                <PermissionsMenuContextProvider>
                        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
                        <Body activeTab={activeTab} />
                </PermissionsMenuContextProvider>
        );
};

export default Interface;