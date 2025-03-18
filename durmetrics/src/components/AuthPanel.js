import React, { useState } from 'react';
import CharacterInput from './CharacterInput';
import axios from 'axios';
import Cookies from 'js-cookie';

const AuthPanel = () => {
        // State to store the entered code
        const [code, setCode] = useState('');
        // State to store any error messages
        const [error, setError] = useState(null);
        // State to manage the disabled state of the submit button
        const [buttonIsDisabled, setButtonIsDisabled] = useState(true);
        // Constant to define the required code length
        const CODE_LENGTH = 6;

        // Handles input changes for each character input field
        const handleCodeInput = (e) => {
                // Ensure only one character is allowed per input field
                if (e.target.value.length > 1) {
                        e.target.value = e.target.value.slice(0, 1);
                }

                // Collect the values from all input fields and combine them into a single code
                const enteredCode = Array.from(document.getElementsByClassName('code-char'))
                        .map(input => input.value.trim())
                        .join('');
                setCode(enteredCode.toUpperCase()); // Convert the code to uppercase

                // Enable or disable the submit button based on the code length
                if (enteredCode.length === CODE_LENGTH) {
                        setButtonIsDisabled(false);
                } else {
                        setButtonIsDisabled(true);
                }
        };

        // Handles keyboard navigation and input behavior
        const handleKeyDown = (e) => {
                const currentIndex = parseInt(e.target.id.split('-')[1], 10); // Get the index of the current input field

                // Prevent default behavior for certain keys
                if (e.key === ' ' || e.key === 'Enter' || e.key === 'Shift') {
                        e.preventDefault();
                        return;
                }

                // Handle backspace navigation to the previous input field
                if (e.key === 'Backspace') {
                        if (!e.target.value && currentIndex > 0) {
                                const previousInput = document.getElementById(`code-${currentIndex - 1}`);
                                if (previousInput) {
                                        previousInput.focus();
                                }
                        }
                } else {
                        // Automatically move to the next input field if it exists
                        const nextInputIndex = currentIndex + 1;
                        if (nextInputIndex < CODE_LENGTH) {
                                const nextInput = document.getElementById(`code-${nextInputIndex}`);
                                if (nextInput) {
                                        setTimeout(() => nextInput.focus(), 0); // Delay to ensure the value is updated
                                }
                        }
                }
        };

        // Handles the submit action when the user clicks the "Sign in" button
        const handleSubmit = () => {
                if (!buttonIsDisabled) {
                        signIn().then(accessLevel => {
                                // Redirect to the home page if the access level is sufficient
                                if (accessLevel >= 1) {
                                        setTimeout(() => {
                                                window.location.href = '/';
                                        }, 400);
                                }
                        });
                }
        };

        // Sends the entered code to the server for authentication
        const signIn = async () => {
                try {
                        const res = await axios.post("https://durmetrics-api.sglre6355.net/auth/login", {
                                code
                        }, {
                                headers: {
                                        'Content-Type': 'application/json',
                                }
                        });

                        const token = res.data.token;

                        // Store the authentication token in a cookie if it exists
                        if (token) {
                                Cookies.set('authToken', token, { path: '/', secure: true, sameSite: 'Strict' });
                        } else {
                                setError("Your login code is invalid."); // Display an error if the token is missing
                        }

                        return res.data.access_level; // Return the user's access level
                } catch (err) {
                        setError("Your login code is invalid."); // Display an error if the request fails
                        return 0; // Return a default access level of 0
                }
        };

        return (
                <div className="signin-panel">
                        <div className="signin-panel-text">
                                <div className="signin-title">Sign into DurMetrics with a login code</div>
                                <div className="signin-subtitle">You may use either a view-code or an edit-code.</div>
                                {error && <div className="signin-error">{error}</div>} {/* Display error messages if any */}
                                <img src="dcc-logo.png" alt="dcc-logo" className="signin-dcc-logo" />
                        </div>
                        <div className="signin-panel-code">
                                <div className="signin-code">
                                        {/* Render the character input fields dynamically */}
                                        {[...Array(CODE_LENGTH)].map((_, i) => <CharacterInput index={i} key={i} handleKeyDown={handleKeyDown} handleCodeInput={handleCodeInput} />)}
                                </div>
                                {/* Submit button with conditional styling based on its disabled state */}
                                <div className={`signin-submit ${buttonIsDisabled && 'signin-submit-disabled'}`} onClick={handleSubmit}>
                                        Sign in
                                </div>
                        </div>
                </div>
        );
};

export default AuthPanel;