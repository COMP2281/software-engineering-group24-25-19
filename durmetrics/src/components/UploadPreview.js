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
                                Data Preview
                        </div>
                        <div className="panel-bar"></div>
                        {props.file && <>
                                <span class="upload-preview-name">
                                        <img class="upload-preview-file" src="file-icon.svg" />
                                        {props.file.name}
                                </span>
                                <div className={`upload-preview ${props.file.type != "text/csv" ? "upload-preview-disallowed" : ""}`}>
                                        <pre>{props.file.type == "text/csv" ? fileContent :
                                                <div className="upload-preview-image-container">
                                                        <img class="upload-preview-image" src="no-preview.svg" />
                                                        <span class="upload-preview-image-text">Preview not available for this file type</span>
                                                </div>
                                        }</pre>
                                </div>
                        </>}
                </div>
        );
};

export default UploadPreview;