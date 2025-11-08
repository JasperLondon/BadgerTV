# Bug Fixes - November 4, 2025

## Issues Fixed

### 1. Missing `assets/images` Directory
**Error:** `ENOENT: no such file or directory, scandir 'C:\Users\12403\BadgerTV\assets\images'`

**Fix:** Created the missing directory:
- Created `assets/images/` folder
- Added `.gitkeep` file to ensure directory is tracked

### 2. Missing AsyncStorage Dependency
**Error:** `Cannot find module '@react-native-async-storage/async-storage'`

**Fix:** Installed the required package:
```bash
npm install @react-native-async-storage/async-storage
```

### 3. AWS Amplify v6 API Changes

**Issue:** The codebase was using AWS Amplify v5 syntax, but the installed version is v6, which has breaking changes in the API structure.

**Fixes Applied:**

#### AuthContext.js
- Changed import from `{ Amplify, Auth }` to individual auth functions:
  ```javascript
  import { signUp, signIn, signOut, confirmSignUp, ... } from 'aws-amplify/auth';
  ```
- Updated all Auth function calls to use new v6 syntax:
  - `Auth.signUp()` → `signUp()`
  - `Auth.signIn()` → `signIn()`
  - `Auth.currentAuthenticatedUser()` → `getCurrentUser()`
  - `Auth.currentSession()` → `fetchAuthSession()`
- Added AsyncStorage configuration for token storage:
  ```javascript
  Amplify.configure(awsConfig, {
    storage: AsyncStorage
  });
  ```

#### api.js
- Changed imports from `{ API, Storage, Auth }` to modular imports:
  ```javascript
  import { get, post, del } from 'aws-amplify/api';
  import { getUrl } from 'aws-amplify/storage';
  import { getCurrentUser } from 'aws-amplify/auth';
  ```
- Updated all API calls to use new v6 promise-based syntax:
  - Old: `await API.get(name, path)`
  - New: `const op = get({ apiName, path }); const { body } = await op.response; return await body.json();`
- Created helper functions (`apiGet`, `apiPost`, `apiDelete`) to simplify repeated code
- Updated Storage calls:
  - Old: `await Storage.get(key, { expires, level })`
  - New: `await getUrl({ key, options: { expiresIn, accessLevel } })`

## Current Status

✅ **All errors resolved**
✅ **App starting successfully**
✅ **Metro bundler running**

## Testing Instructions

1. The app should now start without errors:
   ```bash
   npm start
   ```

2. You can test the app in several ways:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

3. **Note:** Authentication will not work until you configure AWS Cognito. The app will show the login screen but cannot authenticate without backend setup.

## Temporary Workaround for Testing

If you want to test the app without AWS setup, you can temporarily bypass authentication:

Edit `src/context/AuthContext.js` line 21:
```javascript
const checkAuthState = async () => {
  try {
    setLoading(true);
    // TEMPORARY: Mock user for testing UI
    setUser({ username: 'demo', userId: 'demo-123' });
    setLoading(false);
    return; // Remove this line to re-enable real auth
    
    // Original code below:
    const { username, userId, signInDetails } = await getCurrentUser();
    setUser({ username, userId, signInDetails });
```

**Remember to remove this before production!**

### 4. Missing NetInfo Dependency
**Error:** `Unable to resolve "@react-native-community/netinfo"`

**Fix:** Installed the required peer dependency:
```bash
npm install @react-native-community/netinfo
```

This package is required by AWS Amplify's api-graphql for network reachability monitoring.

### 5. AWS Config OAuth Error
**Error:** `TypeError: Cannot read property 'loginWith' of undefined`

**Cause:**
The AWS config had OAuth/social login configuration which requires additional native module setup. Amplify was trying to initialize OAuth features using `expo-web-browser`, but the config wasn't properly set up for Amplify v6.

**Fix:** Updated `aws-config.js` to:
- Use Amplify v6 config structure with nested `Auth.Cognito` 
- Removed OAuth configuration (not needed for basic email/password auth)
- Changed `userPoolWebClientId` to `userPoolClientId` (v6 naming convention)

---

## Major Feature Update: Guest Mode

### Change: Optional Authentication
**What changed:**
The app no longer requires users to sign up/login before using it. Users can now:
- Browse all content as a guest
- Watch videos without creating an account
- Access Home, Events, Live TV, and Search tabs freely
- Only prompted to sign up when accessing premium features

### Files Modified:

1. **src/context/AuthContext.js**
   - Added `isGuest` state (defaults to `true`)
   - Users start as guests and only authenticate when they choose to
   - Updated `signIn` and `signOut` to toggle guest mode

2. **App.js**
   - Removed authentication gate from navigation
   - All users (guest and authenticated) can access main app
   - Login screen is now a modal that can be accessed from anywhere

3. **src/screens/ProfileScreen.js**
   - Completely redesigned for guest users
   - Shows benefits of creating account with attractive UI
   - Lists features: Favorites, Continue Watching, Notifications, Exclusive Content, Merch Access
   - "Create Free Account" button navigates to login screen
   - Only shows full profile features for authenticated users

4. **src/components/AuthPrompt.js** (New File)
   - Reusable modal component for prompting authentication
   - Can be triggered from any feature requiring auth (favorites, history, etc.)
   - Shows customizable benefits based on context
   - "Maybe Later" option respects user choice

### Why This Matters:
✅ **Larger audience** - No signup friction means more users can try the app
✅ **Better UX** - Users see value before being asked to commit
✅ **Growth strategy** - Aligns with YouTube, Red Bull TV, Tubi model
✅ **User choice** - Account creation is incentivized, not forced

### User Experience Flow:
```
User opens app → Sees Home screen immediately (no login)
                ↓
User browses content → Watches videos freely
                ↓
User taps "Favorite" → Auth prompt: "Create account to save favorites"
                ↓
User decides → "Create Account" OR "Maybe Later"
```

## Next Steps

1. ✅ App runs without errors
2. ✅ Guest mode enabled - users can browse and watch freely
3. ⏳ Configure AWS Cognito (see AWS_SETUP_GUIDE.md)
4. ⏳ Update `src/config/aws-config.js` with real credentials
5. ⏳ Test authentication flow
6. ⏳ Set up S3 and DynamoDB for full functionality

## AWS Amplify v6 Migration Notes

The main breaking changes we addressed:
- Modular imports instead of single `aws-amplify` import
- Auth functions are standalone, not on `Auth` object
- API calls return operation objects that must be awaited twice
- Storage functions renamed and use different parameters
- AsyncStorage must be explicitly configured

For full v6 migration guide: https://docs.amplify.aws/gen1/javascript/build-a-backend/auth/migration/

---

**All issues resolved! The app is ready for development and testing.**
