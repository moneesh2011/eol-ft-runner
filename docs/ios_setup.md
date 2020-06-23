## TEST SETUP FOR IOS SAFARI
Only supported on macOS. Linux, Windows and all other operating systems are unsupported.

**Step-1 : Setup XCode**
Download & Install XCode and iOS Simulator:
- Install latest version of XCode from the Mac App Store
- Launch XCode and go to Preferences: (Menu bar) XCode -> Preferences
- In Preferences window, go to Components tab and download `iOS Simulator 13.5` (If not found, please ask your team for alternatives)
- In terminal, enter the following to validate that XCode Command line tools are installed:
``` shell
xcrun simctl list devices
```
If successful, the output will return you all iOS Simulators installed on your mac.
If unsuccessful, follow the output to install XCode command line tools
- If you have more than one version of XCode on your machine, make sure you use the correct version using `xcode-select` command

**Step-2 : Install Carthage**
Using `brew`, install carthage in your environment:
- Install using below command:
``` shell
brew install carthage
```