# BadgerTV Deployment Guide

Complete guide for deploying BadgerTV to production (App Store & Google Play).

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [EAS Build Setup](#eas-build-setup)
3. [iOS Deployment](#ios-deployment)
4. [Android Deployment](#android-deployment)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Post-Deployment](#post-deployment)

---

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All features tested on iOS and Android
- [ ] No console errors or warnings
- [ ] Authentication flow fully functional
- [ ] Video playback working with signed URLs
- [ ] All screens responsive and performant
- [ ] Error handling implemented everywhere
- [ ] Loading states for all async operations

### ✅ AWS Backend
- [ ] Cognito User Pool configured
- [ ] DynamoDB tables created and populated
- [ ] S3 bucket with sample content
- [ ] CloudFront distribution (if using)
- [ ] API Gateway deployed to production
- [ ] Lambda functions tested
- [ ] IAM permissions configured correctly
- [ ] CloudWatch logs enabled

### ✅ App Configuration
- [ ] `aws-config.js` updated with production values
- [ ] App name and bundle ID set correctly
- [ ] Version numbers updated in `app.json`
- [ ] Privacy policy URL added
- [ ] Terms of service URL added
- [ ] Support email configured
- [ ] Icons and splash screens finalized

### ✅ Legal & Compliance
- [ ] Privacy policy written and hosted
- [ ] Terms of service written and hosted
- [ ] COPPA compliance (if targeting under 13)
- [ ] GDPR compliance (if targeting EU)
- [ ] Copyright for all media assets

---

## EAS Build Setup

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```

### 3. Configure EAS

```bash
eas build:configure
```

This creates `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "AWS_REGION": "us-east-1"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 4. Update app.json

```json
{
  "expo": {
    "name": "Badger TV",
    "slug": "badger-tv",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.badgertv",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "This app does not use the camera.",
        "NSMicrophoneUsageDescription": "This app does not use the microphone."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      },
      "package": "com.yourcompany.badgertv",
      "versionCode": 1,
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    },
    "plugins": [
      "expo-av"
    ]
  }
}
```

---

## iOS Deployment

### 1. Apple Developer Account

1. Enroll in [Apple Developer Program](https://developer.apple.com/programs/) ($99/year)
2. Create App ID:
   - Go to **Certificates, Identifiers & Profiles**
   - Create new **Identifier**
   - Select **App IDs**
   - Bundle ID: `com.yourcompany.badgertv`
   - Enable capabilities: None required (or add as needed)

### 2. App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in details:
   - Platform: iOS
   - Name: Badger TV
   - Primary Language: English
   - Bundle ID: Select the one you created
   - SKU: `badgertv-ios`
   - User Access: Full Access

### 3. Prepare App Store Listing

**Required Screenshots** (use iOS simulator):
- 6.7" Display (iPhone 14 Pro Max): 1290 x 2796
- 6.5" Display (iPhone 11 Pro Max): 1242 x 2688
- 5.5" Display (iPhone 8 Plus): 1242 x 2208

Screens to capture:
1. Home screen with hero content
2. Events listing
3. Search results
4. Video player
5. Profile screen

**App Information:**
- App Name: Badger TV
- Subtitle: Extreme Sports Streaming
- Description: (Write compelling 4000 character description)
- Keywords: skiing, snowboarding, extreme sports, streaming, videos
- Support URL: https://yourwebsite.com/support
- Marketing URL: https://yourwebsite.com
- Privacy Policy URL: https://yourwebsite.com/privacy

**Age Rating:**
- Go through questionnaire (likely 12+ for sports content)

**App Review Information:**
- First Name, Last Name, Phone, Email
- Demo Account:
  - Username: `demo@badgertv.com`
  - Password: `DemoPass123!`
- Notes: Explain that AWS backend is required

### 4. Build for iOS

```bash
# Build for App Store
eas build --platform ios --profile production

# This will:
# 1. Prompt for Apple ID credentials
# 2. Create signing certificates
# 3. Build the app
# 4. Upload to EAS servers
```

### 5. Submit to App Store

```bash
# Automatic submission
eas submit --platform ios --latest

# Or manual:
# 1. Download .ipa from EAS
# 2. Upload via Transporter app
# 3. Select build in App Store Connect
# 4. Submit for review
```

### 6. App Review Process

- Initial review: 1-3 days typically
- Be responsive to any questions from Apple
- Common rejection reasons:
  - Missing demo account
  - Crashes on launch
  - Incomplete functionality
  - Privacy policy issues

---

## Android Deployment

### 1. Google Play Console

1. Create account at [Google Play Console](https://play.google.com/console) ($25 one-time)
2. Create new app:
   - App name: Badger TV
   - Default language: English
   - App or game: App
   - Free or paid: Free

### 2. Prepare Play Store Listing

**Store Listing:**
- App name: Badger TV
- Short description (80 chars): Stream extreme sports events and shows
- Full description (4000 chars): Write detailed description
- App icon: 512 x 512 PNG
- Feature graphic: 1024 x 500 JPG/PNG
- Screenshots (minimum 2):
  - Phone: 16:9 or 9:16 ratio
  - Tablet (optional): 16:9 or 9:16 ratio

**Categorization:**
- App category: Entertainment
- Content rating: Apply for rating via questionnaire

**Contact details:**
- Email: support@yourcompany.com
- Phone: Optional
- Website: https://yourwebsite.com

**Privacy Policy:**
- URL: https://yourwebsite.com/privacy

### 3. Generate Signing Keys

EAS handles this automatically, or create manually:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore badgertv.keystore -alias badgertv -keyalg RSA -keysize 2048 -validity 10000
```

Store credentials securely!

### 4. Build for Android

```bash
# Build for Play Store
eas build --platform android --profile production

# This creates an .aab (Android App Bundle)
```

### 5. Internal Testing Track

1. Create **Internal testing** release
2. Upload .aab file
3. Add testers (email addresses)
4. Test thoroughly before production

### 6. Submit to Play Store

```bash
# Automatic submission
eas submit --platform android --latest
```

Or manual:
1. Go to **Production** → **Create new release**
2. Upload .aab file
3. Fill in release notes
4. Review and roll out

### 7. Review Process

- Faster than iOS (usually hours to 1 day)
- May require data safety form completion
- Ensure app meets Google Play policies

---

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy BadgerTV

on:
  push:
    branches:
      - main
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          
      - name: Build iOS
        run: eas build --platform ios --profile production --non-interactive
        
      - name: Build Android
        run: eas build --platform android --profile production --non-interactive
        
      - name: Submit to stores
        if: startsWith(github.ref, 'refs/tags/')
        run: |
          eas submit --platform ios --latest --non-interactive
          eas submit --platform android --latest --non-interactive
```

### Required Secrets

Add to GitHub repository settings:
- `EXPO_TOKEN`: From `eas whoami` → Account settings
- `APPLE_ID`: Your Apple ID
- `APPLE_APP_SPECIFIC_PASSWORD`: Generated at appleid.apple.com
- `GOOGLE_SERVICE_ACCOUNT_KEY`: From Play Console

---

## Post-Deployment

### 1. Monitoring

**AWS CloudWatch:**
```bash
# Set up alarms for:
- API Gateway errors (> 5% error rate)
- Lambda function errors
- Cognito failed logins
- DynamoDB throttling
```

**App Analytics:**
- Set up Firebase Analytics or Amplitude
- Track key events:
  - User signups
  - Video plays
  - Search queries
  - Favorites added

### 2. Crash Reporting

Add Sentry:
```bash
npm install @sentry/react-native
```

Configure in `App.js`:
```javascript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
});
```

### 3. User Feedback

- Monitor app store reviews
- Set up in-app feedback form
- Create support ticketing system
- Respond to reviews promptly

### 4. Updates

**Patch/Minor Updates:**
```bash
# Increment version
npm version patch  # 1.0.0 → 1.0.1

# Build and submit
eas build --platform all --profile production
eas submit --platform all --latest
```

**Over-the-Air (OTA) Updates:**
For JS-only changes:
```bash
eas update --branch production --message "Fix login bug"
```

### 5. Performance Monitoring

Key metrics to track:
- App launch time
- Video start time
- API response times
- Crash-free rate (target: >99%)
- User retention (Day 1, Day 7, Day 30)

---

## Rollback Plan

If critical issue discovered:

1. **Stop rollout** in Play Console (if phased)
2. **Remove app** from sale (temporary) in App Store Connect
3. **Fix issue** in codebase
4. **Deploy patch** with expedited review request
5. **Monitor** closely after re-release

---

## Version Management

Recommended versioning strategy:
- **Major** (1.0.0): Breaking changes, major features
- **Minor** (1.1.0): New features, backwards compatible
- **Patch** (1.0.1): Bug fixes only

Update in:
- `package.json` → `version`
- `app.json` → `expo.version`
- `app.json` → `expo.ios.buildNumber`
- `app.json` → `expo.android.versionCode`

---

## Support Resources

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)

---

## Cost Estimates

**Expo EAS:**
- Free tier: 30 builds/month
- Production: $29/month unlimited builds

**Apple:**
- Developer Program: $99/year

**Google:**
- Play Console: $25 one-time

**AWS (estimated for 1000 users):**
- Cognito: ~$5/month
- DynamoDB: ~$10/month
- S3 + CloudFront: ~$50-200/month (depending on usage)
- API Gateway + Lambda: ~$10/month

**Total first year:** ~$500-1000 depending on usage

---

**Good luck with your launch! 🚀**
