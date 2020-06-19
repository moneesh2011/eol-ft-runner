const { execSync } = require('child_process');

// Export function -- Exit open Android simulator
const exitAndroidEmulator = () => {
    if (process.platform === 'win32') return null;
    execSync('adb devices | grep emulator | cut -f1 | while read line; do adb -s $line emu kill; done');
}

const getEmulatorName = () => {
    const stdout = execSync('emulator -list-avds', {
      encoding: 'utf-8'
    });

    if (stdout) {
      const emulators = stdout.trim().split('\n');
      return emulators[0];
    } else {
      throw new Error(`No emulators found. Please create an AVD in Android Studio application.`);
    }
}

module.exports = {
    exitAndroidEmulator,
    getEmulatorName
};