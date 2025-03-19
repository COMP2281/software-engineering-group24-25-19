import React, { useEffect, useState } from 'react';
import Dropdown from './Dropdown';

const EmissionFactorConfiguration = (props) => {
        const [emissionFactorYears, setEmissionFactorYears] = useState("");
        const [electricity, setElectricity] = useState("");
        const [gas, setGas] = useState("");
        const [dropdownKey, setDropdownKey] = useState(0);
        const [stepsComplete, setStepsComplete] = useState(false);

        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => {
                const start = 2017 + i;
                return `${start}-${(start + 1).toString().slice(-2)}`;
        });

        useEffect(() => {
                const checkStepsComplete = () => {
                        if (
                                !emissionFactorYears ||
                                (electricity !== "" && isNaN(electricity)) ||
                                (gas !== "" && isNaN(gas))
                        ) {
                                setStepsComplete(false);
                        } else {
                                setStepsComplete(true);
                        }
                };

                checkStepsComplete();
        }, [emissionFactorYears, electricity, gas]);

        const clearAllInputs = () => {
                setEmissionFactorYears("");
                setElectricity("");
                setGas("");
                // Update the key to force remount of Dropdown
                setDropdownKey(prevKey => prevKey + 1);
        };

        return (
                <div className="upload-panel ef-config-container">
                        <div className="upload-title">Upload Emission Factor Data</div>
                        <div className="panel-bar" />
                        <div className="ef-info">
                                Emission factors affect data in the Carbon Emissions sheet on the Tables page.
                        </div>
                        <div className="upload-config-item">
                                <div className="upload-config-label">Select Data Year</div>
                                <Dropdown
                                        key={dropdownKey}
                                        items={years}
                                        onSelect={setEmissionFactorYears}
                                        label="Choose Year"
                                        selectedValue={emissionFactorYears}
                                />
                        </div>
                        <div className="upload-config-item">
                                <div className="upload-config-label upload-config-label-group">
                                        <span>Electricity</span>
                                        <span className="upload-config-sublabel">Leave empty to delete</span>
                                </div>
                                <input
                                        type="text"
                                        className="upload-config-input"
                                        name="electricity"
                                        placeholder="0.000000"
                                        value={electricity}
                                        onChange={(e) => setElectricity(e.target.value)}
                                />
                        </div>
                        <div className="upload-config-item">
                                <div className="upload-config-label upload-config-label-group">
                                        <span>Gas</span>
                                        <span className="upload-config-sublabel">Leave empty to delete</span>
                                </div>
                                <input
                                        type="text"
                                        className="upload-config-input"
                                        name="gas"
                                        placeholder="0.000000"
                                        value={gas}
                                        onChange={(e) => setGas(e.target.value)}
                                />
                        </div>
                        <div className="upload-warning">
                                <div className="upload-warning-header">
                                        <img src="warning-icon.svg" className="upload-warning-icon" alt="Warning Icon" />
                                        Warning
                                </div>
                                Updating emission factors will overwrite any previous data with the same configurations.
                        </div>
                        <div
                                className={`upload-button ${!stepsComplete ? 'upload-button-disabled' : ''}`}
                                onClick={() => {
                                        if (!stepsComplete) return;
                                        props.updateEmissionFactors(emissionFactorYears, electricity, gas);
                                        clearAllInputs();
                                }}
                        >
                                Update Emission Factors
                        </div>
                </div>
        );
};

export default EmissionFactorConfiguration;
