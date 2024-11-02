import React, { useState } from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Alert } from '@mui/material';

const poolData = {
    UserPoolId: 'ap-southeast-2_e311RfTfz',
    ClientId: '1tp9mg2i4kih1ko1a9nbk7pe2q'
};
const userPool = new CognitoUserPool(poolData);

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        userPool.signUp(username, password, [{ Name: 'email', Value: email }], null, (err, result) => {
            if (err) {
                console.error('Registration error:', err);
                setMessage('Registration failed. Please try again.');
            } else {
                console.log('Registration success:', result);
                setMessage('Registration successful! Please verify your account.');
                setTimeout(() => {
                    navigate('/verify');  // Redirect to the verify page after successful registration
                }, 2000); // Redirect after 2 seconds
            }
        });
    };

    return (
        <Container maxWidth="sm">
            <Box mt={5} textAlign="center">
                <Typography variant="h4" gutterBottom>Register</Typography>
                {message && <Alert severity={message.includes('failed') ? 'error' : 'success'}>{message}</Alert>}
                <form onSubmit={handleSubmit}>
                    <Box mb={2}>
                        <TextField
                            label="Username"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label="Email"
                            type="email"
                            variant="outlined"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Box>
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Register
                    </Button>
                </form>
            </Box>
        </Container>
    );
}

export default Register;
