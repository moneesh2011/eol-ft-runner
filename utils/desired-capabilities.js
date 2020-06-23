module.exports = {
  chrome: {
    browserName: 'chrome',
    unhandledPromptBehavior: 'accept'
  },
  firefox: {
    browserName: 'firefox'
  },
  safari: {
    browserName: 'safari'
  },
  ie: {
    browserName: 'internet explorer'
  },
  edge: {
    browserName: 'MicrosoftEdge'
  },
  android: {
    platformName: 'Android',
    platformVersion: '10',
    browserName: 'Chrome',
    platform: 'ANDROID',
    newCommandTimeout: 30,
    'chromeOptions': {
      'androidPackage': 'com.android.chrome'
    }
  },
  ios: {
    browserName: 'Safari',
    platformName: 'iOS',
    platformVersion: '13.5',
    deviceName: 'iPhone 11',
    automationName: 'XCUITest',
    startIWDP: true,
    newCommandTimeout: 30,
    safariAllowPopups: true
  }
};