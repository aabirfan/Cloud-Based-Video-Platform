import React, { useState } from 'react';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Alert
} from '@mui/material';

const poolData = {
    UserPoolId: 'ap-southeast-2_e311RfTfz', // Replace with your User Pool ID
    ClientId: '1tp9mg2i4kih1ko1a9nbk7pe2q'   
};
const userPool = new CognitoUserPool(poolData);

function VerifyAccount() {
    const [username, setUsername] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsError(false);
        setMessage('');

        const user = new CognitoUser({ Username: username, Pool: userPool });

        user.confirmRegistration(verificationCode, true, (err, result) => {
            if (err) {
                console.error('Verification error:', err);
                setMessage('Verification failed. Please check the code and try again.');
                setIsError(true);
            } else {
                console.log('Verification success:', result);
                setMessage('Your account has been verified successfully!');
                setTimeout(() => {
                    navigate('/login');
                }, 1000); 
            }
        });
    };

    return (
        <Container maxWidth="sm">
            <Box textAlign="center" mt={5} mb={3}>
                <Typography variant="h4" gutterBottom>
                    Verify Your Account
                </Typography>
                <Typography variant="body1">
                    Please enter your username and verification code to verify your account.
                </Typography>
            </Box>
            {message && (
                <Box mb={2}>
                    <Alert severity={isError ? 'error' : 'success'}>{message}</Alert>
                </Box>
            )}
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
                        label="Verification Code"
                        variant="outlined"
                        fullWidth
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        required
                    />
                </Box>
                <Box mt={3}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                    >
                        Verify Account
                    </Button>
                </Box>
            </form>
        </Container>
    );
}

export default VerifyAccount;
