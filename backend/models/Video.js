const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    paths: {
        original: { type: String, required: true },
        quality1080p: { type: String, default: '' },
        quality720p: { type: String, default: '' },
        quality480p: { type: String, default: '' },
        quality2000p: { type: String, default: '' },
        quality120p: { type: String, default: '' },
    },
    thumbnail: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
