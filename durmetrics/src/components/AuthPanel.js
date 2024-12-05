import React from 'react';

const AuthPanel = () => {
        return (
                <div className="signin-panel">
                        <div className="signin-panel-text">
                                <div className="signin-title">Sign into DurMetrics with a login code</div>
                                <div className="signin-subtitle">You may use either a view-code or an edit-code.</div>
                                <img src="dcc-logo.png" className="signin-dcc-logo" />
                        </div>
                        <div className="signin-panel-code">
                                <div className="signin-code">
                                        <input className="code-char" id="code-1" />
                                        <input className="code-char" id="code-2" />
                                        <input className="code-char" id="code-3" />
                                        <input className="code-char" id="code-4" />
                                        <input className="code-char" id="code-5" />
                                        <input className="code-char" id="code-6" />
                                </div>
                                <div className="signin-submit signin-submit-disabled">
                                        Sign in
                                </div>
                        </div>
                </div>
        );
};

export default AuthPanel;