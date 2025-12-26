# Release Notes

## Version 1.0.0 (2025-12-26)

### Major Changes
- Migrated all authentication and backend functionality from AWS to Supabase
- Refactored all main screens (Home, Events, Live TV, Search, Library) to use Supabase data
- Created Supabase tables for videos, events, favorites, history, and live streams
- Removed all AWS Amplify code and dependencies
- Cleaned up unused files, test/debug code, and console.logs
- Ensured no ESLint or build errors

### Features
- Home screen displays videos, live streams, and upcoming events from Supabase
- Events and Live TV screens fetch real-time data from Supabase
- Search and Library screens use Supabase for all user data

### Notes
- Ready for deployment to App Store and Play Store
- Next steps: update store metadata, branding assets, and run EAS build
