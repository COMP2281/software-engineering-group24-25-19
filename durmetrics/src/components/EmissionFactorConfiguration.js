import React, { useState } from 'react';
import Dropdown from './Dropdown';

const EmissionFactorConfiguration = (props) => {
        const [stepsComplete, setStepsComplete] = useState(false);

        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => {
                const start = 2017 + i;
                return `${start}-${(start + 1).toString().slice(-2)}`;
        });

        return (
                <div className="upload-panel ef-config-container">
                        <div className="upload-title">Upload Emission Factor Data</div>
                        <div className="panel-bar" />
                        <div className="ef-info">
                                Emission factors affect data in the kWh per HDD sheet on the Tables page.
                        </div>
                        <div className="upload-config-item">
                                <div className="upload-config-label">Select Data Year</div>
                                <Dropdown items={years} onSelect={props.setDataYear} label="Choose Year" />
                        </div>
                        <div className="upload-config-item">
                                <div className="upload-config-label upload-config-label-group">
                                        <span>Electricity</span>
                                        <span className="upload-config-sublabel">Leave empty if unchanged</span>
                                </div>
                                <input type="text" className="upload-config-input" name="electricity" placeholder="0.000000" />
                        </div>
                        <div className="upload-config-item">
                                <div className="upload-config-label upload-config-label-group">
                                        <span>Gas</span>
                                        <span className="upload-config-sublabel">Leave empty if unchanged</span>
                                </div>
                                <input type="text" className="upload-config-input" name="gas" placeholder="0.000000" />
                        </div>
                        <div className="upload-warning">
                                <div className="upload-warning-header">
                                        <img src="warning-icon.svg" className="upload-warning-icon" />
                                        Warning
                                </div>
                                Updating emission factors will overwrite any previous data with the same configurations.
                        </div>
                        <div className={`upload-button ${!props.stepsComplete ? 'upload-button-disabled' : ''}`}>
                                Update Emission Factors
                        </div>
                </div>
        );
};

export default EmissionFactorConfiguration;