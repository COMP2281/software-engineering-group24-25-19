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
                        if (res.status == 200 || res.status == 201) {
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

                const maxFileSizeMB = 3;

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
                                                        alert("Could not process the data: TCSV file has no headers.");
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
                                                        setFile(null);
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
                                const json = utils.sheet_to_json(sheet, { range: 2 }); // Skip the first two rows

                                if (json.length === 0) {
                                        console.error("Excel file is empty.");
                                        alert("Could not process the data: Excel file is empty.");
                                        setFileContentsJSON(null);
                                        return;
                                }

                                const headers = Object.keys(json[0]);
                                const isValidExcel = json.slice(0, -1).every((row, index) => { // Ignore the last row
                                        const rowKeys = Object.keys(row);
                                        if (rowKeys.length !== headers.length) {
                                                console.error(`Row ${index + 1} has missing or extra columns.`);
                                                return false;
                                        }
                                        return true;
                                });

                                console.log(json)

                                if (!isValidExcel) {
                                        console.error("Excel file has inconsistent row structures.");
                                        alert("Could not process the data: Excel file has inconsistent row lengths.");
                                        setFileContentsJSON(null);
                                        return;
                                }

                                setFileContentsJSON(json.slice(0, -1)); // Ignore the last row
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
                console.log(fileContentsJSON);
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
                <div className={`upload-content ${props.activeTab == 1 ? "ef-content" : ""}`}>
                        {props.activeTab == 0 ?
                                <>
                                        <UploadConfiguration file={file} setFile={setFile} setDataYear={setDataYear} setDataType={setDataType} stepsComplete={stepsComplete} />
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
};

export default Upload;