import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <Container maxWidth="md">
            <Box textAlign="center" mt={5} mb={5}>
                <Typography variant="h2" gutterBottom>
                    Welcome to the Video Sharing App!
                </Typography>
               
                <Box mt={4}>
                    <Button
                        component={Link}
                        to="/register"
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{ mr: 2 }}
                    >
                        Get Started
                    </Button>
                    <Button
                        component={Link}
                        to="/login"
                        variant="outlined"
                        color="secondary"
                        size="large"
                    >
                        Log In
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default Home;
