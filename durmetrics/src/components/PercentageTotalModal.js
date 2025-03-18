import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
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

const NewModal = ({ addPercentageTotal }) => {
        const [open, setOpen] = React.useState(false);
        const [isValid, setIsValid] = React.useState(false);

        const handleOpen = () => {
                setOpen(true);
        };

        const handleClose = () => {
                setSelectedYear(null);
                setOpen(false);
        };

        const updatePercentageTotals = () => {
                if (isValid) {
                        addPercentageTotal(selectedYear);
                }
                handleClose();
        }

        const [selectedYear, setSelectedYear] = useState(null);

        const handleYearTotal = (year) => {
                setSelectedYear(year);
        };

        const validateSelection = () => {
                if (selectedYear) {
                        setIsValid(true);
                } else {
                        setIsValid(false);
                }
        };

        /* eslint-disable react-hooks/exhaustive-deps */
        useEffect(() => {
                validateSelection();
        }, [selectedYear]);
        /* eslint-enable react-hooks/exhaustive-deps */

        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => {
                const start = 2017 + i;
                return `${start}-${(start + 1).toString().slice(-2)}`;
        }).reverse();

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
                                        <Typography id="modal-modal-title" variant="h6" component="h2" style={{ textAlign: 'center' }}>
                                                New Percentage Total
                                        </Typography>
                                        <div className="modal-dropdown-container" style={{ justifyContent: 'center' }}>
                                                <Dropdown items={years} width="95px" onSelect={handleYearTotal} />
                                        </div>
                                        <div className={`add-percentage-button ${isValid ? '' : 'disabled'}`} onClick={isValid ? updatePercentageTotals : null}>Add</div>
                                </Box>
                        </Modal>
                </>
        );
}

const PercentageTotalModal = ({ percentageTotals, setPercentageTotals }) => {
        const [open, setOpen] = useState(false);
        const handleOpen = () => setOpen(true);
        const handleClose = () => setOpen(false);

        const addPercentageTotal = (year) => {
                if (percentageTotals.includes(year)) return;
                setPercentageTotals([...percentageTotals, year]);
        }

        const removePercentageTotal = (year) => {
                setPercentageTotals(percentageTotals.filter(total => total !== year));
        }

        return (
                <>
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
                                        <Typography id="modal-modal-title" variant="h6" component="h2">
                                                Show Percentage Totals
                                        </Typography>
                                        <Typography id="modal-modal-description" sx={{ mt: 1, mb: 1.5 }}>
                                                Select the years you would like to show energy or emissions percentage totals for.
                                        </Typography>
                                        <div className="percentage-changes">
                                                {!percentageTotals.length ? <div className="no-percentage-changes">No percentage totals added yet.</div> : (
                                                        percentageTotals.map((year, index) => (
                                                                <div key={index} className="percentage-change">
                                                                        {year}
                                                                        <img className="cross-icon" alt="cross" src="cross.svg" onClick={() => removePercentageTotal(year)} />
                                                                </div>
                                                        ))
                                                )}
                                        </div>
                                        <div className="modal-buttons">
                                                <NewModal addPercentageTotal={addPercentageTotal} />
                                                <div className="button-general save-percentages-button" onClick={handleClose}>Save</div>
                                        </div>
                                </Box>
                        </Modal>
                </>
        );
};

export default PercentageTotalModal;