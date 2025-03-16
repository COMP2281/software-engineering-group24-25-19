import React from 'react';
import AuthPanel from '../components/AuthPanel';

const Login = () => {
        return (
                <div className="signin">
                        <img src="logo.png" alt="logo" className="signin-logo" />
                        <AuthPanel />
                </div>
        );
};

export default Login;