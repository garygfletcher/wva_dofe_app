# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## WVA Operational Commands

### 1. Send a push notification test
Use this to verify an Expo push token is valid and receiving notifications.

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[w4wVlbD-05PlhattlSCnHK]",
    "title": "WVA Test",
    "body": "Push test from TestFlight build."
  }'
```

Expected response (example):

```json
{"data":{"status":"ok","id":"019c5a3e-a2ae-7077-af4d-e94ace0bd9ed"}}
```

### 2. Start Metro with a clean cache
Use this when local bundling is behaving oddly or stale cache is suspected.

```bash
npx expo start -c
```

### 3. Run a clean iOS production build with EAS
Builds iOS using the `production` profile and clears EAS build cache.

```bash
eas build -p ios --profile production --clear-cache
```

### 4. Submit iOS build to App Store Connect
Submits the latest iOS build artifact configured for this project.

```bash
eas submit -p ios
```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
