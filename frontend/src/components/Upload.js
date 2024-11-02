import React, { useState } from 'react';
import axios from 'axios';
import config from '../config'; 
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Container,
    TextField,
    Typography,
    Grid
} from '@mui/material';

function Upload() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [video, setVideo] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!token) {
            setMessage('You must be logged in to upload a video.');
            return;
        }

        if (!video) {
            setMessage('Please select a video file to upload.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const formData = new FormData();
            formData.append('video', video);
            formData.append('title', title);
            formData.append('description', description);

            // Upload the video to backend which will store it in S3
            const response = await axios.post(`${config.API_URL}/upload`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Log the entire response for debugging purposes
            console.log('Upload response:', response);

            // Check if videoId is present in the response
            const { videoId } = response.data;
            if (!videoId) {
                throw new Error('Failed to retrieve video ID from the server.');
            }

            setMessage('Video uploaded successfully! Fetching video URL...');

            // Fetch the pre-signed URL for accessing the uploaded video
            const videoResponse = await axios.get(`${config.API_URL}/videos/${videoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            setVideoUrl(videoResponse.data.presignedURL);
            setMessage('Video ready to view!');

        } catch (err) {
            console.error('Upload error:', err);
            setMessage('Error uploading video. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Card variant="outlined" sx={{ mt: 5, p: 3 }}>
                <CardHeader title="Upload Video" />
                <CardContent>
                    {message && (
                        <Typography variant="body1" color={loading ? 'textSecondary' : 'error'}>
                            {message}
                        </Typography>
                    )}
                    {loading && (
                        <Box display="flex" justifyContent="center" alignItems="center" my={2}>
                            <CircularProgress />
                        </Box>
                    )}
                    <form onSubmit={handleSubmit}>
                        <Box my={2}>
                            <TextField
                                fullWidth
                                label="Title"
                                variant="outlined"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Box>
                        <Box my={2}>
                            <TextField
                                fullWidth
                                label="Description"
                                variant="outlined"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </Box>
                        <Box my={2}>
                            <Button
                                variant="contained"
                                component="label"
                                color="primary"
                            >
                                Select Video
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setVideo(e.target.files[0])}
                                    hidden
                                    required
                                />
                            </Button>
                            {video && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Selected File: {video.name}
                                </Typography>
                            )}
                        </Box>
                        <Box my={2}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="secondary"
                                fullWidth
                                disabled={loading}
                            >
                                {loading ? 'Uploading...' : 'Upload'}
                            </Button>
                        </Box>
                    </form>
                    {/* Display uploaded video if available */}
                    {videoUrl && (
                        <Box mt={4}>
                            <Typography variant="h5">Uploaded Video:</Typography>
                            <Grid container justifyContent="center" mt={2}>
                                <video controls src={videoUrl} width="600" />
                            </Grid>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}

export default Upload;
