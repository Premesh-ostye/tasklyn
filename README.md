# Tasklyn Expo MVP

React Native (Expo Router + TypeScript) starter wired to Firebase Auth/Firestore/Storage for a multi-tenant pub/venue job platform.

## Run it
- `npm install`
- Set the Firebase env vars (below)
- `npm start` then open iOS/Android/web via Expo CLI

## Firebase env vars
Add these to `app.json` `extra` or a `.env` file (Expo reads `EXPO_PUBLIC_*` at build time):
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

## Screens & flows
- Auth: email/password login + signup; signup writes `users/{uid}` (role defaults to `manager`).
- Role router: redirects by `users/{uid}.role` to `/admin`, `/manager`, or `/contractor` (creates default user doc if missing).
- Manager: home lists venues with active membership, create venue, create jobs, invite contractor (placeholder token), view jobs per venue.
- Contractor: home shows assigned jobs or pool broadcasts within venues where member is active; job detail allows posting comment updates.
- Admin (system_admin only): dev tools to change your role and seed a sample venue/job + contractor membership.

Notes: Firestore paths follow `users/{userId}`, `venues/{venueId}`, nested `members/jobs/updates/invites`. `serverTimestamp()` is used for audit fields; add security rules accordingly.
