import React, { useRef, useState } from 'react';

const FileUpload = (props) => {
        const fileInputRef = useRef(null);
        const fileNameRef = useRef(null);

        const handleClick = () => {
                fileInputRef.current.click();
        };

        const handleFileChange = (event) => {
                const file = event.target.files[0];
                if (file) {
                        console.log('Selected file:', file.name);
                        props.setFile(file);
                        fileNameRef.current.innerHTML = `<img src="green-tick.svg" class="selected-tick"> Selected <b>${file.name}</b>`;
                        fileNameRef.current.style.visibility = 'visible';
                }
        };

        return (
                <div className="file-upload-container">
                        <div className="file-upload-button" onClick={handleClick}>
                                Select file
                        </div>
                        <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept=".csv, .xls, .xlsx"
                                onChange={handleFileChange}
                        />
                        <div className="file-upload-name" ref={fileNameRef}>file_name</div>
                </div>
        );
};

export default FileUpload;