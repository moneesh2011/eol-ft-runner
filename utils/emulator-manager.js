const { execSync, exec } = require('child_process');

// Export function -- Exit open Android simulator
const exitAndroidEmulator = () => {
    if (process.platform === 'win32') {
      quitEmulatorOnWindows();
    } else {
      execSync('adb devices | grep emulator | cut -f1 | while read line; do adb -s $line emu kill; done');
    }
}

const quitEmulatorOnWindows= () => {
  exec("adb devices | findstr emulator", (err, stdout, stderr) => {
    if (stdout !== "") {
      const emulatorName = stdout.split('\t')[0].trim();
      execSync(`adb -s ${emulatorName} emu kill`);
    }

    if (stderr !== "") console.error('Error closing android emulator');
  });
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