import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Dropdown from './Dropdown';

// Modal styling
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

// Component for adding a new percentage change
const NewModal = ({ addPercentageChange }) => {
        const [open, setOpen] = React.useState(false); // State to control modal visibility
        const [isValid, setIsValid] = React.useState(false); // State to validate the selection

        // Open the modal
        const handleOpen = () => {
                setOpen(true);
        };

        // Close the modal and reset selections
        const handleClose = () => {
                setSelectedYear1(null);
                setSelectedYear2(null);
                setOpen(false);
        };

        // Add the percentage change if the selection is valid
        const updatePercentageChanges = () => {
                if (isValid) {
                        addPercentageChange(selectedYear1, selectedYear2);
                }
                handleClose();
        };

        const [selectedYear1, setSelectedYear1] = useState(null); // Selected year 1
        const [selectedYear2, setSelectedYear2] = useState(null); // Selected year 2

        // Handle selection of year 1 and update available years for year 2
        const handleYear1Change = (year) => {
                setSelectedYear1(year);
                setAvailableYears2(years.slice(0, years.indexOf(year)));
        };

        // Handle selection of year 2
        const handleYear2Change = (year) => {
                setSelectedYear2(year);
        };

        // Validate the selection of both years
        const validateSelection = () => {
                if (selectedYear1 && selectedYear2) {
                        setIsValid(true);
                } else {
                        setIsValid(false);
                }
        };

        // Revalidate whenever selectedYear1 or selectedYear2 changes
        /* eslint-disable react-hooks/exhaustive-deps */
        useEffect(() => {
                validateSelection();
        }, [selectedYear1, selectedYear2]);
        /* eslint-enable react-hooks/exhaustive-deps */

        // Generate a list of academic years from 2017 to the current year
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => {
                const start = 2017 + i;
                return `${start}-${(start + 1).toString().slice(-2)}`;
        }).reverse();

        // Available years for the dropdowns
        const availableYears1 = years.slice(1, years.length); // Exclude the most recent year for year 1
        const [availableYears2, setAvailableYears2] = React.useState(years.slice(0, years.length - 1)); // Exclude the earliest year for year 2

        return (
                <>
                        {/* Button to open the modal */}
                        <div className="button-general new-percentage-button" onClick={handleOpen}>Add New...</div>
                        <Modal
                                open={open}
                                onClose={handleClose}
                                aria-labelledby="child-modal-title"
                                aria-describedby="child-modal-description"
                                className="modal"
                        >
                                <Box sx={{ ...style, width: 300 }}>
                                        <Typography id="modal-modal-title" variant="h6" component="h2">
                                                New Percentage Change
                                        </Typography>
                                        <div className="modal-dropdown-container">
                                                {/* Dropdown for selecting year 1 */}
                                                <Dropdown items={availableYears1} width="95px" onSelect={handleYear1Change} />
                                                <div>{"to"}</div>
                                                {/* Dropdown for selecting year 2 */}
                                                <Dropdown items={availableYears2} width="95px" onSelect={handleYear2Change} disabled={!selectedYear1} />
                                        </div>
                                        {/* Button to add the percentage change */}
                                        <div className={`add-percentage-button ${isValid ? '' : 'disabled'}`} onClick={isValid ? updatePercentageChanges : null}>Add</div>
                                </Box>
                        </Modal>
                </>
        );
}

// Main component for managing percentage changes
const PercentageChangeModal = ({ percentageChanges, setPercentageChanges }) => {
        const [open, setOpen] = useState(false); // State to control modal visibility

        // Open the modal
        const handleOpen = () => setOpen(true);

        // Close the modal
        const handleClose = () => setOpen(false);

        // Add a new percentage change if it doesn't already exist
        const addPercentageChange = (year1, year2) => {
                if (percentageChanges.some(change => change.year1 === year1 && change.year2 === year2)) return;
                setPercentageChanges([...percentageChanges, { year1, year2 }]);
        };

        // Remove an existing percentage change
        const removePercentageChange = (year1, year2) => {
                setPercentageChanges(percentageChanges.filter(change => !(change.year1 === year1 && change.year2 === year2)));
        };

        return (
                <>
                        {/* Button to open the modal */}
                        <div className="button-general percentage-button percentage-change-button" onClick={handleOpen}>
                                <img className="percent-icon" alt="percent-change" src="change.svg" />
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
                                                {/* Display the list of percentage changes */}
                                                {!percentageChanges.length ? <div className="no-percentage-changes">No percentage changes added yet.</div> : (
                                                        percentageChanges.map((change, index) => (
                                                                <div key={index} className="percentage-change">
                                                                        {change.year1.slice(2)}{" -> "}{change.year2.slice(2)}
                                                                        {/* Button to remove a percentage change */}
                                                                        <img className="cross-icon" alt="cross" src="cross.svg" onClick={() => removePercentageChange(change.year1, change.year2)} />
                                                                </div>
                                                        ))
                                                )}
                                        </div>
                                        <div className="modal-buttons">
                                                {/* Include the NewModal component for adding new changes */}
                                                <NewModal addPercentageChange={addPercentageChange} />
                                                {/* Button to save and close the modal */}
                                                <div className="button-general save-percentages-button" onClick={handleClose}>Save</div>
                                        </div>
                                </Box>
                        </Modal>
                </>
        );
};

export default PercentageChangeModal;