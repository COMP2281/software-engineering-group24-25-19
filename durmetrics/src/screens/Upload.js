import React, { useEffect, useState } from 'react';
import UploadConfiguration from '../components/UploadConfiguration';
import UploadPreview from '../components/UploadPreview';
import Papa from 'papaparse';
import EmissionFactorTable from '../components/EmissionFactorTable';
import EmissionFactorGraph from '../components/EmissionFactorGraph';
import EmissionFactorConfiguration from '../components/EmissionFactorConfiguration';
import axios from 'axios';

const Upload = (props) => {
        const [file, setFile] = useState(null);
        const [fileContentsJSON, setFileContentsJSON] = useState(null);
        const [dataYear, setDataYear] = useState(null);
        const [dataType, setDataType] = useState(null);
        const [stepsComplete, setStepsComplete] = useState(false);
        const [configKey, setConfigKey] = useState(0);

        const [emissionFactors, setEmissionFactors] = useState([]);

        const fetchEmissionFactors = async () => {
                try {
                        const res = await axios.get('https://durmetrics-api.sglre6355.net/emission-factors');
                        const data = res.data;
                        return data;
                } catch (error) {
                        console.error(error);
                        return [];
                }
        };

        const formatEmissionFactors = (data) => {
                let formattedData = [];
                data.forEach((row) => {
                        formattedData.push({
                                years: `${row.start_year}-${row.end_year.toString().slice(-2)}`,
                                electricity: parseFloat(parseFloat(row.electricity).toPrecision(3)),
                                gas: parseFloat(parseFloat(row.gas).toPrecision(3)),
                        });
                });
                return formattedData;
        };

        const updateEmissionFactors = async (years, electricity, gas) => {
                try {
                        const payload = {
                                start_year: parseInt(years.split('-')[0]),
                        };

                        if (!isNaN(parseFloat(electricity))) {
                                payload.electricity = parseFloat(electricity);
                        }

                        if (!isNaN(parseFloat(gas))) {
                                payload.gas = parseFloat(gas);
                        }

                        const res = await axios.post('https://durmetrics-api.sglre6355.net/emission-factors', payload);
                        if (res.status === 200 || res.status === 201) {
                                fetchEmissionFactors().then((data) => {
                                        const formatted = formatEmissionFactors(data);
                                        console.log(formatted);
                                        setEmissionFactors(formatted);
                                });
                        }
                } catch (error) {
                        console.error(error);
                }
        };

        const uploadData = async () => {
                try {
                        const formData = new FormData();
                        formData.append('data', JSON.stringify(fileContentsJSON));
                        formData.append('start_year', dataYear ? parseInt(dataYear.toString().split('-')[0]) : 2025);
                        formData.append('category', dataType.toLowerCase().replace(/\s+/g, "-"));

                        const res = await axios.post('https://durmetrics-api.sglre6355.net/upload', formData, {
                                headers: {
                                        'Content-Type': 'multipart/form-data',
                                },
                        });
                        alert("Data uploaded successfully.");

                        clearUploadInputs();
                        return res;
                } catch (error) {
                        console.error(error);
                        alert("Could not upload the data.");
                        return null;
                }
        };

        const clearUploadInputs = () => {
                setFile(null);
                setFileContentsJSON(null);
                setDataYear(null);
                setDataType(null);
                setStepsComplete(false);
                setConfigKey((prevKey) => prevKey + 1);
        };

        /* eslint-disable eqeqeq */
        useEffect(() => {
                if (props.activeTab == 1) {
                        fetchEmissionFactors().then((data) => {
                                const formatted = formatEmissionFactors(data);
                                setEmissionFactors(formatted);
                        });
                }
        }, [props.activeTab]);

        const parseFile = (file) => {
                if (!file) {
                        console.error("No file provided.");
                        return;
                }

                const allowedTypes = [
                        "text/csv",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ];

                const maxFileSizeMB = 8;

                if (!allowedTypes.includes(file.type)) {
                        console.error("Invalid file type. Please upload a CSV or Excel file.");
                        alert("Invalid file type. Please upload a CSV or Excel file.");
                        return;
                }

                if (file.size > maxFileSizeMB * 1024 * 1024) {
                        console.error(`File too large. Maximum allowed size is ${maxFileSizeMB}MB.`);
                        alert(`File too large. Maximum allowed size is ${maxFileSizeMB}MB.`);
                        return;
                }

                const transformHeader = (header) =>
                        header
                                .toLowerCase()
                                .replace(/\s+/g, "_")
                                .replace(/[()]/g, ""); // remove brackets

                const reader = new FileReader();
                reader.onload = async (event) => {
                        const fileData = event.target.result;

                        if (file.type === "text/csv") {
                                Papa.parse(fileData, {
                                        header: true,
                                        skipEmptyLines: true,
                                        complete: (results) => {
                                                let { data, meta } = results;

                                                // Basic validations
                                                if (!meta.fields || meta.fields.length === 0) {
                                                        console.error("CSV file has no headers.");
                                                        setFileContentsJSON(null);
                                                        alert("Could not process the data: CSV file has no headers.");
                                                        clearUploadInputs();
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
                                                        alert("Could not process the data: CSV file has inconsistent row lengths.");
                                                        clearUploadInputs();
                                                        return;
                                                }

                                                // Transform the original fields
                                                const transformedFields = meta.fields.map(transformHeader);

                                                const transformedData = data.map((row) => {
                                                        return transformedFields.reduce((acc, newKey, i) => {
                                                                const originalKey = meta.fields[i];
                                                                const val = row[originalKey];

                                                                // Attempt parseFloat
                                                                const maybeNumber = parseFloat(val);
                                                                // If parseFloat worked (and val isn’t ""), store numeric. Otherwise keep original
                                                                if (!isNaN(maybeNumber) && val !== "") {
                                                                        acc[newKey] = maybeNumber;
                                                                } else {
                                                                        acc[newKey] = val;
                                                                }
                                                                return acc;
                                                        }, {});
                                                });

                                                setFileContentsJSON(transformedData);
                                        },
                                });
                        } else if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                                const { read, utils } = await import("xlsx");
                                const data = new Uint8Array(fileData);
                                const workbook = read(data, { type: "array" });
                                const sheetName = workbook.SheetNames[0];
                                const sheet = workbook.Sheets[sheetName];

                                // Skip the first two rows when converting to JSON:
                                const json = utils.sheet_to_json(sheet, { range: 2 });

                                if (json.length === 0) {
                                        console.error("Excel file is empty.");
                                        alert("Could not process the data: Excel file is empty.");
                                        clearUploadInputs();
                                        return;
                                }

                                // Original headers
                                const headers = Object.keys(json[0]);
                                // We ignore the last row in the loop below, so check everything except the last row
                                const isValidExcel = json.slice(0, -1).every((row, index) => {
                                        const rowKeys = Object.keys(row);
                                        if (rowKeys.length !== headers.length) {
                                                console.error(`Row ${index + 1} has missing or extra columns.`);
                                                return false;
                                        }
                                        return true;
                                });

                                if (!isValidExcel) {
                                        console.error("Excel file has inconsistent row structures.");
                                        alert("Could not process the data: Excel file has inconsistent row lengths.");
                                        clearUploadInputs();
                                        return;
                                }

                                // Transform the headers
                                const transformedHeaders = headers.map(transformHeader);

                                const rowsToTransform = json.length > 1 ? json.slice(0, -1) : json;

                                const transformedData = rowsToTransform.map((row) => {
                                        return transformedHeaders.reduce((acc, newKey, i) => {
                                                const originalKey = headers[i];
                                                acc[newKey] = row[originalKey];
                                                return acc;
                                        }, {});
                                });

                                setFileContentsJSON(transformedData);
                        }
                };

                if (file.type === "text/csv") {
                        reader.readAsText(file);
                } else {
                        reader.readAsArrayBuffer(file);
                }
        };

        /* eslint-disable react-hooks/exhaustive-deps */
        useEffect(() => {
                if (file) {
                        parseFile(file);
                }
        }, [file]);
        /* eslint-enable react-hooks/exhaustive-deps */

        useEffect(() => {
                if (fileContentsJSON && (dataType === 'Site Information' || dataType === 'HDD' || dataYear) && dataType) {
                        setStepsComplete(true);
                } else {
                        setStepsComplete(false);
                }
        }, [fileContentsJSON, dataYear, dataType])

        useEffect(() => {
                document.title = 'Upload - DurMetrics';
        }, []);

        return (
                <div className={`upload-content ${props.activeTab == 1 ? "ef-content" : ""}`}>
                        {props.activeTab == 0 ?
                                <>
                                        <UploadConfiguration
                                                key={configKey}
                                                file={file}
                                                setFile={setFile}
                                                setDataYear={setDataYear}
                                                setDataType={setDataType}
                                                stepsComplete={stepsComplete}
                                                uploadData={uploadData}
                                        />
                                        <UploadPreview file={file} />
                                </>
                                :
                                <>
                                        <EmissionFactorTable emissionFactors={emissionFactors} />
                                        <EmissionFactorConfiguration updateEmissionFactors={updateEmissionFactors} />
                                        <EmissionFactorGraph emissionFactors={emissionFactors} />
                                </>
                        }
                </div>
        );
        /* eslint-enable eqeqeq */
};

export default Upload;