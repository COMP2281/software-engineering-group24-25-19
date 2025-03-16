import React, { useEffect, useState } from 'react';
import MultiDropdown from './MultiDropdown';
import Dropdown from './Dropdown';
import axios from "axios";

const getSites = async () => {
        try {
                let result = await axios.get(`https://durmetrics-api.sglre6355.net/sites`);
                return result.data;
        } catch (error) {
                alert("[Error] Could not fetch sites.");
        }
};

const GraphFilters = ({ setData, setRenderGraph }) => {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => currentYear - i);
        const categories = ["Electricity (kWh)", "Electricity (£)", "Gas (kWh)", "Gas (£)"];
        const charts = ["Line", "Bar", "Pie"];
        const [sites, setSites] = useState(["test"]);

        useEffect(() => {
                getSites().then(data => {
                        setSites(data.map(site => site.name));
                });
        }, []);

        const [chart, setChart] = useState(null);
        const [dataYears, setDataYears] = useState([]);
        const [dataCategories, setDataCategories] = useState([]);
        const [dataSites, setDataSites] = useState([]);

        const handleChartChange = (selectedChart) => {
                setChart(selectedChart);
                setDataYears([]);
                setDataCategories([]);
                setDataSites([]);
        };

        const handleYearChange = (selectedYears) => {
                if (!Array.isArray(selectedYears)) selectedYears = [selectedYears];

                if (selectedYears.length === 0) {
                        setDataYears([]);
                } else {
                        setDataYears(selectedYears);
                }

                setDataCategories([]);
                setDataSites([]);
                setData(dataYears, [], [], chart);
        };

        const handleCategoryChange = (selectedCategories) => {
                if (!Array.isArray(selectedCategories)) selectedCategories = [selectedCategories];

                if (selectedCategories.length === 0) {
                        setDataCategories([]);
                } else {
                        setDataCategories(selectedCategories);
                }

                setDataSites([]);
                setData(dataYears, selectedCategories, [], chart);
        };

        const handleSiteChange = (selectedSites) => {
                setRenderGraph(false);
                if (!Array.isArray(selectedSites)) selectedSites = [selectedSites];

                if (selectedSites.length === 0) {
                        setDataSites([]);
                } else {
                        setDataSites(selectedSites);
                }

                setData(dataYears, dataCategories, selectedSites, chart);
        };

        return (
                <div className="graph-filters">
                        <div className={`graph-filter`}>
                                <div className="gf-title">Chart</div>
                                <div className="gf-subtitle">Choose the layout style of the chart</div>
                                <Dropdown items={charts} onSelect={handleChartChange} label="Select Chart" align="left" />
                        </div>
                        <img className="gf-chevron" alt="arrow" src="right-icon.svg" />
                        <div className={`graph-filter ${chart ? '' : 'gf-disabled'}`}>
                                <div className="gf-title">Year{chart !== "Pie" ? "s" : ""}</div>
                                <div className="gf-subtitle">
                                        {chart !== "Pie" ? "Select the range of years for insights" : "Select the year for insights"}
                                </div>
                                {chart !== "Pie" && <MultiDropdown key={chart} items={years} changeSelection={handleYearChange} label="Years" align="left" type="filter" width="fit-content" scrollWidth="100px" disabled={!chart} />}
                                {chart === "Pie" && <Dropdown key={chart} items={years} onSelect={handleYearChange} label="Select Year" align="left" disabled={!chart} />}
                        </div>
                        <img className="gf-chevron" alt="arrow" src="right-icon.svg" />
                        <div className={`graph-filter ${dataYears.length > 0 ? '' : 'gf-disabled'}`}>
                                <div className="gf-title">Categor{chart === "Bar" ? "ies" : "y"}</div>
                                <div className="gf-subtitle">Choose the categor{chart === "Bar" ? "ies" : "y"} of the data</div>
                                {chart === "Bar" && <MultiDropdown key={dataYears.join("-")} items={categories} changeSelection={handleCategoryChange} label="Categories" align="left" type="filter" width="fit-content" scrollWidth="150px" disabled={dataYears.length === 0} />}
                                {chart !== "Bar" && <Dropdown key={dataYears.join("-")} items={categories} onSelect={handleCategoryChange} label={dataCategories.length > 0 ? dataCategories[0] : "Select Category"} size="large" align="left" disabled={dataYears.length === 0} />}
                        </div>
                        <img className="gf-chevron" alt="arrow" src="right-icon.svg" />
                        <div className={`graph-filter ${dataCategories.length > 0 ? '' : 'gf-disabled'}`}>
                                <div className="gf-title">Site{chart !== "Bar" ? "s" : ""}</div>
                                <div className="gf-subtitle">Select the site{chart !== "Bar" ? "s" : ""} relevant to the query</div>
                                {chart !== "Bar" && <MultiDropdown key={dataCategories.join("-")} items={sites} changeSelection={handleSiteChange} label="Sites" align="left" type="filter" width="fit-content" disabled={dataCategories.length === 0} />}
                                {chart === "Bar" && <Dropdown key={dataCategories.join("-")} items={sites} onSelect={handleSiteChange} label={dataSites.length > 0 ? dataSites[0] : "Select Site"} align="left" disabled={dataCategories.length === 0} />}
                        </div>
                </div>
        );
};

export default GraphFilters;