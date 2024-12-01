import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Interface from './pages/Interface';
import Login from './pages/Login';
import './main.css';

function App() {
  const [isSmallDevice, setIsSmallDevice] = useState(false);
  const [defaultPath, setDefaultPath] = useState("/");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLoggedIn = async () => {
    // try {
    //   const res = await axios.get("<API CALL FOR isLoggedIn>", {
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     withCredentials: true,
    //   });
    //   return res.data.isLoggedIn;
    // } catch (err) {
    //   return false;
    // }

    return true;
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallDevice(window.innerWidth < 1000);
    };

    checkScreenSize();

    window.addEventListener('resize', checkScreenSize);

    checkLoggedIn().then(isLoggedIn => {
      setIsLoggedIn(isLoggedIn);
    });

  }, []);

  return (
    <>
      {isSmallDevice ? (<>Use a desktop to access this app.</>) : (
        <Routes>
          <Route path="/signin" element={<Login />} />
          <Route path="/" element={isLoggedIn ? <Interface /> : <Login />} />
          <Route path="*" element={<Interface />} />
        </Routes>
      )}
    </>
  );
}

export default App;
