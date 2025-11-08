# Guest Mode - Optional Authentication

## Overview
Badger TV now implements a **guest-first** approach where users can browse and watch content without creating an account. Authentication is only requested when users want to access premium features.

## Philosophy

### ✅ What We Believe
- **Remove friction** - Let users experience your content immediately
- **Earn trust first** - Show value before asking for commitment  
- **Respect user choice** - Make signup beneficial, not mandatory
- **Grow faster** - Larger audience without login walls

### 🚫 What We Avoid
- Forcing signup before content access
- Paywalls that block basic features
- Aggressive "Sign up now!" popups
- Losing users to registration friction

## User Experience

### Guest User Journey
```
1. Open App
   └─> Immediately see Home screen
       └─> No login required
       └─> No splash screen asking for signup

2. Browse Content
   ├─> Home: Latest videos, featured content
   ├─> Events: Upcoming SkyFall events  
   ├─> Live TV: Streaming channels
   └─> Search: Find any content

3. Watch Videos
   └─> Tap any video → Plays instantly
       └─> No "Sign up to watch" popup
       └─> Full video playback experience

4. Profile Tab (Guest View)
   └─> Beautiful benefits screen
       ├─> "Welcome to Badger TV!"
       ├─> Shows what they're missing:
       │   ├─> Save Favorites
       │   ├─> Continue Watching
       │   ├─> Get Notifications
       │   ├─> Exclusive Content
       │   └─> Merch & Giveaways
       ├─> "CREATE FREE ACCOUNT" button
       └─> "You can continue browsing as guest" note

5. Try Premium Feature
   └─> Tap "Favorite" on video
       └─> AuthPrompt modal appears:
           ├─> "Create a free account"
           ├─> "Sign up to save favorites"
           ├─> Shows benefits
           ├─> "CREATE FREE ACCOUNT" button
           └─> "Maybe Later" button
```

### Authenticated User Journey
```
1. Create Account
   └─> From Profile tab or AuthPrompt

2. Full Features Unlocked
   ├─> Save favorites (synced across devices)
   ├─> Continue watching (progress tracking)
   ├─> Get notifications (for new content)
   ├─> Access exclusive content
   └─> Participate in giveaways

3. Profile Tab (Authenticated View)
   └─> User avatar and username
   ├─> Stats: Watched count, Favorites count
   ├─> Account settings
   ├─> Watch history
   ├─> My favorites
   ├─> Notifications preferences
   └─> Sign out option
```

## Features Comparison

| Feature | Guest User | Authenticated User |
|---------|------------|-------------------|
| Browse Home | ✅ Yes | ✅ Yes |
| Search Content | ✅ Yes | ✅ Yes |
| Watch Videos | ✅ Yes | ✅ Yes |
| View Events | ✅ Yes | ✅ Yes |
| Live TV | ✅ Yes | ✅ Yes |
| Save Favorites | ❌ Requires auth | ✅ Yes |
| Watch Progress | ❌ Not tracked | ✅ Synced |
| Notifications | ❌ Requires auth | ✅ Yes |
| Exclusive Content | ❌ Requires auth | ✅ Yes |
| Personalization | ❌ None | ✅ Recommendations |
| Multiple Devices | ❌ No sync | ✅ Full sync |

## Implementation Details

### Key Components

**1. AuthContext (`src/context/AuthContext.js`)**
```javascript
// New properties:
isGuest: true/false  // Tracks if user is in guest mode
isAuthenticated: !!user  // True only if user is logged in

// Guest mode is default:
const [isGuest, setIsGuest] = useState(true);

// Set to false on successful sign in:
setIsGuest(false);

// Reset to true on sign out:
setIsGuest(true);
```

**2. App Navigation (`App.js`)**
```javascript
// Before: Required authentication
{!isAuthenticated ? <LoginScreen /> : <MainApp />}

// After: Always show main app
<Stack.Navigator>
  <Stack.Screen name="Root" component={RootTabs} />
  <Stack.Screen name="Login" component={LoginScreen} />
</Stack.Navigator>

// Login is now a modal accessible from anywhere
```

**3. Profile Screen (`src/screens/ProfileScreen.js`)**
```javascript
// Two completely different views:

if (isGuest) {
  return <GuestWelcomeScreen />; // Benefit showcase
} else {
  return <AuthenticatedProfile />; // Full profile
}
```

**4. AuthPrompt Component (`src/components/AuthPrompt.js`)**
```javascript
// Reusable modal for requesting authentication
<AuthPrompt
  visible={showPrompt}
  feature="save favorites"
  benefits={['Sync across devices', 'Never lose your favorites']}
  onLogin={() => navigation.navigate('Login')}
  onClose={() => setShowPrompt(false)}
/>
```

### When to Show AuthPrompt

Trigger the authentication prompt when users try to:
- ❤️ Add video to favorites
- 📊 View watch history
- 🔔 Enable notifications
- 🔒 Access exclusive/premium content
- 💾 Save progress/preferences
- 🎁 Enter giveaways/contests

**Example Implementation:**
```javascript
const handleFavorite = () => {
  if (isGuest || !isAuthenticated) {
    setShowAuthPrompt(true);
  } else {
    // Actually add to favorites
    addFavorite(videoId);
  }
};
```

## Best Practices

### ✅ DO
- Let guests browse and watch freely
- Make the guest experience excellent
- Show clear value propositions for signing up
- Allow "Maybe Later" - respect their choice
- Make signup process quick and simple
- Sync data immediately after signup

### ❌ DON'T
- Block content behind forced registration
- Show auth prompts on every screen
- Make UI feel "limited" for guests
- Nag users repeatedly to sign up
- Require credit card for "free" account
- Hide the fact that guest mode exists

## Future Enhancements

### Phase 1: Basic Guest Mode (✅ Complete)
- [x] Remove auth requirement from app entry
- [x] Guest mode support in AuthContext
- [x] Guest-friendly Profile screen
- [x] AuthPrompt component for optional features

### Phase 2: Enhanced Guest Experience
- [ ] Guest watch history (local only, not synced)
- [ ] Guest favorites (local only, with prompt to sync)
- [ ] "Sign up to sync" button in guest features
- [ ] Import local data when user creates account

### Phase 3: Progressive Disclosure
- [ ] After watching 3 videos: "Enjoying Badger TV? Create account"
- [ ] After 7 days: "Save your progress - create free account"
- [ ] Context-aware prompts based on behavior
- [ ] A/B test different prompt strategies

### Phase 4: Social Proof
- [ ] Show "X users saved this video" counts
- [ ] Community features (requires auth)
- [ ] Leaderboards/badges (requires auth)
- [ ] Referral program (requires auth)

## Success Metrics

Track these metrics to measure guest mode effectiveness:

**Engagement Metrics:**
- Guest user retention (Day 1, 7, 30)
- Videos watched per guest session
- Time to first video play
- Search usage by guests

**Conversion Metrics:**
- Guest → Signup conversion rate
- Which features trigger most signups
- Time from first visit to signup
- Auth prompt → signup conversion rate

**Content Metrics:**
- Most watched videos by guests
- Content discovery patterns
- Search queries without login
- Abandoned favorites (guest tried to save)

## Inspiration

This guest-first approach is used by:
- **YouTube** - Watch freely, sign in for subscriptions/history
- **Red Bull TV** - Full access, account for personalization
- **Tubi** - Free streaming, account for progress tracking
- **TikTok** - Browse endlessly, account for following/posting

## Support

If you have questions about guest mode implementation:
1. Check this guide
2. Review code in `src/context/AuthContext.js`
3. See example in `src/screens/ProfileScreen.js`
4. Test AuthPrompt in `src/components/AuthPrompt.js`

---

**Remember:** The best signup flow is one the user *wants* to complete, not one they're *forced* to complete.
