import React from 'react';
import Header from '../components/Header';
import Body from '../components/Body';
import { PermissionsMenuContextProvider } from '../contexts/PermissionsMenuContext';

const Interface = () => {
        // Tabs numbered from 0 to 7
        const [activeTab, setActiveTab] = React.useState(0);
        const [wantsCSVExport, setWantsCSVExport] = React.useState(false);
        const [wantsExcelExport, setWantsExcelExport] = React.useState(false);

        return (
                <PermissionsMenuContextProvider>
                        <Header
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                wantsCSVExport={wantsCSVExport}
                                setWantsCSVExport={setWantsCSVExport}
                                wantsExcelExport={wantsExcelExport}
                                setWantsExcelExport={setWantsExcelExport}
                        />
                        <Body
                                activeTab={activeTab}
                                wantsCSVExport={wantsCSVExport}
                                setWantsCSVExport={setWantsCSVExport}
                                wantsExcelExport={wantsExcelExport}
                                setWantsExcelExport={setWantsExcelExport}
                        />
                </PermissionsMenuContextProvider>
        );
};

export default Interface;