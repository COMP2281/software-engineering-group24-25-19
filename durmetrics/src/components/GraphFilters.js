import React from 'react';

const GraphFilters = (props) => {

        return (
                <div className="graph-filters">
                        <div className="graph-filter">
                                <div className="gf-title">Data year(s)</div>
                                <div className="gf-subtitle">Test description goes right here</div>
                                <div className="gf-select">Select</div>
                        </div>
                        <img className="gf-chevron" src="right-icon.svg" />
                        <div className="graph-filter gf-disabled">
                                <div className="gf-title">Category</div>
                                <div className="gf-subtitle">Test description goes right here</div>
                                <div className="gf-select">Select</div>
                        </div>
                        <img className="gf-chevron" src="right-icon.svg" />
                        <div className="graph-filter gf-disabled">
                                <div className="gf-title">Type</div>
                                <div className="gf-subtitle">Test description goes right here</div>
                                <div className="gf-select">Select</div>
                        </div>
                        <img className="gf-chevron" src="right-icon.svg" />
                        <div className="graph-filter gf-disabled">
                                <div className="gf-title">Chart</div>
                                <div className="gf-subtitle">Test description goes right here</div>
                                <div className="gf-select">Select</div>
                        </div>
                </div>
        );
};

export default GraphFilters;