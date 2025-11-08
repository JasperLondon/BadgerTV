# BadgerTV AWS Backend Setup Guide

This guide walks you through setting up the complete AWS infrastructure for BadgerTV.

## Table of Contents
1. [AWS Cognito - Authentication](#1-aws-cognito---authentication)
2. [DynamoDB Tables](#2-dynamodb-tables)
3. [S3 Bucket - Video Storage](#3-s3-bucket---video-storage)
4. [CloudFront - CDN (Optional)](#4-cloudfront---cdn-optional)
5. [API Gateway + Lambda](#5-api-gateway--lambda)
6. [IAM Roles & Permissions](#6-iam-roles--permissions)
7. [Update App Configuration](#7-update-app-configuration)

---

## 1. AWS Cognito - Authentication

### Create User Pool

1. Go to **AWS Cognito Console** → **User Pools** → **Create user pool**

2. **Configure sign-in experience**:
   - Sign-in options: `Username` and `Email`
   - Click **Next**

3. **Configure security requirements**:
   - Password policy: Choose "Cognito defaults" or customize
   - MFA: Optional (recommended for production)
   - Click **Next**

4. **Configure sign-up experience**:
   - Self-registration: `Allow users to sign themselves up`
   - Required attributes: `email`
   - Click **Next**

5. **Configure message delivery**:
   - Email provider: Use Cognito for testing, SES for production
   - Click **Next**

6. **Integrate your app**:
   - User pool name: `BadgerTVUserPool`
   - App client name: `BadgerTVApp`
   - **Uncheck** "Generate client secret" (important for mobile apps)
   - Click **Next** → **Create user pool**

7. **Note these values** (you'll need them):
   ```
   User Pool ID: us-east-1_XXXXXXXXX
   App Client ID: 1a2b3c4d5e6f7g8h9i0j
   Region: us-east-1
   ```

---

## 2. DynamoDB Tables

### Table 1: Videos

```bash
aws dynamodb create-table \
  --table-name BadgerTV-Videos \
  --attribute-definitions \
    AttributeName=videoId,AttributeType=S \
    AttributeName=category,AttributeType=S \
  --key-schema \
    AttributeName=videoId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=CategoryIndex,KeySchema=[{AttributeName=category,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5
```

**Schema:**
```json
{
  "videoId": "v001",
  "title": "SkyFall 2024",
  "description": "Full event replay",
  "category": "event",
  "thumbnailUrl": "https://bucket.s3.amazonaws.com/thumbnails/skyfall.jpg",
  "s3Key": "videos/skyfall-2024.mp4",
  "duration": 7200,
  "tags": ["skiing", "competition", "2024"],
  "createdAt": "2024-11-01T00:00:00Z",
  "isLive": false,
  "featured": true
}
```

### Table 2: Events

```bash
aws dynamodb create-table \
  --table-name BadgerTV-Events \
  --attribute-definitions \
    AttributeName=eventId,AttributeType=S \
    AttributeName=date,AttributeType=S \
  --key-schema \
    AttributeName=eventId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=DateIndex,KeySchema=[{AttributeName=date,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5
```

**Schema:**
```json
{
  "eventId": "e001",
  "title": "SkyFall 2025",
  "description": "Annual skiing competition",
  "date": "2025-02-15T18:00:00Z",
  "thumbnailUrl": "https://bucket.s3.amazonaws.com/events/skyfall2025.jpg",
  "status": "upcoming",
  "location": "Colorado",
  "ticketsAvailable": true
}
```

### Table 3: Shows

```bash
aws dynamodb create-table \
  --table-name BadgerTV-Shows \
  --attribute-definitions \
    AttributeName=showId,AttributeType=S \
  --key-schema \
    AttributeName=showId,KeyType=HASH \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5
```

**Schema:**
```json
{
  "showId": "s001",
  "title": "World of MWD",
  "description": "Mountain biking adventures",
  "thumbnailUrl": "https://bucket.s3.amazonaws.com/shows/worldofmwd.jpg",
  "category": "series",
  "totalEpisodes": 12,
  "releaseYear": 2024
}
```

### Table 4: UserVideoHistory

```bash
aws dynamodb create-table \
  --table-name BadgerTV-UserVideoHistory \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=videoId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=videoId,KeyType=RANGE \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5
```

**Schema:**
```json
{
  "userId": "john_doe",
  "videoId": "v001",
  "progress": 1800,
  "duration": 7200,
  "lastWatchedAt": "2024-11-04T12:30:00Z",
  "completed": false
}
```

### Table 5: UserFavorites

```bash
aws dynamodb create-table \
  --table-name BadgerTV-UserFavorites \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=videoId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=videoId,KeyType=RANGE \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5
```

---

## 3. S3 Bucket - Video Storage

### Create Bucket

```bash
aws s3 mb s3://badgertv-videos-prod --region us-east-1
```

### Set CORS Configuration

Create `cors.json`:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Apply:
```bash
aws s3api put-bucket-cors --bucket badgertv-videos-prod --cors-configuration file://cors.json
```

### Folder Structure

```
badgertv-videos-prod/
├── videos/
│   ├── skyfall-2024.mp4
│   ├── episode-001.mp4
│   └── ...
├── thumbnails/
│   ├── skyfall.jpg
│   ├── episode-001.jpg
│   └── ...
└── posters/
    ├── worldofmwd.jpg
    └── ...
```

### Upload Sample Video

```bash
aws s3 cp video.mp4 s3://badgertv-videos-prod/videos/video.mp4
```

---

## 4. CloudFront - CDN (Optional)

### Create Distribution

1. Go to **CloudFront Console** → **Create Distribution**
2. Origin domain: Select your S3 bucket
3. Origin access: **Origin access control** (recommended)
4. Enable **Origin Shield** for better caching
5. Viewer protocol policy: **Redirect HTTP to HTTPS**
6. Allowed HTTP methods: **GET, HEAD, OPTIONS**
7. Cache policy: **CachingOptimized**
8. Create distribution

### Update S3 Bucket Policy

Replace `YOUR-DISTRIBUTION-ID`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::badgertv-videos-prod/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT-ID:distribution/YOUR-DISTRIBUTION-ID"
        }
      }
    }
  ]
}
```

---

## 5. API Gateway + Lambda

### Option A: Create REST API

1. **API Gateway Console** → **Create API** → **REST API**
2. Name: `BadgerTV-API`
3. Create resources and methods:

```
/videos
  GET - List all videos
  POST - Create video (admin)
  
/videos/{videoId}
  GET - Get single video
  
/videos/search
  GET - Search videos
  
/events
  GET - List events
  
/shows
  GET - List shows
  
/users/{userId}/history
  GET - Get watch history
  POST - Update watch progress
  
/users/{userId}/favorites
  GET - Get favorites
  POST - Add favorite
  DELETE - Remove favorite
```

### Lambda Function Example (Node.js)

**Get Videos:**
```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const category = event.queryStringParameters?.category;
  
  let params = {
    TableName: 'BadgerTV-Videos'
  };
  
  if (category) {
    params.IndexName = 'CategoryIndex';
    params.KeyConditionExpression = 'category = :category';
    params.ExpressionAttributeValues = { ':category': category };
    
    const result = await dynamodb.query(params).promise();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.Items)
    };
  }
  
  const result = await dynamodb.scan(params).promise();
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result.Items)
  };
};
```

### Deploy API

1. **Actions** → **Deploy API**
2. Stage name: `prod`
3. Note your **Invoke URL**: `https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/prod`

---

## 6. IAM Roles & Permissions

### Lambda Execution Role

Create policy `BadgerTV-Lambda-Policy`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:ACCOUNT-ID:table/BadgerTV-*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::badgertv-videos-prod/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

### Cognito Authenticated Role

For mobile app users to access S3:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::badgertv-videos-prod/videos/*"
    }
  ]
}
```

---

## 7. Update App Configuration

Edit `src/config/aws-config.js`:

```javascript
const awsConfig = {
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_XXXXXXXXX', // From Cognito
    userPoolWebClientId: '1a2b3c4d5e6f7g8h9i0j', // From Cognito
    mandatorySignIn: false,
    authenticationFlowType: 'USER_SRP_AUTH',
  },
  
  API: {
    endpoints: [
      {
        name: 'BadgerTVAPI',
        endpoint: 'https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/prod',
        region: 'us-east-1'
      }
    ]
  },
  
  Storage: {
    AWSS3: {
      bucket: 'badgertv-videos-prod',
      region: 'us-east-1',
    }
  }
};

export default awsConfig;
```

---

## Testing

### Test Authentication

```bash
# Sign up
curl -X POST https://your-api.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPass123!"}'
```

### Test API Endpoints

```bash
# Get videos
curl https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/videos

# Get events
curl https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/events
```

### Populate Test Data

```bash
# Insert sample video
aws dynamodb put-item \
  --table-name BadgerTV-Videos \
  --item file://sample-video.json
```

---

## Production Checklist

- [ ] Enable CloudFront for video delivery
- [ ] Set up CloudWatch logs and alarms
- [ ] Configure API Gateway rate limiting
- [ ] Enable S3 versioning and lifecycle policies
- [ ] Set up automated backups for DynamoDB
- [ ] Configure Cognito password policies
- [ ] Set up SES for production emails
- [ ] Enable MFA for Cognito
- [ ] Configure proper CORS policies
- [ ] Set up AWS WAF for API protection
- [ ] Enable CloudTrail for audit logging
- [ ] Create staging environment
- [ ] Set up CI/CD pipeline for Lambda functions

---

## Cost Optimization

- Use DynamoDB on-demand pricing for unpredictable traffic
- Enable S3 Intelligent-Tiering for videos
- Use CloudFront to reduce S3 data transfer costs
- Set lifecycle policies to archive old content to Glacier
- Use Lambda reserved concurrency to control costs
- Enable API Gateway caching

---

## Support Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [S3 Video Streaming](https://aws.amazon.com/blogs/media/video-streaming-with-amazon-s3/)

---

**Need Help?** Open an issue in the repository or contact the development team.
