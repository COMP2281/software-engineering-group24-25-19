import React, { useEffect, useState } from 'react';
import UploadConfiguration from '../components/UploadConfiguration';
import UploadPreview from '../components/UploadPreview';
import Papa from 'papaparse';

const Upload = (props) => {
        const [file, setFile] = useState(null);
        const [fileContentsJSON, setFileContentsJSON] = useState(null);
        const [dataYear, setDataYear] = useState(null);
        const [dataType, setDataType] = useState(null);
        const [stepsComplete, setStepsComplete] = useState(false);

        const parseFile = (file) => {
                if (!file) {
                        console.error("No file provided.");
                        return;
                }

                const allowedTypes = [
                        "text/csv",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ];

                const maxFileSizeMB = 3;

                if (!allowedTypes.includes(file.type)) {
                        console.error("Invalid file type. Please upload a CSV or Excel file.");
                        return;
                }

                if (file.size > maxFileSizeMB * 1024 * 1024) {
                        console.error(`File too large. Maximum allowed size is ${maxFileSizeMB}MB.`);
                        return;
                }

                const reader = new FileReader();
                reader.onload = async (event) => {
                        const fileData = event.target.result;

                        if (file.type === "text/csv") {
                                Papa.parse(fileData, {
                                        header: true,
                                        skipEmptyLines: true,
                                        complete: (results) => {
                                                const { data, meta } = results;

                                                if (!meta.fields || meta.fields.length === 0) {
                                                        console.error("CSV file has no headers.");
                                                        setFileContentsJSON(null);
                                                        return;
                                                }


                                                const isValidCSV = data.every((row, index) => {
                                                        const rowKeys = Object.keys(row);
                                                        if (rowKeys.length !== meta.fields.length) {
                                                                console.error(`Row ${index + 1} has incorrect column count.`);
                                                                return false;
                                                        }
                                                        return true;
                                                });

                                                if (!isValidCSV) {
                                                        console.error("CSV file has inconsistent row lengths.");
                                                        setFileContentsJSON(null);
                                                        return;
                                                }

                                                setFileContentsJSON(data);
                                        },
                                });
                        } else if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                                const { read, utils } = await import("xlsx");
                                const data = new Uint8Array(fileData);
                                const workbook = read(data, { type: "array" });
                                const sheetName = workbook.SheetNames[0];
                                const sheet = workbook.Sheets[sheetName];
                                const json = utils.sheet_to_json(sheet);

                                if (json.length === 0) {
                                        console.error("Excel file is empty.");
                                        setFileContentsJSON(null);
                                        return;
                                }

                                const headers = Object.keys(json[0]);
                                const isValidExcel = json.every((row, index) => {
                                        const rowKeys = Object.keys(row);
                                        if (rowKeys.length !== headers.length) {
                                                console.error(`Row ${index + 1} has missing or extra columns.`);
                                                return false;
                                        }
                                        return true;
                                });

                                if (!isValidExcel) {
                                        console.error("Excel file has inconsistent row structures.");
                                        setFileContentsJSON(null);
                                        return;
                                }

                                setFileContentsJSON(json);
                        }
                };

                if (file.type === "text/csv") {
                        reader.readAsText(file);
                } else {
                        reader.readAsArrayBuffer(file);
                }
        };

        useEffect(() => {
                if (file) {
                        parseFile(file);
                }
        }, [file]);

        useEffect(() => {
                if (fileContentsJSON && dataYear && dataType) {
                        setStepsComplete(true);
                } else {
                        setStepsComplete(false);
                }
        }, [fileContentsJSON, dataYear, dataType])

        useEffect(() => {
                document.title = 'Upload - DurMetrics';
        }, []);

        return (
                <div className="upload-content">
                        <UploadConfiguration setFile={setFile} setDataYear={setDataYear} setDataType={setDataType} stepsComplete={stepsComplete} />
                        <UploadPreview file={file} />
                </div>
        );
};

export default Upload;