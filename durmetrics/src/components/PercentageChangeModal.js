import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Dropdown from './Dropdown';

const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
};

const NewModal = ({ addPercentageChange }) => {
        const [open, setOpen] = React.useState(false);
        const [isValid, setIsValid] = React.useState(false);

        const handleOpen = () => {
                setOpen(true);
        };

        const handleClose = () => {
                setSelectedYear1(null);
                setSelectedYear2(null);
                setOpen(false);
        };

        const updatePercentageChanges = () => {
                if (isValid) {
                        addPercentageChange(selectedYear1, selectedYear2);
                }
                handleClose();
        }

        const [selectedYear1, setSelectedYear1] = useState(null);
        const [selectedYear2, setSelectedYear2] = useState(null);

        const handleYear1Change = (year) => {
                setSelectedYear1(year);
                setAvailableYears2(years.slice(0, years.indexOf(year)));
        };

        const handleYear2Change = (year) => {
                setSelectedYear2(year);
        };

        const validateSelection = () => {
                if (selectedYear1 && selectedYear2) {
                        setIsValid(true);
                } else {
                        setIsValid(false);
                }
        };

        useEffect(() => {
                validateSelection();
        }, [selectedYear1, selectedYear2]);

        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => currentYear - i);

        const [availableYears1, setAvailableYears1] = React.useState(years.slice(1, years.length));
        const [availableYears2, setAvailableYears2] = React.useState(years.slice(0, years.length - 1));

        return (
                <>
                        <div className="button-general new-percentage-button" onClick={handleOpen}>Add New...</div>
                        <Modal
                                open={open}
                                onClose={handleClose}
                                aria-labelledby="child-modal-title"
                                aria-describedby="child-modal-description"
                                className="modal"
                        >
                                <Box sx={{ ...style, width: 290 }}>
                                        <Typography id="modal-modal-title" variant="h6" component="h2">
                                                New Percentage Change
                                        </Typography>
                                        <div className="modal-dropdown-container">
                                                <Dropdown items={availableYears1} width="80px" onSelect={handleYear1Change} />
                                                <div>{"to"}</div>
                                                <Dropdown items={availableYears2} width="80px" onSelect={handleYear2Change} disabled={!selectedYear1} />
                                        </div>
                                        <div className={`add-percentage-button ${isValid ? '' : 'disabled'}`} onClick={isValid ? updatePercentageChanges : null}>Add</div>
                                </Box>
                        </Modal>
                </>
        );
}

const PercentageChangeModal = ({ percentageChanges, setPercentageChanges }) => {
        const [open, setOpen] = useState(false);
        const handleOpen = () => setOpen(true);
        const handleClose = () => setOpen(false);

        const addPercentageChange = (year1, year2) => {
                if (percentageChanges.some(change => change.year1 === year1 && change.year2 === year2)) return;
                setPercentageChanges([...percentageChanges, { year1, year2 }]);
        };

        const removePercentageChange = (year1, year2) => {
                setPercentageChanges(percentageChanges.filter(change => !(change.year1 === year1 && change.year2 === year2)));
        };

        return (
                <>
                        <div className="button-general percentage-button percentage-change-button" onClick={handleOpen}>
                                <img className="percent-icon" src="change.svg" />
                                Percentage Changes
                        </div>
                        <Modal
                                open={open}
                                onClose={handleClose}
                                aria-labelledby="modal-modal-title"
                                aria-describedby="modal-modal-description"
                                className="modal"
                        >
                                <Box sx={{ ...style, width: 440 }}>
                                        <Typography id="modal-modal-title" variant="h6" component="h2">
                                                Show Percentage Changes
                                        </Typography>
                                        <Typography id="modal-modal-description" sx={{ mt: 1, mb: 1.5 }}>
                                                Select the years you want to compare to see the percentage changes.
                                        </Typography>
                                        <div className="percentage-changes">
                                                {!percentageChanges.length ? <div className="no-percentage-changes">No percentage changes added yet.</div> : (
                                                        percentageChanges.map((change, index) => (
                                                                <div key={index} className="percentage-change">
                                                                        {change.year1}-{change.year2}
                                                                        <img className="cross-icon" src="cross.svg" onClick={() => removePercentageChange(change.year1, change.year2)} />
                                                                </div>
                                                        ))
                                                )}
                                        </div>
                                        <div className="modal-buttons">
                                                <NewModal addPercentageChange={addPercentageChange} />
                                                <div className="button-general save-percentages-button" onClick={handleClose}>Save</div>
                                        </div>
                                </Box>
                        </Modal>
                </>
        );
};

export default PercentageChangeModal;