# How to Build TrackNGo Android App (APK) 📱🚀

You can convert this website into a real Android App (.apk) using Capacitor!

## Prerequisites

1.  **Node.js** (Installed)
2.  **Android Studio** (Must be installed on your PC)
    *   Download from [developer.android.com/studio](https://developer.android.com/studio)
    *   During installation, ensure **Android SDK**, **Android SDK Command-line Tools**, and **Android SDK Platform-Tools** are selected.

## Step 1: Prepare the Project

The project is already configured for Android!

1.  Open a terminal in `d:\TrackNGo`.
2.  Run the build command to generate the web assets:
    ```bash
    npm run build
    ```
3.  Sync the web assets to the Android project:
    ```bash
    npx cap sync android
    ```

## Step 2: Open in Android Studio

1.  Launch **Android Studio**.
2.  Click **Open** and select the `d:\TrackNGo\android` folder.
3.  Wait for Gradle sync to finish (bottom status bar).

## Step 3: Run on Emulator or Device

### Option A: Run on Android Emulator (Virtual Phone)
1.  In Android Studio, click on **Device Manager** (top-right icon, looks like a phone).
2.  Create a virtual device (e.g., Pixel 6) if none exists.
3.  Click the version (e.g., API 33) to download the system image.
4.  Once created, select the device in the top toolbar.
5.  Click the green **Run (Play)** button.
6.  The app will launch in the emulator!

### Option B: Run on Real Android Phone
1.  Connect your Android phone to PC via USB.
2.  Enable **Developer Options** on your phone:
    *   Go to Settings > About Phone.
    *   Tap **Build Number** 7 times until it says "You are a developer".
3.  Enable **USB Debugging** in Developer Options.
4.  In Android Studio, select your phone in the device dropdown.
5.  Click the green **Run (Play)** button.

## Step 4: Build APK for Sharing

To get the actual `.apk` file to share with friends:

1.  In Android Studio, go to **Build** menu > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2.  Wait for the build to complete.
3.  Click **locate** in the notification bubble (bottom right).
4.  The APK file will be in `d:\TrackNGo\android\app\build\outputs\apk\debug\app-debug.apk`.
5.  Transfer this file to any Android phone and install it!

## Troubleshooting

### "Cleartext HTTP traffic not permitted"
-   This error happens if your backend URL is `http://` instead of `https`.
-   **Fix:** Ensure `android:usesCleartextTraffic="true"` is in `android/app/src/main/AndroidManifest.xml` (already added).

### "Connection Refused"
-   Ensure your backend is running (`npm start` in `backend` folder).
-   Ensure your phone is on the **SAME WiFi network** as your PC.
-   Update `VITE_API_URL` in `.env` to your PC's local IP (e.g., `http://10.70.87.24:8080`). Re-run `npm run build` & `npx cap sync` after changing IP.

### "SDK location not found"
-   Create a `local.properties` file in `android/` folder with:
    ```properties
    sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
    ```
