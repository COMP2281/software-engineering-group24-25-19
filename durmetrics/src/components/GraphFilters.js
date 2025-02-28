import React, { useEffect, useState } from 'react';
import MultiDropdown from './MultiDropdown';
import Dropdown from './Dropdown';
import axios from "axios";
import { data } from 'react-router-dom';

const getSites = async () => {
        try {
                let result = await axios.get(`https://durmetrics-api.sglre6355.net/sites`);
                return result.data;
        } catch (error) {
                alert("[Error] Could not fetch sites.");
        }
};

const GraphFilters = ({ setData }) => {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => currentYear - i);
        const categories = ["Carbon Emissions", "Electricity", "Gas"];
        const types = ["Figures", "% Change", "% of Total"];
        const charts = ["Line", "Bar", "Pie"];
        const [sites, setSites] = useState([]);

        useEffect(() => {
                getSites().then(data => {
                        setSites(data.map(site => site.name));
                });
        }, []);

        const [chart, setChart] = useState(null);
        const [dataYears, setDataYears] = useState([]);
        const [category, setCategory] = useState(null);
        const [site, setSite] = useState(null);


        const handleChartChange = (selectedChart) => {
                setChart(selectedChart);
                setDataYears([]);
                setCategory(null);
                setSite(null);
        }

        const handleYearChange = (selectedYears) => {
                if (Array.isArray(selectedYears)) {
                        setDataYears(selectedYears);
                } else {
                        setDataYears([selectedYears]);
                }
                setCategory(null);
                setSite(null);
                console.log(dataYears)
        };

        const handleCategoryChange = (selectedCategory) => {
                setCategory(selectedCategory);
                setSite(null);
        };

        const handleSiteChange = (selectedSite) => {
                setSite(selectedSite);
                setData(dataYears, category, selectedSite, chart);
        };

        return (
                <div className="graph-filters">
                        <div className={`graph-filter`}>
                                <div className="gf-title">Chart</div>
                                <div className="gf-subtitle">Choose the layout style of the chart</div>
                                <Dropdown items={charts} onSelect={handleChartChange} label="Select Chart" align="left" />
                        </div>
                        <img className="gf-chevron" src="right-icon.svg" />
                        <div className={`graph-filter ${chart ? '' : 'gf-disabled'}`}>
                                <div className="gf-title">Year{chart != "Pie" ? "s" : ""}</div>
                                <div className="gf-subtitle">
                                        {chart != "Pie" ? "Select the range of years for insights" : "Select the year for insights"}
                                </div>
                                {chart != "Pie" && <MultiDropdown items={years} changeSelection={handleYearChange} label="Years" align="left" type="filter" width="fit-content" scrollWidth="100px" disabled={!chart} />}
                                {chart == "Pie" && <Dropdown items={years} onSelect={handleYearChange} label="Select Year" align="left" disabled={!chart} />}
                        </div>
                        <img className="gf-chevron" src="right-icon.svg" />
                        <div className={`graph-filter ${dataYears.length > 0 ? '' : 'gf-disabled'}`}>
                                <div className="gf-title">Categor{chart == "Bar" ? "ies" : "y"}</div>
                                <div className="gf-subtitle">Choose the categor{chart == "Bar" ? "ies" : "y"} of the data</div>
                                {chart == "Bar" && <MultiDropdown items={categories} changeSelection={handleCategoryChange} label="Categories" align="left" type="filter" width="fit-content" scrollWidth="150px" disabled={dataYears.length === 0} />}
                                {chart != "Bar" && <Dropdown key={dataYears.length > 0 ? 'category-enabled' : 'category-disabled'} items={categories} onSelect={handleCategoryChange} label={category ? category : "Select Category"} size="large" align="left" disabled={dataYears.length === 0} />}
                        </div>
                        <img className="gf-chevron" src="right-icon.svg" />
                        <div className={`graph-filter ${category ? '' : 'gf-disabled'}`}>
                                <div className="gf-title">Site{chart == "Pie" ? "s" : ""}</div>
                                <div className="gf-subtitle">Select the site{chart == "Pie" ? "s" : ""} relevant to the query</div>
                                {chart == "Pie" && <MultiDropdown items={sites} changeSelection={handleSiteChange} label="Sites" align="left" type="filter" width="fit-content" disabled={!category} />}
                                {chart != "Pie" && <Dropdown key={category ? 'site-enabled' : 'site-disabled'} items={sites} onSelect={handleSiteChange} label={site ? site : "Select Site"} align="left" disabled={!category} />}
                        </div>
                </div>
        );
};

export default GraphFilters;