// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Upload from './components/Upload';
import VideoList from './components/VideoList';
import Register from './components/Register';
import UserProfile from './components/UserProfile'; 
import VerifyAccount from './components/VerifyAccount'; 
import Navbar from './components/Navbar';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || '');

    return (
        <Router>
            <Navbar token={token} setToken={setToken} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login setToken={setToken} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify" element={<VerifyAccount />} />
                {token && (
                    <>
                        <Route path="/upload" element={<Upload />} />
                        <Route path="/videos" element={<VideoList />} />
                        <Route path="/profile" element={<UserProfile />} />
                    </>
                )}
            </Routes>
        </Router>
    );
}

export default App;
