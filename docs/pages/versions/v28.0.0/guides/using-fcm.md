---
title: Using FCM for Push Notifications
---

Firebase Cloud Messaging is a popular option for delivering push notifications reliably. If you want your Expo Android app to get push notifications using your own FCM credentials, rather than our default option, you can do this with a couple of extra steps.

Note that FCM cannot be used to send messages to the Android Expo client. Also, FCM is not currently available for Expo iOS apps.

## Client Setup

1. If you have not already created a Firebase project for your app, do so now by clicking on **Add project** in the [Firebase Console](https://console.firebase.google.com/).

2. In your new project console, click **Add Firebase to your Android app** and follow the setup steps. **Make sure that the Android package name you enter is the same as the value of `android.package` in your app.json.**

3. Download the `google-services.json` file and place it in your Expo app's root directory.

4. In your app.json, add an `android.googleServicesFile` field with the relative path to the `google-services.json` file you just downloaded. If you placed it in the root directory, this will probably look like

```javascript
{
  ...
  "android": {
    "googleServicesFile": "./google-services.json",
    ...
  }
}
```

Finally, make a new build of your app by running `exp build:android`.

### ExpoKit projects

If you do the above setup before ejecting to ExpoKit, your FCM notifications will continue to work properly without any extra steps after ejecting. However, if your project is already ejected to ExpoKit and you want to set up FCM retroactively, you'll need to do the following:

1. Copy the same `google-services.json` file into the `android/app` directory. If that file already exists, you should overwrite it.

2. In `android/app/src/main/java/host/exp/exponent/generated/AppConstants.java` change `FCM_ENABLED` from `false` to `true`.

3. If your project is SDK 28 or below, you'll also need to add [these lines](https://github.com/expo/expo/blob/a44b8a65484d26a141550af59090c86432272ae5/template-files/android/AndroidManifest.xml#L270-L292) to `android/app/src/main/AndroidManifest.xml`.

## Uploading Server Credentials

In order for Expo to send notifications from our servers using your credentials, you'll need to upload your secret server key. You can find this key in the Firebase Console for your project:

1. At the top of the sidebar, click the **gear icon** to the right of **Project Overview** to go to your project settings.

2. Click on the **Cloud Messaging** tab in the Settings pane.

3. Copy the token listed next to **Server key**.

4. Run `exp push:android:upload --api-key <your-token-here>`, replacing `<your-token-here>` with the string you just copied. We'll store your token securely on our servers, where it will only be accessed when you send a push notification.

That's it -- users who run this new version of the app will now receive notifications through FCM using your project's credentials. You just send the push notifications as you normally would (see [guide](../push-notifications/#2-call-expos-push-api-with-the-users-token)). We'll take care of choosing the correct service to send the notification.
