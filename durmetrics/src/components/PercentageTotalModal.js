import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Dropdown from './Dropdown';

// Modal styling for Material-UI
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

// Component for adding a new percentage total
const NewModal = ({ addPercentageTotal }) => {
        const [open, setOpen] = React.useState(false); // State to control modal visibility
        const [isValid, setIsValid] = React.useState(false); // State to validate the selection
        const [selectedYear, setSelectedYear] = useState(null); // State to store the selected year

        // Open the modal
        const handleOpen = () => {
                setOpen(true);
        };

        // Close the modal and reset the selected year
        const handleClose = () => {
                setSelectedYear(null);
                setOpen(false);
        };

        // Add the selected year to the percentage totals and close the modal
        const updatePercentageTotals = () => {
                if (isValid) {
                        addPercentageTotal(selectedYear);
                }
                handleClose();
        };

        // Handle year selection from the dropdown
        const handleYearTotal = (year) => {
                setSelectedYear(year);
        };

        // Validate the selection to enable or disable the "Add" button
        const validateSelection = () => {
                if (selectedYear) {
                        setIsValid(true);
                } else {
                        setIsValid(false);
                }
        };

        // Re-validate whenever the selected year changes
        /* eslint-disable react-hooks/exhaustive-deps */
        useEffect(() => {
                validateSelection();
        }, [selectedYear]);
        /* eslint-enable react-hooks/exhaustive-deps */

        // Generate a list of academic years starting from 2017 to the current year
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => {
                const start = 2017 + i;
                return `${start}-${(start + 1).toString().slice(-2)}`;
        }).reverse();

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
                                <Box sx={{ ...style, width: 290 }}>
                                        {/* Modal title */}
                                        <Typography id="modal-modal-title" variant="h6" component="h2" style={{ textAlign: 'center' }}>
                                                New Percentage Total
                                        </Typography>
                                        {/* Dropdown for selecting a year */}
                                        <div className="modal-dropdown-container" style={{ justifyContent: 'center' }}>
                                                <Dropdown items={years} width="95px" onSelect={handleYearTotal} />
                                        </div>
                                        {/* Add button, disabled if no valid selection */}
                                        <div className={`add-percentage-button ${isValid ? '' : 'disabled'}`} onClick={isValid ? updatePercentageTotals : null}>Add</div>
                                </Box>
                        </Modal>
                </>
        );
}

// Main component for managing percentage totals
const PercentageTotalModal = ({ percentageTotals, setPercentageTotals }) => {
        const [open, setOpen] = useState(false); // State to control modal visibility

        // Open the modal
        const handleOpen = () => setOpen(true);

        // Close the modal
        const handleClose = () => setOpen(false);

        // Add a new percentage total if it doesn't already exist
        const addPercentageTotal = (year) => {
                if (percentageTotals.includes(year)) return; // Prevent duplicates
                setPercentageTotals([...percentageTotals, year]);
        };

        // Remove a percentage total
        const removePercentageTotal = (year) => {
                setPercentageTotals(percentageTotals.filter(total => total !== year));
        };

        return (
                <>
                        {/* Button to open the modal */}
                        <div className="button-general percentage-button" onClick={handleOpen}>
                                <img className="percent-icon" alt="percent-total" src="percent.svg" />
                                Percentage Totals
                        </div>
                        <Modal
                                open={open}
                                onClose={handleClose}
                                aria-labelledby="modal-modal-title"
                                aria-describedby="modal-modal-description"
                                className="modal"
                        >
                                <Box sx={{ ...style, width: 440 }}>
                                        {/* Modal title */}
                                        <Typography id="modal-modal-title" variant="h6" component="h2">
                                                Show Percentage Totals
                                        </Typography>
                                        {/* Modal description */}
                                        <Typography id="modal-modal-description" sx={{ mt: 1, mb: 1.5 }}>
                                                Select the years you would like to show energy or emissions percentage totals for.
                                        </Typography>
                                        {/* List of added percentage totals */}
                                        <div className="percentage-changes">
                                                {!percentageTotals.length ? <div className="no-percentage-changes">No percentage totals added yet.</div> : (
                                                        percentageTotals.map((year, index) => (
                                                                <div key={index} className="percentage-change">
                                                                        {year}
                                                                        {/* Remove button for each year */}
                                                                        <img className="cross-icon" alt="cross" src="cross.svg" onClick={() => removePercentageTotal(year)} />
                                                                </div>
                                                        ))
                                                )}
                                        </div>
                                        {/* Modal buttons */}
                                        <div className="modal-buttons">
                                                {/* Button to add a new percentage total */}
                                                <NewModal addPercentageTotal={addPercentageTotal} />
                                                {/* Save button to close the modal */}
                                                <div className="button-general save-percentages-button" onClick={handleClose}>Save</div>
                                        </div>
                                </Box>
                        </Modal>
                </>
        );
};

export default PercentageTotalModal;