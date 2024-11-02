// Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';

const Navbar = ({ token, setToken }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        setToken('');
        localStorage.removeItem('token');
        navigate('/'); // Redirect to the home page after logging out
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    Video Sharing App
                </Typography>
                <Box>
                    <Button color="inherit" component={Link} to="/">Home</Button>
                    {token ? (
                        <>
                            <Button color="inherit" component={Link} to="/upload">Upload</Button>
                            <Button color="inherit" component={Link} to="/videos">Videos</Button>
                            <Button color="inherit" component={Link} to="/profile">Profile</Button>
                            <Button color="inherit" onClick={handleLogout}>Logout</Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" component={Link} to="/login">Login</Button>
                            <Button color="inherit" component={Link} to="/register">Register</Button>
                            <Button color="inherit" component={Link} to="/verify">Verify Account</Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
