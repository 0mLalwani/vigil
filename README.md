A small real-time chat app with **Clerk** sign-in, live **Socket.io** messages, typing indicators, online presence.

## Features

- Google sign-in with Clerk
- Real-time one-to-one messaging over Socket.IO
- Optimistic sends with rollback on failure
- Typing indicators and online presence
- Unread badges and last-message previews
- Persistent chat history in **MongoDB**

## Tech stack

**App**

- Expo SDK 58, React Native 0.88, React 19
- Expo Router
- NativeWind 4 with Tailwind CSS 3
- TanStack Query 5
- Clerk Expo
- socket.io-client
- Axios, date-fns, expo-image

**API**

- Bun
- Express 5
- Socket.IO 4
- MongoDB with Mongoose 9
- Clerk Express
- TypeScript

## Getting started

### Requirements

- Bun
- A MongoDB database, local or Atlas
- A Clerk project with Google OAuth enabled
- Android Studio or Xcode for a local build, or an Expo account for EAS

### 1. API

```bash
cd backend-api
bun install

cp .env.example .env
```

Fill in backend-api/.env:

```
PORT	(defaults to 6969)
MONGO   mongo_uri
CLERK_PUBLISHABLE_KEY	Clerk publishable key
CLERK_SECRET_KEY	Clerk secret key
```

Run

```
bun dev
```

### 2. App

```bash
cd expo-app
bun install
cp .env.example .env
```

Fill in expo-app/.env:

```
EXPO_PUBLIC_API_URL	API base_url
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY	Clerk publishable key
```

Build and run:

```
bunx expo run:android
# or
bunx expo run:ios
```

### 3. Clerk

- Expo Go will not work because Clerk ships a native module. Use a development build.
- Keep the secret key on the server only.

## Todos

- A better startup page
- A splash screen
- Remove all else and add ONLY vigil:// as an allowed redirect in clerk
- Restrict the Socket.IO CORS origin before a public launch.
- Add rate limiting and a message length limit to send-message.
- Make the UI better, and put demo GIF's on the readme
