import React, { useState } from 'react';
import FileUpload from './FileUpload';
import Dropdown from './Dropdown';

const UploadConfiguration = (props) => {
        const [requiresYear, setRequiresYear] = useState(false);
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => {
                const start = 2017 + i;
                return `${start}-${(start + 1).toString().slice(-2)}`;
        });
        const sheets = [
                "Site Information",
                "Electricity",
                "Gas",
                "HDD",
        ];

        const handleCategorySelect = (category) => {
                if (category === "Electricity" || category === "Gas") {
                        setRequiresYear(true);
                } else {
                        setRequiresYear(false);
                }

                props.setDataType(category);
        };

        return (
                <div className="upload-panel">
                        <div className="upload-title">Upload Data</div>
                        <div className="panel-bar"></div>
                        <FileUpload file={props.file} setFile={props.setFile} />
                        <div className="upload-title upload-subtitle">Configuration</div>
                        <div className="panel-bar"></div>
                        <div className="upload-config-item">
                                <div className="upload-config-label">Data category</div>
                                <Dropdown items={sheets} onSelect={handleCategorySelect} label="Select" />
                        </div>
                        {requiresYear &&
                                <div className="upload-config-item">
                                        <div className="upload-config-label">Year of data</div>
                                        <Dropdown items={years} onSelect={props.setDataYear} label="Select Year" />
                                </div>
                        }
                        <div className="upload-warning">
                                <div className="upload-warning-header">
                                        <img src="warning-icon.svg" alt="warning" className="upload-warning-icon" />
                                        Warning
                                </div>
                                Uploading data will overwrite any previous data with the same configurations.
                        </div>
                        <div className={`upload-button ${!props.stepsComplete ? 'upload-button-disabled' : ''}`} onClick={props.uploadData}>
                                Upload Data
                        </div>
                </div>
        );
};

export default UploadConfiguration;