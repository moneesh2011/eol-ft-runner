const wd = require('selenium-webdriver');
const wdMobile = require('wd');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const safari = require('selenium-webdriver/safari');
const edge = require('selenium-webdriver/edge');
const { setWorldConstructor, setDefaultTimeout } = require('cucumber');
const fs = require('fs');

var caps = require('./desired-capabilities');
const config = require('./appium-config');
const { getEmulatorName } = require('./emulator-manager');
const { Driver } = require('./driver');
const { MobileDriver } = require('./mobile_driver');
let desiredCapabilities = require('./desired-capabilities');

function setWinDriverPath(runner, browser) {
  if (process.platform === 'win32') {
    if (browser === 'chrome') {
      return runner.setChromeService(new chrome.ServiceBuilder(require('chromedriver').path));
    } else if (browser === 'firefox') {
      return runner.setChromeService(new chrome.ServiceBuilder(require('geckodriver').path));
    }
  }
  else {
    return runner;
  }
}

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
    if (process.platform === 'win32') {
      commonChromeOptions.addArguments('--no-proxy-server');
      commonChromeOptions.addArguments(`--proxy-server='direct://'`);
      commonChromeOptions.addArguments('--proxy-bypass-list=*');
    }

    const commonFirefoxOptions = new firefox.Options().windowSize({ width: 1920, height: 1080 });
    const commonSafariOptions = new safari.Options();

    if (parameters.headless) {
      if (parameters.browser === "chrome") {
        let runner = new wd.Builder()
          .withCapabilities(desiredCapabilities)
          .setChromeOptions(commonChromeOptions.headless());
        runner = setWinDriverPath(runner, "chrome");
        this.browser = runner.build();
        this.browser.setDownloadPath(downloadPath); //Needed to re-enable download for headless
      } else if (parameters.browser === "firefox") {
        let runner = new wd.Builder()
          .withCapabilities(desiredCapabilities)
          .setFirefoxOptions(commonFirefoxOptions.headless());
        runner = setWinDriverPath(runner, "firefox");
        this.browser = runner.build();
      } else if (parameters.browser === "safari") {
        console.log('Headless mode not supported in Safari');
        this.browser = new wd.Builder()
          .withCapabilities(desiredCapabilities)
          .setSafariOptions(commonSafariOptions)
          .build();
      } else if (parameters.browser === "edge") {
        console.log('Headless mode not supported in Edge yet.');
        const edgeDriverPath = require('@sitespeed.io/edgedriver').binPath();
        const service = new edge.ServiceBuilder(edgeDriverPath)
          .setPort(5555)
          .build();
        const options = new edge.Options();
        this.browser = edge.Driver.createSession(options, service);
      }
    } else {
      if (parameters.browser === "chrome") {
        let runner = new wd.Builder()
          .withCapabilities(desiredCapabilities)
          .setChromeOptions(commonChromeOptions);
        runner = setWinDriverPath(runner, "chrome");
        this.browser = runner.build();
      } else if (parameters.browser === "firefox") {
        let runner = new wd.Builder()
          .withCapabilities(desiredCapabilities)
          .setFirefoxOptions(commonFirefoxOptions);
        runner = setWinDriverPath(runner, "firefox");
        this.browser = runner.build();
      } else if (parameters.browser === "safari") {
        this.browser = new wd.Builder()
          .withCapabilities(desiredCapabilities)
          .setSafariOptions(commonSafariOptions)
          .build();
      } else if (parameters.browser === "edge") {
        const edgeDriverPath = require('@sitespeed.io/edgedriver').binPath();
        const service = new edge.ServiceBuilder(edgeDriverPath)
          .setPort(5555)
          .build();
        const options = new edge.Options();
        this.browser = edge.Driver.createSession(options, service);
      }
    }
    this.driver = new Driver(this.browser);
  } else if (parameters.browser === 'android') {
    const emulatorName = getEmulatorName();
    desiredCapabilities.avd = emulatorName;
    desiredCapabilities.deviceName = emulatorName;

    // for mobile browsers -- android chrome
    this.browser = wdMobile.promiseChainRemote('localhost', 4723)
      .init(desiredCapabilities);
    this.driver = new MobileDriver(this.browser);
  } else if (parameters.browser === 'ios') {
    // for mobile browsers -- ios safari
    this.browser = wdMobile.promiseChainRemote('localhost', 4723)
      .init(desiredCapabilities);
    this.driver = new MobileDriver(this.browser);
  }

  global.driver = this.driver;
}

// module.exports = CustomWorld;
setWorldConstructor(CustomWorld);
setDefaultTimeout(120000);