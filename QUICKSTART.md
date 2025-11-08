# BadgerTV Quick Start

Welcome to BadgerTV! This guide will get you up and running in minutes.

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

This will:
- Start the Expo Metro bundler
- Show a QR code
- Open in your browser

### 3. Run on Device

**iOS Simulator (Mac only):**
- Press `i` in the terminal

**Android Emulator:**
- Press `a` in the terminal

**Physical Device:**
- Install "Expo Go" app
- Scan the QR code

## 📱 Current Status

### ✅ What Works Now (Without AWS)

The app runs with **local test data** and includes:

- ✅ Full UI/UX (Home, Events, Live TV, Search, Profile)
- ✅ Navigation between screens
- ✅ Sample content browsing
- ✅ Video player UI (needs AWS for actual playback)
- ✅ Authentication UI (needs AWS Cognito to function)

### 🔧 What Needs AWS Setup

To enable full functionality:

1. **Authentication** - User signup, login, logout
   - Requires: AWS Cognito User Pool
   
2. **Video Playback** - Actual video streaming
   - Requires: S3 bucket with videos
   
3. **Dynamic Content** - Real data from backend
   - Requires: DynamoDB + API Gateway

## 🔐 Testing Authentication (Demo Mode)

Currently, the app shows the login screen but cannot authenticate without AWS Cognito.

**To bypass authentication for testing:**

Edit `src/context/AuthContext.js` temporarily:

```javascript
// Add this at the top of checkAuthState function:
const checkAuthState = async () => {
  try {
    setLoading(true);
    // TEMPORARY: Mock user for testing
    setUser({ username: 'demo', attributes: { email: 'demo@test.com' } });
    setLoading(false);
    return; // Remove this to re-enable real auth
    
    // ... rest of function
```

This will skip login and go straight to the app.

**Remember to remove this before production!**

## 🎥 Testing Video Player

To test the video player without AWS:

1. Go to any video card in the app
2. Add an `onPress` handler to navigate to VideoPlayer:

```javascript
// In VideoCard.js or any video component
import { useNavigation } from '@react-navigation/native';

const VideoCard = ({ video }) => {
  const navigation = useNavigation();
  
  const handlePress = () => {
    navigation.navigate('VideoPlayer', {
      videoId: video.id,
      title: video.title,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Test video
    });
  };
  
  return (
    <TouchableOpacity onPress={handlePress}>
      {/* ... */}
    </TouchableOpacity>
  );
};
```

This uses a public test video URL.

## 🗄️ Setting Up AWS (30-60 minutes)

For full functionality, follow these steps:

### Step 1: Create AWS Account
- Go to aws.amazon.com
- Sign up (free tier available)
- Provide payment method

### Step 2: Set Up Cognito
```bash
# Follow instructions in AWS_SETUP_GUIDE.md
# Section 1: AWS Cognito - Authentication
```

You'll need:
- User Pool ID
- App Client ID
- Region

### Step 3: Update Configuration

Edit `src/config/aws-config.js`:
```javascript
const awsConfig = {
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_XXXXXXXXX', // Replace with your User Pool ID
    userPoolWebClientId: 'YOUR_APP_CLIENT_ID', // Replace with your App Client ID
  },
  // ... rest of config
};
```

### Step 4: Test Authentication
- Restart the app: `npm start`
- Try signing up with a real email
- Verify your email
- Log in

### Step 5: Set Up Content (Optional)

For video playback and dynamic content:
1. Create S3 bucket (AWS_SETUP_GUIDE.md Section 3)
2. Create DynamoDB tables (Section 2)
3. Set up API Gateway (Section 5)

## 📚 Documentation

- **[README.md](./README.md)** - Project overview
- **[AWS_SETUP_GUIDE.md](./AWS_SETUP_GUIDE.md)** - Complete AWS setup
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Development best practices
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deploy to App Store/Play Store

## 🐛 Common Issues

### "Network request failed" errors
- **Cause**: AWS not configured or wrong credentials
- **Fix**: Update `aws-config.js` with correct values

### Can't see the app in Expo Go
- **Cause**: Different network or firewall
- **Fix**: Use tunnel mode: `expo start --tunnel`

### Metro bundler errors
- **Fix**: Clear cache: `npm start -- --reset-cache`

### Videos won't play
- **Cause**: No S3 bucket or invalid URLs
- **Fix**: Use test URL (see "Testing Video Player" above)

## 🎯 Next Steps

1. **Explore the UI** - Navigate through all screens
2. **Review the code** - Check out `src/` directory structure
3. **Set up AWS** - Follow AWS_SETUP_GUIDE.md for production features
4. **Customize** - Update colors, add your content, modify UI
5. **Test** - Try on different devices and screen sizes

## 🤝 Need Help?

- **Documentation**: Check the guide files in the root directory
- **Issues**: Open a GitHub issue
- **Questions**: Contact the development team

## 🎨 Quick Customization

### Change App Colors

Edit `src/constants/colors.js`:
```javascript
export const COLORS = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  ORANGE: '#FF6B35', // Change this to your brand color
};
```

### Change App Name

Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

### Add Your Logo

Replace these files in `assets/`:
- `icon.png` - App icon (1024x1024)
- `splash.png` - Splash screen
- `adaptive-icon.png` - Android icon

## ✅ Checklist

Before considering the app "complete":

- [ ] AWS Cognito configured
- [ ] S3 bucket created with test videos
- [ ] DynamoDB tables created
- [ ] API Gateway deployed
- [ ] App tested on iOS
- [ ] App tested on Android
- [ ] Authentication flow working
- [ ] Video playback working
- [ ] Search functioning
- [ ] Profile features working
- [ ] Error handling implemented
- [ ] Loading states everywhere
- [ ] App icon and splash screen updated
- [ ] Privacy policy created
- [ ] Terms of service created

---

**You're all set! Start the app with `npm start` and begin development.** 🎉

For detailed AWS setup, see [AWS_SETUP_GUIDE.md](./AWS_SETUP_GUIDE.md)
