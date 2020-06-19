## TEST SETUP FOR ANDROID CHROME
### Step-1 : Setup Android SDK & Emulator
Install Android Studio & SDK:
- Download Android Studio from Android Developers website: https://developer.android.com/
- Take note of your Android SDK path in Android Studio -> Preferences -> Appearance & Behavior -> System Settings -> Android SDK (check "Android SDK Location")
- Launch AVD in Android Studio and proceed to create an Android emulator
- During AVD setup, download the latest version of Android OS to use with your AVD; All SDK support libraries should be installed along with the OS
- Once your AVD is successfully created, launch your AVD and make sure Chrome (correct version) is installed. If not, you can install the latest version of the Chrome APK by drag-and-drop on the emulator window. The latest version of Chrome can be found online.

### Step-2 : Setup Android environment variables:
- All environment can be declared in your bash_profile. To output your `PATH` variable, you can send this command on the terminal
``` shell
echo $PATH
```
- Assuming your bash profile is named `bash_profile`, you can enter the following in your terminal:
``` shell
vim ~/.bash_profile
```
- Change to INSERT mode, and add new environment variable `ANDROID_HOME`
``` shell
export JAVA_HOME=<path_to_java_home_dir>
export ANDROID_HOME=<path_to_android_sdk>
export PATH=$PATH:$ANDROID_HOME:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```
Do not change the sequence, otherwise emulator will not be detected in your bash
- Save & exit. Re-launch your terminal window to reload the bash profile
- To validate, run the following command on terminal
``` shell
echo $JAVA_HOME
echo $ANDROID_HOME
echo $PATH
```
- Check the number of AVD installed using below command:
``` shell
emulator -list-avds
```

### Step-3 : Install appium in your project
Install appium in your project using below command:
``` shell
npm install appium --save-dev
```
#### Why is appium not installed along with eol-ft-runner?
Simple -- too many security vulnerabilities. Plus, mobile browser is not everyone's cup of tea, so if you need it, we do have it. You just need to install the dev-dependencies separately.


### Step-4 : Install chromedriver
If not already installed in your local package, Install chromedriver in your project using below command:
``` shell
npm install chromedriver --save-dev
```


## Run your test(s) on Android Chrome in Emulator:
``` shell
npm run test -- --config=config.json --tags=<tags> --browser=android
```