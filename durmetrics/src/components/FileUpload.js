import React, { useRef, useState } from 'react';

const FileUpload = (props) => {
        const fileInputRef = useRef(null);
        const fileNameRef = useRef(null);
        const [isDragActive, setIsDragActive] = useState(false);

        // Define allowed file extensions
        const allowedExtensions = ['csv', 'xls', 'xlsx'];

        // Validate the file based on its extension
        const isValidFile = (file) => {
                const fileName = file.name;
                const fileExtension = fileName.split('.').pop().toLowerCase();
                return allowedExtensions.includes(fileExtension);
        };

        const handleClick = () => {
                fileInputRef.current.click();
        };

        const handleFileChange = (event) => {
                const file = event.target.files[0];
                if (file) {
                        if (!isValidFile(file)) {
                                alert('Invalid file type. Please upload a CSV, XLS, or XLSX file.');
                                // Optionally, clear the file input
                                event.target.value = null;
                                return;
                        }
                        console.log('Selected file:', file.name);
                        props.setFile(file);
                        fileNameRef.current.innerHTML = `<img src="green-tick.svg" class="selected-tick"> Selected <b>${file.name}</b>`;
                        fileNameRef.current.style.visibility = 'visible';
                }
        };

        // Handle drag events to update UI and prevent default behaviors
        const handleDragOver = (event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsDragActive(true);
        };

        const handleDragEnter = (event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsDragActive(true);
        };

        const handleDragLeave = (event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsDragActive(false);
        };

        const handleDrop = (event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsDragActive(false);
                const file = event.dataTransfer.files[0];
                if (file) {
                        if (!isValidFile(file)) {
                                alert('Invalid file type. Please upload a CSV, XLS, or XLSX file.');
                                return;
                        }
                        console.log('Dropped file:', file.name);
                        props.setFile(file);
                        fileNameRef.current.innerHTML = `<img src="green-tick.svg" class="selected-tick"> Selected <b>${file.name}</b>`;
                        fileNameRef.current.style.visibility = 'visible';
                }
        };

        return (
                <div
                        className={`file-upload-container ${isDragActive ? 'drag-active' : ''}`}
                        onClick={handleClick}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                >
                        <div className="file-upload-button">
                                Select file
                        </div>
                        <div className="file-upload-text">
                                Or drag and drop a file
                        </div>
                        <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept=".csv, .xls, .xlsx"
                                onChange={handleFileChange}
                        />
                        <div className="file-upload-name" ref={fileNameRef}>
                                file_name
                        </div>
                </div>
        );
};

export default FileUpload;
