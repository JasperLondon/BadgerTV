# BadgerTV Development Guide

Guidelines for developers working on the BadgerTV project.

## Table of Contents
1. [Development Environment](#development-environment)
2. [Code Style & Standards](#code-style--standards)
3. [Project Architecture](#project-architecture)
4. [Testing Strategy](#testing-strategy)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting](#troubleshooting)

---

## Development Environment

### Required Tools

- **Node.js** 18+ (LTS)
- **npm** 9+
- **Expo CLI** (installed globally)
- **Git**
- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - React Native Tools
  - ES7+ React/Redux snippets

### iOS Development
- **macOS** required
- **Xcode** 14+ (from Mac App Store)
- **iOS Simulator** (comes with Xcode)
- Command Line Tools: `xcode-select --install`

### Android Development
- **Android Studio** (any OS)
- **Android SDK** (API 33+)
- **Android Emulator** or physical device
- Set `ANDROID_HOME` environment variable

### AWS Development
- **AWS CLI** configured with credentials
- **AWS Console** access
- **DynamoDB** local for testing (optional)

---

## Code Style & Standards

### JavaScript/React Native

**Use functional components with hooks:**
```javascript
// ✅ Good
const VideoCard = ({ title, thumbnail }) => {
  const [loading, setLoading] = useState(false);
  
  return (
    <View style={styles.card}>
      <Text>{title}</Text>
    </View>
  );
};

// ❌ Bad
class VideoCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }
  // ...
}
```

**Destructure props:**
```javascript
// ✅ Good
const HeroCard = ({ title, image, onPress }) => { ... };

// ❌ Bad
const HeroCard = (props) => {
  return <Text>{props.title}</Text>;
};
```

**Use async/await over .then():**
```javascript
// ✅ Good
const loadData = async () => {
  try {
    const data = await API.getVideos();
    setVideos(data);
  } catch (error) {
    console.error(error);
  }
};

// ❌ Bad
const loadData = () => {
  API.getVideos().then(data => {
    setVideos(data);
  }).catch(error => {
    console.error(error);
  });
};
```

### Styling Guidelines

**Use StyleSheet.create:**
```javascript
import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BLACK,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
});
```

**Naming conventions:**
- Components: PascalCase (`VideoCard.js`)
- Files: camelCase (`authService.js`)
- Constants: UPPER_SNAKE_CASE (`API_ENDPOINT`)
- Styles: camelCase (`titleText`, `cardContainer`)

**Component organization:**
```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

// 2. Constants
const MAX_ITEMS = 10;

// 3. Component
const MyComponent = ({ data }) => {
  // 4. Hooks
  const [items, setItems] = useState([]);
  
  // 5. Effects
  useEffect(() => {
    loadItems();
  }, []);
  
  // 6. Functions
  const loadItems = async () => {
    // ...
  };
  
  // 7. Render
  return (
    <View>
      <Text>Content</Text>
    </View>
  );
};

// 8. Styles
const styles = StyleSheet.create({
  // ...
});

// 9. Export
export default MyComponent;
```

---

## Project Architecture

### Context Pattern

**When to use Context:**
- Global state (auth, theme)
- Shared data across many components
- Avoiding prop drilling

**AuthContext example:**
```javascript
// 1. Create context
const AuthContext = createContext({});

// 2. Create provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  const signIn = async (username, password) => {
    // Implementation
  };
  
  return (
    <AuthContext.Provider value={{ user, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// 4. Use in components
const LoginScreen = () => {
  const { signIn } = useAuth();
  // ...
};
```

### Service Layer Pattern

Keep API calls in `src/services/`:
```javascript
// src/services/api.js
export const getVideos = async (category) => {
  try {
    const response = await API.get('videos', { category });
    return response;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

// In component
import { getVideos } from '../services/api';

const HomeScreen = () => {
  const loadVideos = async () => {
    const videos = await getVideos('featured');
    setVideos(videos);
  };
};
```

### Navigation Structure

```
App.js (NavigationContainer)
├── AuthProvider
│   └── VideoProvider
│       └── AppNavigator
│           ├── LoginScreen (if not authenticated)
│           └── RootTabs (if authenticated)
│               ├── HomeScreen
│               ├── EventsScreen
│               ├── LiveTVScreen
│               ├── SearchScreen
│               └── ProfileScreen
```

---

## Testing Strategy

### Manual Testing Checklist

**Authentication Flow:**
- [ ] Sign up with new user
- [ ] Verify email code
- [ ] Sign in with existing user
- [ ] Sign out
- [ ] Forgot password flow
- [ ] Invalid credentials handling
- [ ] Session persistence (close/reopen app)

**Video Playback:**
- [ ] Play video from home
- [ ] Play video from search
- [ ] Pause/resume
- [ ] Seek forward/backward
- [ ] Progress saving
- [ ] Handle network errors
- [ ] Close video player
- [ ] Multiple videos in sequence

**Content Browsing:**
- [ ] Home screen loads
- [ ] Events screen loads
- [ ] Live TV screen loads
- [ ] Search returns results
- [ ] Scroll performance
- [ ] Image loading
- [ ] Empty states
- [ ] Error states

**Profile Features:**
- [ ] View watch history
- [ ] View favorites
- [ ] Add/remove favorites
- [ ] Change password
- [ ] Sign out

### Device Testing Matrix

| Device Type | iOS Version | Android Version | Priority |
|------------|-------------|-----------------|----------|
| iPhone 14 Pro | 17.x | - | High |
| iPhone SE | 16.x | - | Medium |
| Pixel 7 | - | 13+ | High |
| Samsung Galaxy | - | 12+ | Medium |
| iPad | 17.x | - | Low |
| Tablet | - | 13+ | Low |

### Performance Testing

**Key Metrics:**
- App launch: < 3 seconds
- Screen navigation: < 300ms
- Video start: < 2 seconds
- Search results: < 1 second
- Image loading: < 1 second

**Tools:**
- React Native Debugger
- Flipper
- Xcode Instruments (iOS)
- Android Profiler

---

## Common Tasks

### Adding a New Screen

1. **Create screen file:**
```javascript
// src/screens/MyNewScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const MyNewScreen = ({ navigation, route }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My New Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BLACK,
  },
  title: {
    fontSize: 24,
    color: COLORS.WHITE,
  },
});

export default MyNewScreen;
```

2. **Add to navigation:**
```javascript
// App.js
import MyNewScreen from './src/screens/MyNewScreen';

<Stack.Screen name="MyNew" component={MyNewScreen} />
```

3. **Navigate to it:**
```javascript
navigation.navigate('MyNew', { param: 'value' });
```

### Adding a New API Endpoint

1. **Update Lambda function** (AWS)
2. **Add to api.js:**
```javascript
export const getNewData = async () => {
  try {
    const response = await API.get(API_NAME, '/new-endpoint');
    return response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

3. **Use in component:**
```javascript
import { getNewData } from '../services/api';

const data = await getNewData();
```

### Adding a New Component

```javascript
// src/components/MyComponent.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const MyComponent = ({ title, description }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
});

export default MyComponent;
```

### Debugging

**Enable Remote Debugging:**
- iOS: Cmd + D → Debug
- Android: Cmd + M → Debug

**View console logs:**
```javascript
console.log('Debug info:', variable);
console.error('Error:', error);
console.warn('Warning:', message);
```

**React Native Debugger:**
```bash
brew install react-native-debugger
```

**View network requests:**
- Use Flipper's Network plugin
- Or add console.log in api.js

---

## Troubleshooting

### Common Issues

**Metro bundler won't start:**
```bash
# Clear cache
npm start -- --reset-cache

# Or
expo start -c
```

**iOS build fails:**
```bash
cd ios
pod install
cd ..
npm run ios
```

**Android build fails:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**Can't find module:**
```bash
# Clear node_modules
rm -rf node_modules
npm install
```

**Authentication not working:**
- Check aws-config.js values
- Verify Cognito User Pool exists
- Check CloudWatch logs
- Test with Cognito console

**Videos won't play:**
- Check S3 bucket permissions
- Verify signed URL generation
- Test URL in browser
- Check video format (MP4)

**App crashes on startup:**
- Check for syntax errors
- Review recent changes
- Check Expo logs
- Test on different device

### Getting Help

1. **Check documentation:**
   - README.md
   - AWS_SETUP_GUIDE.md
   - DEPLOYMENT_GUIDE.md

2. **Search existing issues:**
   - GitHub Issues
   - Stack Overflow
   - Expo Forums

3. **Ask the team:**
   - Slack/Discord channel
   - Code review comments
   - Team meetings

4. **Debug systematically:**
   - Isolate the problem
   - Check logs
   - Test incrementally
   - Use debugger

---

## Git Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

Examples:
- `feature/add-download-functionality`
- `fix/video-player-crash`
- `refactor/api-service`

### Commit Messages

Format: `type: description`

Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Tests
- `chore:` - Maintenance

Examples:
```
feat: add favorites functionality to profile
fix: resolve video player progress tracking bug
docs: update AWS setup guide with CloudFront
refactor: simplify authentication context
```

### Pull Request Process

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with clear messages
5. Push to GitHub
6. Create PR with description
7. Request review
8. Address feedback
9. Merge when approved

---

## Best Practices

### Performance

- Use `React.memo()` for expensive components
- Implement virtualization for long lists (FlatList)
- Optimize images (compress, use WebP)
- Lazy load components when possible
- Cache API responses
- Debounce search inputs

### Security

- Never commit AWS credentials
- Use environment variables for secrets
- Validate all user inputs
- Sanitize data before display
- Use HTTPS only
- Implement rate limiting
- Keep dependencies updated

### User Experience

- Show loading states
- Handle errors gracefully
- Provide feedback for actions
- Support offline mode (where possible)
- Optimize for slow networks
- Test on real devices
- Consider accessibility

---

## Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [AWS Amplify Docs](https://docs.amplify.aws/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [JavaScript Info](https://javascript.info/)

---

**Happy coding! 🚀**
