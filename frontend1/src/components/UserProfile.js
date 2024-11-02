import React, { useState, useEffect } from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';

const poolData = {
    UserPoolId: 'ap-southeast-2_e311RfTfz', 
    ClientId: '1tp9mg2i4kih1ko1a9nbk7pe2q'  
};
const userPool = new CognitoUserPool(poolData);

const UserProfile = () => {
    const [userData, setUserData] = useState({ email: '' });
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = () => {
            const user = userPool.getCurrentUser();
            if (user) {
                user.getSession((err, session) => {
                    if (err) {
                        console.error('Error getting user session:', err);
                        return;
                    }
                    // Fetch user attributes
                    user.getUserAttributes((err, attributes) => {
                        if (err) {
                            console.error('Error fetching user attributes:', err);
                            return;
                        }
                        const email = attributes.find(attr => attr.Name === 'email').Value;
                        setUserData({ email });
                    });
                });
            }
        };

        fetchUserData();
    }, []);

    const handleUpdate = () => {
        const user = userPool.getCurrentUser();
        if (user) {
            setLoading(true);
            user.getSession((err) => {
                if (err) {
                    console.error('Error getting user session:', err);
                    setLoading(false);
                    return;
                }

                // Update email attribute
                if (newEmail) {
                    user.updateAttributes([{ Name: 'email', Value: newEmail }], (err, result) => {
                        if (err) {
                            console.error('Error updating email:', err);
                            setMessage('Failed to update email.');
                        } else {
                            console.log('Email update success:', result);
                            setMessage('Email updated successfully!');
                            setUserData({ ...userData, email: newEmail });
                        }
                        setLoading(false);
                    });
                }

                // Update password
                if (currentPassword && newPassword) {
                    user.changePassword(currentPassword, newPassword, (err, result) => {
                        if (err) {
                            console.error('Error changing password:', err);
                            setMessage('Failed to update password. Make sure the current password is correct.');
                        } else {
                            console.log('Password change success:', result);
                            setMessage('Password updated successfully!');
                        }
                        setLoading(false);
                    });
                }
            });
        }
    };

    const handleDeleteAccount = () => {
        const confirmDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (!confirmDelete) return;

        const user = userPool.getCurrentUser();
        if (user) {
            setLoading(true);
            user.getSession((err) => {
                if (err) {
                    console.error('Error getting user session:', err);
                    setLoading(false);
                    return;
                }

                user.deleteUser((err, result) => {
                    if (err) {
                        console.error('Error deleting user:', err);
                        setMessage('Failed to delete account.');
                    } else {
                        console.log('User deletion success:', result);
                        setMessage('Account deleted successfully!');
                        // Optionally, log out and redirect
                        localStorage.removeItem('token');
                        window.location.href = '/register'; // Redirect to register or home
                    }
                    setLoading(false);
                });
            });
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            <Box textAlign="center" mb={4}>
                <Typography variant="h4" gutterBottom>
                    User Profile
                </Typography>
            </Box>
            <Box>
                <Typography variant="body1" mb={2}>
                    Email: <strong>{userData.email}</strong>
                </Typography>
                <TextField
                    label="New Email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email"
                />
                <TextField
                    label="Current Password"
                    variant="outlined"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                />
                <TextField
                    label="New Password"
                    variant="outlined"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                />
                <Box mt={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                    </Button>
                </Box>
                <Box mt={3}>
                    <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        onClick={handleDeleteAccount}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Delete Account'}
                    </Button>
                </Box>
                {message && (
                    <Box mt={3}>
                        <Alert severity={message.includes('Failed') ? 'error' : 'success'}>{message}</Alert>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default UserProfile;
