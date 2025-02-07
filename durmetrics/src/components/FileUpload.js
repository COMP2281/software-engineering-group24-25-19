import React, { useRef } from 'react';

const FileUpload = (props) => {
        const fileInputRef = useRef(null);

        const handleClick = () => {
                fileInputRef.current.click();
        };

        const handleFileChange = (event) => {
                const file = event.target.files[0];
                if (file) {
                        console.log('Selected file:', file.name);
                        props.setFile(file);
                }
        };

        return (
                <div className="file-upload-container">
                        <div className="file-upload-button" onClick={handleClick}>Select file</div>
                        <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept=".csv, .xls, .xlsx"
                                onChange={handleFileChange}
                        />
                </div>
        );
};

export default FileUpload;