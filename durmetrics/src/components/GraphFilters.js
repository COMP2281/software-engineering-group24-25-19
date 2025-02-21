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

        return (
                <div className="graph-filters">
                        <div className="graph-filter">
                                <div className="gf-title">Data year(s)</div>
                                <div className="gf-subtitle">Test description goes right here</div>
                                <MultiDropdown items={years} changeSelection={setDataYears} label="Years" align="left" type="filter" width="120px" />
                        </div>
                        <img className="gf-chevron" src="right-icon.svg" />
                        <div className="graph-filter gf-disabled">
                                <div className="gf-title">Category</div>
                                <div className="gf-subtitle">Test description goes right here</div>
                                <Dropdown items={categories} onSelect={setCategory} label="Select Category" size="large" align="left" />
                        </div>
                        <img className="gf-chevron" src="right-icon.svg" />
                        <div className="graph-filter gf-disabled">
                                <div className="gf-title">Type</div>
                                <div className="gf-subtitle">Test description goes right here</div>
                                <Dropdown items={types} onSelect={setType} label="Select Type" align="left" />
                        </div>
                        <img className="gf-chevron" src="right-icon.svg" />
                        <div className="graph-filter gf-disabled">
                                <div className="gf-title">Chart</div>
                                <div className="gf-subtitle">Test description goes right here</div>
                                <Dropdown items={charts} onSelect={setChart} label="Select Chart" align="left" />
                        </div>
                </div>
        );
};

export default GraphFilters;