import React, { useState } from 'react';
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Alert } from '@mui/material';

const poolData = {
  UserPoolId: 'ap-southeast-2_e311RfTfz',
  ClientId: '1tp9mg2i4kih1ko1a9nbk7pe2q'
};
const userPool = new CognitoUserPool(poolData);

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const user = new CognitoUser({ Username: username, Pool: userPool });
        const authDetails = new AuthenticationDetails({ Username: username, Password: password });

        user.authenticateUser(authDetails, {
            onSuccess: (result) => {
                const token = result.getIdToken().getJwtToken();
                localStorage.setItem('token', token);
                navigate('/videos');
                window.location.reload();  
            },
            onFailure: (err) => {
                setError('Login failed. Please check your username and password.');
            }
        });
    };

    return (
        <Container maxWidth="sm">
            <Box mt={5} textAlign="center">
                <Typography variant="h4" gutterBottom>Login</Typography>
                {error && <Alert severity="error">{error}</Alert>}
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
                        Login
                    </Button>
                </form>
            </Box>
        </Container>
    );
}

export default Login;
