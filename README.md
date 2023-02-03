# TimberSmart Go

## Upgrade Notes

**This project utilizes Microsoft's CodePush to provide OTA updates**

**Method 1:** If you are making changes to packages, you must bump the minor version using

1. npm run bump-minor
2. Set the _cpVersion_ in package.json to empty
3. Set _cleartext_ in package.json depending on the build type
4. Check the code in
5. npm run push-base-tag

**Method 2:** If you are making changes to code, you can bump the patch version using

1. npm run bump-patch
2. Set the cpVersion in package.json to 0.0.1 increment
3. Check the code in
4. Optional: npm run push-latest-tag (Post command script will automatically execute this)

## Release Process

**Method 1:** Use the "polling" mechanism to force all clients to upgrade (BEWARE this will affect all clients)

**Method 2:** All clients on the same base version will receive prompt to update next time they open the app

## Tips & Tricks

### CodePush command

npm run codepush:deploy -- --description="Build 1.10.0"

### Debug from Command Prompt

adb logcat \*:S ReactNative:V ReactNativeJS:V

### Temporary fix for production build

Source: https://github.com/facebook/react-native/issues/22234

Edit the /node_modules/react-native/react.gradle file
and add the doLast right after the doFirst block, manually.

```javascript
doFirst { ... }
doLast {
    def moveFunc = { resSuffix ->
        File originalDir = file("$buildDir/generated/res/react/release/drawable-${resSuffix}");
        if (originalDir.exists()) {
            File destDir = file("$buildDir/../src/main/res/drawable-${resSuffix}");
            ant.move(file: originalDir, tofile: destDir);
        }
    }
    def moveRawFunc = { resSuffix ->  // Added my Chris
        File originalDir = file("$buildDir/generated/res/react/release/${resSuffix}");
        if (originalDir.exists()) {
            File destDir = file("$buildDir/../src/main/res/${resSuffix}");
            ant.move(file: originalDir, tofile: destDir);
        }
    }
    moveFunc.curry("ldpi").call()
    moveFunc.curry("mdpi").call()
    moveFunc.curry("hdpi").call()
    moveFunc.curry("xhdpi").call()
    moveFunc.curry("xxhdpi").call()
    moveFunc.curry("xxxhdpi").call()
    moveRawFunc.curry("raw").call() // Added my Chris
}
```

### To build app with cleartext traffic support

Update AndroidManifest.xml by changing
_android:usesCleartextTraffic="true"_

### Update app version before publishing

- Use "npm run bump-patch", "npm run bump-minor", "npm run bump-major" to update version number
- Manual
  - App version (versionName) in android/app/build.gradle
  - App version (match above) in package.

### Temporary workarounds

- [How to resolve the error on 'react-native start'] https://stackoverflow.com/questions/58120990/how-to-resolve-the-error-on-react-native-start

## Troubleshooting

https://reactnavigation.org/docs/troubleshooting/

### Send text and return to device via adb

adb shell input text "1408012" && adb shell input keyevent 66

### Build a version that works with unencrypted network traffic (internal use only)

Append the following parameter to <application (here)>
android:usesCleartextTraffic="false"

## adb devices => no permissions (user in plugdev group; are your udev rules wrong?)

https://stackoverflow.com/questions/53887322/adb-devices-no-permissions-user-in-plugdev-group-are-your-udev-rules-wrong

## Release Notes

### Todo

- Replace https://github.com/noway/react-native-material-dropdown with something else
- Replace dialogs with one of the following:
  - https://github.com/nysamnang/react-native-raw-bottom-sheet#readme
  - https://github.com/jacklam718/react-native-modals/blob/master/README.md
- Upgrade redux to the latest to support hooks [DONE]
- Tweak redux persist to save every store rather than doing it manually [DONE]
- Update DynamicScan's date input to https://github.com/react-native-datetimepicker/datetimepicker#getting-started when upgrading >RN0.65

### Releases

### 1.10.0

- Upgraded React Native Elements to 3.4.2
- Upgraded several other libraries

### 1.8.1

- Latest production base build
- Lastest patch version 1.8.22 (refer package.json for latest version)

#### 1.4.4

- Improvements to Stocktake

#### 1.4.3

- Upgrade to RN0.63.4
- Fixed auto bundling
- Rewritten Stocktake

#### 1.3.0

- Upgrade to RN0.63.2
- Adding QuickScan
- Core UI elements adjusted

#### 1.2.1

- Compatible with API version 1.1.4
