import React from 'react';
import CharacterInput from './CharacterInput';

const AuthPanel = () => {
        const handleCodeInput = () => {
                const code = Array.from(document.getElementsByClassName('code-char')).map(input => input.value.trim()).join('');
                const submitButton = document.getElementsByClassName('signin-submit')[0];
                if (code.length == 6) {
                        submitButton.classList.remove('signin-submit-disabled');
                } else {
                        submitButton.classList.add('signin-submit-disabled');
                }
        };

        return (
                <div className="signin-panel">
                        <div className="signin-panel-text">
                                <div className="signin-title">Sign into DurMetrics with a login code</div>
                                <div className="signin-subtitle">You may use either a view-code or an edit-code.</div>
                                <img src="dcc-logo.png" className="signin-dcc-logo" />
                        </div>
                        <div className="signin-panel-code">
                                <div className="signin-code">
                                        {[...Array(6)].map((_, i) => <CharacterInput index={i} handleCodeInput={handleCodeInput} />)}
                                </div>
                                <div className="signin-submit signin-submit-disabled">
                                        Sign in
                                </div>
                        </div>
                </div>
        );
};

export default AuthPanel;