import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Interface from './pages/Interface';
import Auth from './pages/Auth';
import Error from './pages/Error';
import './main.css';

function App() {
    const [isSmallDevice, setIsSmallDevice] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const checkValidJWT = async () => {
        try {
            const authToken = document.cookie.split('; ').find(row => row.startsWith('authToken=')).split('=')[1];
            console.log(authToken)
            const res = await axios.post("https://durmetrics-api.sglre6355.net/auth/verify-session", {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });
            return res;
        } catch (err) {
            console.error(err);
            return { access_level: 0 };
        }
    };

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallDevice(window.innerWidth < 1000);
        };

        checkScreenSize();

        window.addEventListener('resize', checkScreenSize);

        checkValidJWT().then(data => {
            if (data.access_level < 1) {
                setIsLoggedIn(false);
            } else {
                setIsLoggedIn(true);
            }
        });

    }, []);

    return (
        <>
            {isSmallDevice ? (
                <Error
                    code={"[!]"}
                    title={"Device Not Supported"}
                    message={"Please use a desktop to access this app."}
                />
            ) : (
                <Routes>
                    <Route path="/signin" element={<Auth />} />
                    <Route path="/" element={isLoggedIn ? <Interface /> : <Auth />} />
                    <Route path="*" element={<Interface />} />
                </Routes>
            )}
        </>
    );
}

export default App;
