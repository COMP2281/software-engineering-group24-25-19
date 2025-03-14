import React, { useEffect } from 'react';

const Tabs = (props) => {
        const activeTab = props.activeTab;

        const handleTabClick = (tab) => {
                const tabs = document.querySelectorAll('.tab');
                tabs.forEach(t => t.classList.remove('tab-selected'));
                tab.classList.add('tab-selected');
                props.setActiveTab(tab.getAttribute('tab'));
        };

        useEffect(() => {
                const activeTabElement = document.querySelector(`.tab[tab="${activeTab}"]`);
                if (activeTabElement) {
                        activeTabElement.classList.add('tab-selected');
                }

                const tabs = document.querySelectorAll('.tab');
                tabs.forEach(tab => {
                        tab.addEventListener('click', () => {
                                handleTabClick(tab);
                        });
                });
        }, [activeTab]);

        return (
                <div className="header-tabs">
                        {props.page === "upload" ?
                                <>
                                        <div className="tab tab-selected" tab="0" data-text="Energy Data">Energy Data</div>
                                        <div className="tab" tab="1" data-text="Emission Factors">Emission Factors</div>
                                </>
                                : props.page == "insights" ?
                                        <div className="tab tab-selected" tab="0" data-text="Graph Studio">Graph Studio</div>
                                        :
                                        <>
                                                <div className="tab tab-selected" tab="0" data-text="Carbon Emissions">Carbon Emissions</div>
                                                <div className="tab" tab="1" data-text="Electricity">Electricity</div>
                                                <div className="tab" tab="2" data-text="Gas">Gas</div>
                                                {/* <div className="tab" tab="3" data-text="Carbon (%)">Carbon (%)</div>
                                                <div className="tab" tab="4" data-text="Gas (%)">Gas (%)</div>
                                                <div className="tab" tab="5" data-text="Electricity (%)">Electricity (%)</div> */}
                                                <div className="tab" tab="6" data-text="kWh per HDD">kWh per HDD</div>
                                                <div className="tab" tab="7" data-text="Site Information">Site Information</div>
                                        </>
                        }
                </div>
        );
};

export default Tabs;