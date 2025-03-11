import React, { useState } from 'react';
import CharacterInput from './CharacterInput';
import axios from 'axios';

const AuthPanel = () => {
        const [code, setCode] = useState('');
        const [error, setError] = useState(null);
        const [buttonIsDisabled, setButtonIsDisabled] = useState(true);
        const CODE_LENGTH = 6;

        const handleCodeInput = (e) => {
                if (e.target.value.length > 1) {
                        e.target.value = e.target.value.slice(0, 1);
                }

                const enteredCode = Array.from(document.getElementsByClassName('code-char'))
                        .map(input => input.value.trim())
                        .join('');
                setCode(enteredCode);

                if (enteredCode.length === CODE_LENGTH) {
                        setButtonIsDisabled(false);
                } else {
                        setButtonIsDisabled(true);
                }
        };

        const handleKeyDown = (e) => {
                const currentIndex = parseInt(e.target.id.split('-')[1], 10);

                if (e.key === ' ' || e.key === 'Enter' || e.key === 'Shift') {
                        e.preventDefault();
                        return;
                }

                if (e.key === 'Backspace') {
                        if (!e.target.value && currentIndex > 0) {
                                const previousInput = document.getElementById(`code-${currentIndex - 1}`);
                                if (previousInput) {
                                        previousInput.focus();
                                }
                        }
                } else {
                        const nextInputIndex = currentIndex + 1;
                        if (nextInputIndex < CODE_LENGTH) {
                                const nextInput = document.getElementById(`code-${nextInputIndex}`);
                                if (nextInput) {
                                        setTimeout(() => nextInput.focus(), 0);
                                }
                        }
                }
        };

        const handleSubmit = () => {
                if (!buttonIsDisabled) {
                        signIn();
                }
        };

        const signIn = async () => {
                try {
                        const res = await axios.get("<SIGNIN API ENDPOINT>", {
                                headers: {
                                        'Content-Type': 'application/json',
                                },
                                withCredentials: true,
                                data: {
                                        code
                                },
                        });

                        return res;
                } catch (err) {
                        setError("Your login code is invalid.");
                }
        };

        return (
                <div className="signin-panel">
                        <div className="signin-panel-text">
                                <div className="signin-title">Sign into DurMetrics with a login code</div>
                                <div className="signin-subtitle">You may use either a view-code or an edit-code.</div>
                                {error && <div className="signin-error">{error}</div>}
                                <img src="dcc-logo.png" className="signin-dcc-logo" />
                        </div>
                        <div className="signin-panel-code">
                                <div className="signin-code">
                                        {[...Array(CODE_LENGTH)].map((_, i) => <CharacterInput index={i} key={i} handleKeyDown={handleKeyDown} handleCodeInput={handleCodeInput} />)}
                                </div>
                                <div className={`signin-submit ${buttonIsDisabled && 'signin-submit-disabled'}`} onClick={handleSubmit}>
                                        Sign in
                                </div>
                        </div>
                </div>
        );
};

export default AuthPanel;