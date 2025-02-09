import React from 'react';
import FileUpload from './FileUpload';
import Dropdown from './Dropdown';

const UploadConfiguration = (props) => {
        return (
                <div className="upload-panel">
                        <div className="upload-title">Upload data</div>
                        <div className="panel-bar"></div>
                        <FileUpload setFile={props.setFile} />
                        <div className="upload-title upload-subtitle">Configuration</div>
                        <div className="panel-bar"></div>
                        <div className="upload-config-item">
                                <div className="upload-config-label">Year of data</div>
                                DROPDOWN_1
                        </div>
                        <div className="upload-config-item">
                                <div className="upload-config-label">Relevant sheet</div>
                                DROPDOWN_2
                        </div>
                </div>
        );
};

export default UploadConfiguration;