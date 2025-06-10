# Cloud-Based Video Sharing Platform

This project is a cloud-native video sharing platform that allows users to upload, process, and view videos via pre-signed URLs. It was developed as part of the Cloud Computing unit at Queensland University of Technology (QUT).

##  Project Overview

The Video Sharing App enables users to:
- Upload video files securely using authentication via AWS Cognito.
- Automatically transcode uploaded videos to different quality levels using FFmpeg.
- Store videos and thumbnails in Amazon S3.
- Store metadata and user info in MongoDB (hosted on EC2).
- View videos using pre-signed S3 URLs.
- Enforce authorisation rules using Cognito Groups.

## Cloud Architecture

| Component | Service | Description |
|----------|---------|-------------|
| **Frontend** | React.js (hosted on EC2) | User interface for video upload and playback |
| **Backend** | Node.js + Express (hosted on EC2) | REST API, video processing, Cognito validation |
| **Storage** | Amazon S3 | Stores original and transcoded video files, thumbnails |
| **Metadata DB** | MongoDB (EC2-hosted) | Stores video titles, descriptions, user info |
| **Authentication** | AWS Cognito | Handles signup, login, JWTs, and group-based access control |
| **DNS** | Route 53 | Custom domains for frontend/backend |
| **Security** | Custom security groups | Manages access to EC2, MongoDB, and S3 |

## Key Features

- **Cognito Auth**: Only authenticated users can upload videos.
- **User Roles**: Admins can delete any video, regular users can delete their own.
- **Stateless Design**: All persistent data is stored in S3 and MongoDB.
- **Secure Access**: Videos accessed via time-limited pre-signed URLs.
- **Video Processing**: Automatic transcoding to multiple resolutions using FFmpeg.
