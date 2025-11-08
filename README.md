# 🎿 BADGER TV

A cross-platform mobile streaming application for extreme sports content, built with React Native and AWS.

<img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
<img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />

## 📱 Overview

BadgerTV is a production-ready streaming platform for action sports content including skiing, mountain biking, and extreme events. The app features secure authentication, video playback, live streaming, event management, and personalized user experiences.

### ✨ Key Features

- 🔐 **Secure Authentication** - AWS Cognito integration with signup, login, password reset
- 🎥 **Video Streaming** - Secure S3-based video delivery with progress tracking
- 📺 **Live TV** - Real-time streaming capabilities
- 📅 **Events Calendar** - Browse upcoming and past events
- 🔍 **Search** - Full-text search across all content
- ❤️ **Favorites & History** - Personalized watchlists and viewing history
- 👤 **User Profiles** - Account management and settings
- 📱 **Cross-Platform** - iOS and Android from a single codebase

## 🏗️ Architecture

### Frontend Stack
- **Framework**: React Native (Expo)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Video**: expo-av with signed URL support
- **State Management**: React Context API
- **Styling**: React Native StyleSheet

### Backend Stack (AWS)
- **Authentication**: AWS Cognito User Pools
- **API**: API Gateway + Lambda
- **Database**: DynamoDB
- **Storage**: S3 + CloudFront (CDN)
- **SDK**: AWS Amplify

## 🚀 Getting Started

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
expo-cli
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/BadgerTV.git
   cd BadgerTV
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure AWS** (See [AWS_SETUP_GUIDE.md](./AWS_SETUP_GUIDE.md))
   - Set up Cognito User Pool
   - Create DynamoDB tables
   - Configure S3 bucket
   - Deploy API Gateway + Lambda functions

4. **Update configuration**
   
   Edit `src/config/aws-config.js` with your AWS credentials:
   ```javascript
   const awsConfig = {
     Auth: {
       region: 'us-east-1',
       userPoolId: 'YOUR_USER_POOL_ID',
       userPoolWebClientId: 'YOUR_APP_CLIENT_ID',
     },
     API: {
       endpoints: [{
         name: 'BadgerTVAPI',
         endpoint: 'YOUR_API_GATEWAY_URL',
       }]
     },
     Storage: {
       AWSS3: {
         bucket: 'YOUR_S3_BUCKET',
         region: 'us-east-1',
       }
     }
   };
   ```

5. **Start development server**
   ```bash
   npm start
   ```

6. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## 📂 Project Structure

```
BadgerTV/
├── App.js                      # Root component with navigation
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── HeroCard.js
│   │   ├── VideoCard.js
│   │   └── ...
│   ├── config/               # Configuration files
│   │   └── aws-config.js    # AWS Amplify configuration
│   ├── constants/           # App constants
│   │   └── colors.js
│   ├── context/            # React Context providers
│   │   ├── AuthContext.js  # Authentication state
│   │   └── VideoContext.js # Video data management
│   ├── data/              # Local fallback data
│   │   ├── showsData.js
│   │   ├── streamingData.js
│   │   └── upcomingEventsData.js
│   ├── screens/          # App screens
│   │   ├── HomeScreen.js
│   │   ├── EventsScreen.js
│   │   ├── LiveTVScreen.js
│   │   ├── SearchScreen.js
│   │   ├── LoginScreen.js
│   │   ├── ProfileScreen.js
│   │   └── VideoPlayer.js
│   └── services/        # External services
│       └── api.js       # AWS API integration
├── assets/             # Images, fonts, etc.
├── AWS_SETUP_GUIDE.md # Detailed AWS setup instructions
└── package.json
```

## 🔧 Configuration

### Environment Variables (Optional)

For production, use environment variables instead of hardcoded values:

```bash
# .env
AWS_REGION=us-east-1
AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
AWS_APP_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
API_ENDPOINT=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
S3_BUCKET=badgertv-videos-prod
```

## 🧪 Testing

Currently using local test data. To switch to live AWS data:

1. Complete AWS setup (see AWS_SETUP_GUIDE.md)
2. Update `src/config/aws-config.js` with real values
3. The app automatically detects API availability

### Test Accounts

Create test users via the app's signup flow or AWS Cognito Console.

## 📦 Building for Production

### iOS

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for App Store
eas build --platform ios
```

### Android

```bash
# Build for Play Store
eas build --platform android
```

## 🔐 Security

- All video URLs are signed with expiration
- JWT tokens for API authentication
- Password requirements enforced
- HTTPS only communication
- Cognito MFA support (optional)

## 🎨 Customization

### Color Scheme

Edit `src/constants/colors.js`:
```javascript
export const COLORS = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  ORANGE: '#FF6B35', // Primary brand color
};
```

### App Icon & Splash Screen

Replace files in `assets/`:
- `icon.png` - App icon (1024x1024)
- `splash.png` - Splash screen
- `adaptive-icon.png` - Android adaptive icon

## 📊 API Endpoints

The app expects these endpoints (configured via API Gateway):

```
GET    /videos                    # List all videos
GET    /videos/{id}               # Get single video
GET    /videos/search?q=query     # Search videos
GET    /events                    # List events
GET    /shows                     # List shows
GET    /live                      # Get live streams
GET    /users/{id}/history        # Watch history
POST   /users/{id}/history        # Update progress
GET    /users/{id}/favorites      # Get favorites
POST   /users/{id}/favorites      # Add favorite
DELETE /users/{id}/favorites/{id} # Remove favorite
```

See [AWS_SETUP_GUIDE.md](./AWS_SETUP_GUIDE.md) for Lambda implementation examples.

## 🐛 Troubleshooting

### Video won't play
- Check S3 bucket permissions
- Verify signed URL generation
- Ensure video format is MP4/M4V
- Check CloudFront distribution if using CDN

### Authentication errors
- Verify Cognito User Pool configuration
- Check app client settings (no client secret)
- Confirm region matches in aws-config.js

### API not responding
- Check API Gateway endpoint URL
- Verify Lambda function permissions
- Review CloudWatch logs

## 📈 Roadmap

- [ ] Offline video downloads
- [ ] Push notifications for new content
- [ ] Social sharing features
- [ ] Picture-in-picture mode
- [ ] Chromecast/AirPlay support
- [ ] Admin CMS for content management
- [ ] Analytics dashboard
- [ ] Multiple video quality options (HLS)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- AWS Amplify team for excellent documentation
- Expo team for the amazing development platform
- React Native community

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@badgertv.com
- Documentation: [AWS_SETUP_GUIDE.md](./AWS_SETUP_GUIDE.md)

---

**Built with ❤️ for extreme sports enthusiasts**

