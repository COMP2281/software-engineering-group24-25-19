import React, { useEffect } from 'react';
import Header from '../components/Header';
import Body from '../components/Body';
import { PermissionsMenuContextProvider } from '../contexts/PermissionsMenuContext';

const Interface = () => {
        // Tabs numbered from 0 to 7
        const [activeTab, setActiveTab] = React.useState(0);
        const [wantsExport, setWantsExport] = React.useState(false);

        return (
                <PermissionsMenuContextProvider>
                        <Header activeTab={activeTab} setActiveTab={setActiveTab} setWantsExport={setWantsExport} />
                        <Body activeTab={activeTab} wantsExport={wantsExport} setWantsExport={setWantsExport} />
                </PermissionsMenuContextProvider>
        );
};

export default Interface;