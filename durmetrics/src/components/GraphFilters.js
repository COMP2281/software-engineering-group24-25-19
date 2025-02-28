import React, { useState } from 'react';
import MultiDropdown from './MultiDropdown';
import Dropdown from './Dropdown';

const GraphFilters = (props) => {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => currentYear - i);
        const categories = ["Carbon Emissions", "Electricity", "Gas", "Carbon (%)", "Gas Sites (%)", "Electricity (%)", "kwH per HDD", "Site Information"];
        const types = ["Figures", "% Change", "% of Total"];
        const charts = ["Line", "Bar", "Pie"];
        const [dataYears, setDataYears] = useState([]);
        const [category, setCategory] = useState(null);
        const [type, setType] = useState(null);
        const [chart, setChart] = useState(null);

        const handleYearChange = (selectedYears) => {
                setDataYears(selectedYears);
                setCategory(null);
                setType(null);
                setChart(null);
        };

        const handleCategoryChange = (selectedCategory) => {
                setCategory(selectedCategory);
                setType(null);
                setChart(null);
        };

        const handleTypeChange = (selectedType) => {
                setType(selectedType);
                setChart(null);
        };

        return (
                <div className="graph-filters">
                        <div className="graph-filter">
                                <div className="gf-title">Data year(s)</div>
                                <div className="gf-subtitle">Test description goes right here</div>
                                <MultiDropdown items={years} changeSelection={handleYearChange} label="Years" align="left" type="filter" width="120px" />
                        </div>
                        <img className="gf-chevron" src="right-icon.svg" />
                        <div className={`graph-filter ${dataYears.length > 0 ? '' : 'gf-disabled'}`}>
                                <div className="gf-title">Category</div>
                                <div className="gf-subtitle">Test description goes right here</div>
                                <Dropdown key={dataYears.length > 0 ? 'category-enabled' : 'category-disabled'} items={categories} onSelect={handleCategoryChange} label={category ? category : "Select Category"} size="large" align="left" disabled={dataYears.length === 0} />
                        </div>
                        <img className="gf-chevron" src="right-icon.svg" />
                        <div className={`graph-filter ${category ? '' : 'gf-disabled'}`}>
                                <div className="gf-title">Type</div>
                                <div className="gf-subtitle">Test description goes right here</div>
                                <Dropdown key={category ? 'type-enabled' : 'type-disabled'} items={types} onSelect={handleTypeChange} label={type ? type : "Select Type"} align="left" disabled={!category} />
                        </div>
                        <img className="gf-chevron" src="right-icon.svg" />
                        <div className={`graph-filter ${type ? '' : 'gf-disabled'}`}>
                                <div className="gf-title">Chart</div>
                                <div className="gf-subtitle">Test description goes right here</div>
                                <Dropdown key={type ? 'chart-enabled' : 'chart-disabled'} items={charts} onSelect={setChart} label={chart ? chart : "Select Chart"} align="left" disabled={!type} />
                        </div>
                </div>
        );
};

export default GraphFilters;