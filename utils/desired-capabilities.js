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
    platform: 'IOS',
    platformName: 'iOS',
    platformVersion: '11.3',
    deviceName: 'iPhone X',
    automationName: 'XCUITest',
    startIWDP: true,
    newCommandTimeout: 30
  }
};