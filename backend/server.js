const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { promisify } = require('util');
const morgan = require('morgan');
const authenticateJwt = require('./middleware/authenticateJwt');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { exec } = require('child_process');
const { fromSSO } = require('@aws-sdk/credential-provider-sso');

require('dotenv').config();

const unlinkAsync = promisify(fs.unlink);
const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

const s3Client = new S3Client({
    region: 'ap-southeast-2',
    credentials: fromSSO({ profile: 'default' }) 
});

const S3_BUCKET = 'videostorage-aaban';


mongoose.connect('mongodb://localhost:27017/videosharingapp')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));


const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    s3Key: { type: String, required: true },
    uploadedBy: { type: String },
    username: { type: String },
    paths: {
        quality1080p: { type: String },
        quality720p: { type: String },
        quality480p: { type: String },
    },
    thumbnailS3Key: { type: String },
});

const Video = mongoose.model('Video', videoSchema);

app.get('/', (req, res) => {
    res.send('Database');
});

app.post('/upload', authenticateJwt, multer({ dest: 'uploads/' }).single('video'), async (req, res) => {
    const { title, description } = req.body;
    const originalPath = req.file.path;
    const s3Key = `videos/${Date.now()}-${req.file.originalname}`;

    try {
        const uploadParams = {
            Bucket: S3_BUCKET,
            Key: s3Key,
            Body: fs.createReadStream(originalPath)
        };
        await s3Client.send(new PutObjectCommand(uploadParams));

        const qualityPaths = {
            quality1080p: `uploads/${Date.now()}-1080p.mp4`,
            quality720p: `uploads/${Date.now()}-720p.mp4`,
            quality480p: `uploads/${Date.now()}-480p.mp4`,
        };
        const thumbnailPath = `uploads/${Date.now()}-thumbnail.png`;
        const thumbnailKey = `thumbnails/${Date.now()}-thumbnail.png`;

        const generateQuality = (inputPath, outputPath, resolution) => {
            return new Promise((resolve, reject) => {
                exec(`ffmpeg -i ${inputPath} -vf scale=-2:${resolution} ${outputPath}`, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        };

        await generateQuality(originalPath, qualityPaths.quality1080p, 1080);
        await generateQuality(originalPath, qualityPaths.quality720p, 720);
        await generateQuality(originalPath, qualityPaths.quality480p, 480);

        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${originalPath} -ss 00:00:01.000 -vframes 1 ${thumbnailPath}`, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });

        for (const [key, path] of Object.entries(qualityPaths)) {
            const qualityUploadParams = {
                Bucket: S3_BUCKET,
                Key: `videos/${Date.now()}-${key}-${req.file.originalname}`,
                Body: fs.createReadStream(path)
            };
            await s3Client.send(new PutObjectCommand(qualityUploadParams));
            qualityPaths[key] = qualityUploadParams.Key;

            await unlinkAsync(path);
        }

        const thumbnailUploadParams = {
            Bucket: S3_BUCKET,
            Key: thumbnailKey,
            Body: fs.createReadStream(thumbnailPath)
        };
        await s3Client.send(new PutObjectCommand(thumbnailUploadParams));

        console.log('User Payload:', req.user);
        const uploadedBy = req.user.sub; 
        const username = req.user['cognito:username'] || req.user.username || req.user.email;  

        const video = new Video({
            title,
            description,
            s3Key,
            uploadedBy,
            username, 
            paths: {
                quality1080p: qualityPaths.quality1080p,
                quality720p: qualityPaths.quality720p,
                quality480p: qualityPaths.quality480p,
            },
            thumbnailS3Key: thumbnailKey
        });
        await video.save();

        await unlinkAsync(originalPath);
        await unlinkAsync(thumbnailPath);

        res.status(200).json({
            message: 'Video uploaded successfully.',
            videoId: video._id
        });

    } catch (err) {
        console.error('Error uploading video:', err);
        res.status(500).send('Server error during video upload.');
    }
});


app.get('/videos/thumbnails/:id', authenticateJwt, async (req, res) => {
    const videoId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        return res.status(400).send('Invalid video ID format.');
    }

    try {
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).send('Video not found');
        }

        if (!video.thumbnailS3Key) {
            return res.status(404).send('Thumbnail not found for this video.');
        }

        const command = new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: video.thumbnailS3Key,
        });

        const presignedThumbnailURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        res.json({ presignedThumbnailURL });

    } catch (err) {
        console.error('Error generating presigned URL for thumbnail:', err);
        res.status(500).send('Error generating presigned URL for thumbnail');
    }
});


app.get('/videos', authenticateJwt, async (req, res) => {
    try {
        const videos = await Video.find();
        res.json(videos);
    } catch (err) {
        console.error('Error fetching videos:', err);
        res.status(500).send('Error fetching videos');
    }
});


app.get('/videos/:id', authenticateJwt, async (req, res) => {
    const videoId = req.params.id;
    const { quality } = req.query; 

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        return res.status(400).send('Invalid video ID format.');
    }

    try {
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).send('Video not found');
        }

        let s3Key;
        if (quality === 'quality1080p' && video.paths?.quality1080p) {
            s3Key = video.paths.quality1080p;
        } else if (quality === 'quality720p' && video.paths?.quality720p) {
            s3Key = video.paths.quality720p;
        } else if (quality === 'quality480p' && video.paths?.quality480p) {
            s3Key = video.paths.quality480p;
        } else {
            s3Key = video.s3Key; 
        }

        if (!s3Key) {
            return res.status(404).send('Requested quality not found for this video.');
        }

        const command = new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: s3Key,
        });

        const presignedURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        res.json({ presignedURL });

    } catch (err) {
        console.error('Error generating presigned URL:', err);
        res.status(500).send('Error generating presigned URL');
    }
});

app.delete('/videos/:id', authenticateJwt, async (req, res) => {
    const videoId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        return res.status(400).send('Invalid video ID format.');
    }

    try {
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).send('Video not found');
        }

        const userGroups = req.user['cognito:groups'] || [];
        const isAdmin = userGroups.includes('Admin');

        if (video.uploadedBy !== req.user.sub && !isAdmin) {
            console.log(`User ${req.user.sub} is not authorized to delete video ${video._id}`);
            return res.status(403).send('You are not authorized to delete this video');
        }

        const deletePromises = [];
        if (typeof video.s3Key === 'string') {
            const originalDeleteParams = {
                Bucket: S3_BUCKET,
                Key: video.s3Key,
            };
            console.log(`Deleting original video with key: ${video.s3Key}`);
            deletePromises.push(s3Client.send(new DeleteObjectCommand(originalDeleteParams)));
        }

        if (video.paths && typeof video.paths === 'object') {
            Object.values(video.paths).forEach(s3Key => {
                if (typeof s3Key === 'string' && s3Key.length > 0) {
                    console.log(`Deleting quality version with key: ${s3Key}`);
                    const qualityDeleteParams = {
                        Bucket: S3_BUCKET,
                        Key: s3Key,
                    };
                    deletePromises.push(s3Client.send(new DeleteObjectCommand(qualityDeleteParams)));
                }
            });
        }

        if (typeof video.thumbnailS3Key === 'string' && video.thumbnailS3Key.length > 0) {
            console.log(`Deleting thumbnail with key: ${video.thumbnailS3Key}`);
            const thumbnailDeleteParams = {
                Bucket: S3_BUCKET,
                Key: video.thumbnailS3Key,
            };
            deletePromises.push(s3Client.send(new DeleteObjectCommand(thumbnailDeleteParams)));
        }

        await Promise.all(deletePromises);

        await Video.findByIdAndDelete(videoId);

        res.send('Video, all its versions, and thumbnail deleted successfully');
    } catch (err) {
        console.error('Error deleting video:', err);
        res.status(500).send('Error deleting video');
    }
});




app.get('/profile', authenticateJwt, async (req, res) => {
    try {
        res.json({ userId: req.user.sub, username: req.user.username });
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).send('Error fetching user profile');
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

const gracefulShutdown = () => {
    console.log('Received shutdown signal, shutting down gracefully...');
    mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed.');
        process.exit(0);
    });
};



process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
