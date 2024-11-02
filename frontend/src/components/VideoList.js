import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config'; // Import the config file
import {
    Box,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Container,
    Grid,
    Button,
    Typography,
    CircularProgress,
    Select,
    MenuItem,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

const VideoList = () => {
    const [videos, setVideos] = useState([]);
    const [playingVideo, setPlayingVideo] = useState(null); 
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                const result = await axios.get(`${config.API_URL}/videos`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const videosWithThumbnails = await Promise.all(result.data.map(async (video) => {
                    try {
                        // Fetch the pre-signed URL for the thumbnail
                        const thumbnailResponse = await axios.get(`${config.API_URL}/videos/thumbnails/${video._id}`, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        });
                        video.thumbnailURL = thumbnailResponse.data.presignedThumbnailURL;
                    } catch (err) {
                        console.error(`Error fetching thumbnail for video ${video._id}:`, err);
                    }
                    return video;
                }));

                setVideos(videosWithThumbnails);
            } catch (err) {
                console.error('Error fetching videos:', err);
                setError('Error fetching videos. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        const fetchUserProfile = async () => {
            const userToken = localStorage.getItem('token');
            if (userToken) {
                try {
                    const result = await axios.get(`${config.API_URL}/profile`, {
                        headers: {
                            Authorization: `Bearer ${userToken}`
                        }
                    });
                    setLoggedInUser(result.data);
                } catch (err) {
                    console.error('Error fetching user profile:', err);
                    setError('Could not fetch user profile. Please make sure you are logged in.');
                }
            }
        };

        fetchVideos();
        fetchUserProfile();
    }, []);

    const handleThumbnailClick = async (videoId) => {
        try {
            // Fetch the pre-signed URL for the original quality by default
            const response = await axios.get(`${config.API_URL}/videos/${videoId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                params: {
                    quality: 'original',
                },
            });

            setPlayingVideo({
                videoId: videoId,
                url: response.data.presignedURL,
                selectedQuality: 'original'
            });
        } catch (err) {
            console.error('Error fetching video URL:', err);
            setError('Error fetching video URL. Please try again.');
        }
    };

    const handleQualityChange = async (e, videoId) => {
        const newQuality = e.target.value;

        if (playingVideo && playingVideo.videoId === videoId) {
            try {
                // Fetch the pre-signed URL for the new quality
                const response = await axios.get(`${config.API_URL}/videos/${videoId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    params: {
                        quality: newQuality,
                    }
                });

                // Update the playing video with the new quality URL
                setPlayingVideo({
                    videoId: videoId,
                    url: response.data.presignedURL,
                    selectedQuality: newQuality
                });
            } catch (err) {
                console.error('Error fetching video URL for new quality:', err);
                setError('Error fetching video URL for new quality. Please try again.');
            }
        }
    };

    const handleDelete = async (videoId) => {
        try {
            await axios.delete(`${config.API_URL}/videos/${videoId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setVideos(videos.filter(video => video._id !== videoId));
        } catch (err) {
            console.error('Error deleting video:', err);
            setError('Error deleting video. Please try again.');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 5 }}>
            <Typography variant="h4" gutterBottom>
                Uploaded Videos
            </Typography>
            {error && (
                <Typography variant="body1" color="error">
                    {error}
                </Typography>
            )}
            {loading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={4}>
                    {videos.map((video) => (
                        <Grid item key={video._id} xs={12} sm={6} md={4}>
                            <Card variant="outlined">
                                {playingVideo && playingVideo.videoId === video._id ? (
                                    <CardMedia
                                        component="video"
                                        controls
                                        autoPlay
                                        height="200"
                                        src={playingVideo.url}
                                    />
                                ) : (
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={video.thumbnailURL}
                                        alt={video.title}
                                        onClick={() => handleThumbnailClick(video._id)}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                )}
                                <CardContent>
                                    <Typography variant="h6">{video.title}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {video.description}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Uploaded by: {video.username ? video.username : 'Unknown'}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    {loggedInUser && video.uploadedBy === loggedInUser.userId && (
                                        <IconButton
                                            aria-label="delete"
                                            onClick={() => handleDelete(video._id)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                    {playingVideo && playingVideo.videoId === video._id && (
                                        <Select
                                            value={playingVideo.selectedQuality}
                                            onChange={(e) => handleQualityChange(e, video._id)}
                                        >
                                            <MenuItem value="original">Original</MenuItem>
                                            <MenuItem value="quality1080p">1080p</MenuItem>
                                            <MenuItem value="quality720p">720p</MenuItem>
                                            <MenuItem value="quality480p">480p</MenuItem>
                                        </Select>
                                    )}
                                    <IconButton
                                        aria-label="play"
                                        onClick={() => handleThumbnailClick(video._id)}
                                        color="primary"
                                    >
                                        <PlayCircleOutlineIcon />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default VideoList;
