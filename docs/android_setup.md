## TEST SETUP FOR ANDROID CHROME
**Step-1 : Setup Android SDK & Emulator**
- Install Android SDK by downloading Android Studio from Android Developers website: https://developer.android.com/
- Take note of your Android SDK path in Android Studio -> Preferences -> Appearance & Behavior -> System Settings -> Android SDK (check "Android SDK Location")
- Launch AVD in Android Studio and proceed to create an Android emulator
- During AVD setup, download the required version of Android OS to use with your AVD; All SDK support libraries should be installed along with the OS
- Once your AVD is successfully created, launch your AVD and make sure Chrome (required version) is installed in the emulator. If not, you can install the required version of the Chrome .apk file by drag-and-drop on to the emulator window. All versions of Android Chrome can be found online in sites like APKMirror.

**Step-2 : Setup Android environment variables:**
- Make sure the following environment variables are set up in your machine:
``` markdown
JAVA_HOME=<path_to_java_home_dir>
ANDROID_HOME=<path_to_android_sdk>
```
- Add ANDROID_HOME to your path, along with other sdk directories in the below order:
``` markdown
PATH=$PATH:$ANDROID_HOME:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```
Do not change the sequence, otherwise emulator will not be detected properly in your shell.
- Re-launch your terminal/command window to reload the changes
- Check the number of AVDs installed using below command:
``` shell
emulator -list-avds
```

**Step-3 : Install appium in your project** \
Install appium in your project using below command:
``` shell
npm install appium --save-dev
```
_Why is appium not packaged along with eol-ft-runner?_ \
_Simple, too many security vulnerabilities. Plus, mobile browser is not everyone's cup of tea, so if you need it, we do support it. You just need to install appium separately._


**Step-4 : Install chromedriver** \
If not already installed in your local package, Install chromedriver in your project using below command:
``` shell
npm install chromedriver --save-dev
```
The version of chromedriver should match the version of chrome installed in the emulator.    



## RUN YOUR TEST(S) ON ANDROID CHROME IN EMULATOR:
``` shell
npm run test -- --config=config.json --tags=<tags> --browser=android
```