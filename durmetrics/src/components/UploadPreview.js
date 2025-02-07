import React from 'react';
import { useState, useEffect } from 'react';

const UploadPreview = (props) => {
        const [fileContent, setFileContent] = useState('');

        useEffect(() => {
                if (props.file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                                setFileContent(e.target.result);
                        };
                        reader.readAsText(props.file);
                }
        }, [props.file]);

        return (
                <div className="upload-panel">
                        <div className="upload-title">
                                Data preview
                        </div>
                        <div className="panel-bar"></div>
                        {props.file && <>
                                <span class="upload-preview-name">
                                        <img class="upload-preview-file" src="file-icon.svg" />
                                        {props.file.name}
                                </span>
                                <div className="upload-preview">
                                        <pre>{props.file.type == "text/csv" ? fileContent : "Preview of XLSX files not supported."}</pre>
                                </div>
                        </>}
                </div>
        );
};

export default UploadPreview;