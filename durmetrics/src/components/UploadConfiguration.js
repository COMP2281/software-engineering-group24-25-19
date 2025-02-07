import React from 'react';
import FileUpload from './FileUpload';

const UploadConfiguration = (props) => {
        return (
                <div className="upload-panel">
                        <div className="upload-title">Upload data</div>
                        <div className="panel-bar"></div>
                        <FileUpload setFile={props.setFile} />
                </div>
        );
};

export default UploadConfiguration;