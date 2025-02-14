import React from 'react';
import FileUpload from './FileUpload';
import Dropdown from './Dropdown';

const UploadConfiguration = (props) => {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => currentYear - i);
        const sheets = [
                "Carbon Emissions",
                "Electricity",
                "Gas",
                "Carbon (%)",
                "Gas Sites (%)",
                "Electricity (%)",
                "kwH per HDD",
                "Site Information"
        ];

        return (
                <div className="upload-panel">
                        <div className="upload-title">Upload data</div>
                        <div className="panel-bar"></div>
                        <FileUpload setFile={props.setFile} />
                        <div className="upload-title upload-subtitle">Configuration</div>
                        <div className="panel-bar"></div>
                        <div className="upload-config-item">
                                <div className="upload-config-label">Year of data</div>
                                <Dropdown items={years} onSelect={props.setDataYear} label="Select Year" />
                        </div>
                        <div className="upload-config-item">
                                <div className="upload-config-label">Relevant sheet</div>
                                <Dropdown items={sheets} onSelect={props.setDataType} label="Select Sheet" size="large" />
                        </div>
                        <div className="upload-warning">
                                <div className="upload-warning-header">
                                        <img src="warning-icon.svg" className="upload-warning-icon" />
                                        Warning
                                </div>
                                Uploading data will overwrite any previous data with the same configurations.
                        </div>
                        <div className={`upload-button ${!props.stepsComplete ? 'upload-button-disabled' : ''}`}>
                                Upload data
                        </div>
                </div>
        );
};

export default UploadConfiguration;