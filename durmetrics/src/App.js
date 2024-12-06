import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Interface from './pages/Interface';
import Auth from './pages/Auth';
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
      // set default path
    });

  }, []);

  return (
    // <>
    //   {isSmallDevice ? (<>Use a desktop to access this app.</>) : (
    //     <Routes>
    //       <Route path="/signin" element={<Auth />} />
    //       <Route path="/" element={isLoggedIn ? <Interface /> : <Auth />} />
    //       <Route path="*" element={<Interface />} />
    //     </Routes>
    //   )}
    // </>
    <Routes>
      <Route path="/signin" element={<Auth />} />
      <Route path="/" element={isLoggedIn ? <Interface /> : <Auth />} />
      <Route path="*" element={<Interface />} />
    </Routes>
  );
}

export default App;
