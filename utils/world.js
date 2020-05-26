var wd = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { setWorldConstructor, setDefaultTimeout } = require('cucumber');
var caps = require('./desired-capabilities');
var { Driver } = require('./driver');
const fs = require('fs');

function CustomWorld({ attach, parameters }) {
  this.attach = attach;

  if (parameters.browser) {
    desiredCapabilities = caps[parameters.browser];
  } else {
    desiredCapabilities = caps['chrome']; // setting chrome as the default browser, if world-params is null
  }
  if (!desiredCapabilities) {
    throw new Error('Unknown browser used in desired capabilites');
  }

  if (parameters.browser !== 'android' && parameters.browser !== 'ios') {
    const downloadPath = process.cwd() + '/downloads';
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath);
    }
    // for desktop browsers -- chrome, firefox, safari, ie
    // chrome options can be found here: /Users/<username>/Library/Application%20Support/Google/Chrome/Default/Preferences
    const commonChromeOptions = new chrome.Options().windowSize({ width: 1920, height: 1080 }).setUserPreferences({
      download: { prompt_for_download: false, default_directory: downloadPath }
    });
    commonChromeOptions.addArguments('--no-sandbox');
    commonChromeOptions.addArguments('--disable-dev-shm-usage');

    if (parameters.headless) {
      this.browser = new wd.Builder()
        .withCapabilities(desiredCapabilities)
        .setChromeOptions(commonChromeOptions.headless())
        .build();
      this.browser.setDownloadPath(downloadPath); //Needed to re-enable download for headless
    } else {
      this.browser = new wd.Builder()
        .withCapabilities(desiredCapabilities)
        .setChromeOptions(commonChromeOptions)
        .build();
    }
  }
  this.driver = new Driver(this.browser);
  global.driver = this.driver;
}

// module.exports = CustomWorld;
setWorldConstructor(CustomWorld);
setDefaultTimeout(120000);