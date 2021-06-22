const { expect} = require('chai');
const { processTags, processWorldParams, processCores, mergeDesiredCaps, isAppSession } = require('../utils/modify-options');

describe("Modify Options", function () {
  describe("processTags", function () {
    it("should return desktop tags for chrome", async function () {
      let browser = "chrome",
        tag = "@tag";

      const res = await processTags(browser, tag);
      expect(res).to.be.equal(`${tag} and not @mobile`);
    });

    it("should return desktop tags for firefox", async function () {
      let browser = "firefox",
        tag = "@tag";

      const res = await processTags(browser, tag);
      expect(res).to.be.equal(`${tag} and not @mobile`);
    });

    it("should return desktop tags for safari", async function () {
      let browser = "safari",
        tag = "@tag";

      const res = await processTags(browser, tag);
      expect(res).to.be.equal(`${tag} and not @mobile`);
    });

    it("should return desktop tags for edge", async function () {
      let browser = "edge",
        tag = "@tag";

      const res = await processTags(browser, tag);
      expect(res).to.be.equal(`${tag} and not @mobile`);
    });

    it("should return mobile tags for android", async function () {
      let browser = "android",
        tag = "@tag";

      const res = await processTags(browser, tag);
      expect(res).to.be.equal(`${tag} and not @desktop`);
    });

    it("should return mobile tags for ios", async function () {
      let browser = "ios",
        tag = "@tag";

      const res = await processTags(browser, tag);
      expect(res).to.be.equal(`${tag} and not @desktop`);
    });

    it("should return desktop tags for an unknown browser value", async function () {
      let browser = "futuristic",
        tag = "@tag";

      const res = await processTags(browser, tag);
      expect(res).to.be.equal(`${tag} and not @mobile`);
    });

    it("should return desktop tags for an empty browser value", async function () {
      let browser = "",
        tag = "@tag";

      const res = await processTags(browser, tag);
      expect(res).to.be.equal(`${tag} and not @mobile`);
    });
  });

  describe("processWorldParams", function () {
    //cuke => cucumber.js command line argument
    it("[linux,mac] should return cuke parseable string for headful config", async function() {
      let browserName = "chrome", headlessFlag = undefined;
      let remoteAppiumParams = undefined;
      global.platform = "darwin";

      const res = await processWorldParams(browserName, headlessFlag, remoteAppiumParams);
      expect(res).to.be.equal(`'{"browser":"${browserName}"}'`);
    });

    it("[win] should return cuke parseable string for headful config", async function() {
      let browserName = "chrome", headlessFlag = undefined;
      let remoteAppiumParams = undefined;
      global.platform = "win32";

      const res = await processWorldParams(browserName, headlessFlag, remoteAppiumParams);
      expect(res).to.be.equal(`"{\\"browser\\":\\"${browserName}\\"}"`);
    });

    it("[linux,mac] should return cuke parseable string for headless config", async function() {
      let browserName = "firefox", headlessFlag = true;
      let remoteAppiumParams = undefined;
      global.platform = "darwin";

      const res = await processWorldParams(browserName, headlessFlag, remoteAppiumParams);
      expect(res).to.be.equal(`'{"browser":"${browserName}","headless":"true"}'`);
    });

    it("[win] should return cuke parseable string for headless config", async function() {
      let browserName = "firefox", headlessFlag = true;
      let remoteAppiumParams = undefined;
      global.platform = "win32";

      const res = await processWorldParams(browserName, headlessFlag, remoteAppiumParams);
      expect(res).to.be.equal(`"{\\"browser\\":\\"${browserName}\\",\\"headless\\":\\"true\\"}"`);
    });

    it("[linux,mac] should return cuke parseable string for headless, remote-appium config", async function() {
      let browserName = "ios", headlessFlag = true;
      let remoteAppiumParams = {
        address: "https://www.example.com/appium/wd/hub",
        port: 3001
      };
      global.platform = "darwin";

      const res = await processWorldParams(browserName, headlessFlag, remoteAppiumParams);
      expect(res).to.be.equal(`'{"browser":"${browserName}","headless":"true","appiumAddress":"${remoteAppiumParams.address}","appiumPort":"${remoteAppiumParams.port}"}'`);
    });

    it("[win] should return cuke parseable string for headless, remote-appium config", async function() {
      let browserName = "android", headlessFlag = true;
      let remoteAppiumParams = {
        address: "https://www.example.com/appium/wd/hub",
        port: 3001
      };
      global.platform = "win32";

      const res = await processWorldParams(browserName, headlessFlag, remoteAppiumParams);
      expect(res).to.be.equal(`"{\\"browser\\":\\"${browserName}\\",\\"headless\\":\\"true\\",\\"appiumAddress\\":\\"${remoteAppiumParams.address}\\",\\"appiumPort\\":\\"${remoteAppiumParams.port}\\"}"`);
    });

    it("[linux,mac] should return cuke parseable string for headful, remote-appium config", async function() {
      let browserName = "ios", headlessFlag = undefined;
      let remoteAppiumParams = {
        address: "https://www.example.com/appium/wd/hub",
        port: 3001
      };
      global.platform = "darwin";

      const res = await processWorldParams(browserName, headlessFlag, remoteAppiumParams);
      expect(res).to.be.equal(`'{"browser":"${browserName}","appiumAddress":"${remoteAppiumParams.address}","appiumPort":"${remoteAppiumParams.port}"}'`);
    });

    it("[win] should return cuke parseable string for headful, remote-appium config", async function() {
      let browserName = "android", headlessFlag = undefined;
      let remoteAppiumParams = {
        address: "https://www.example.com/appium/wd/hub",
        port: 3001
      };
      global.platform = "win32";

      const res = await processWorldParams(browserName, headlessFlag, remoteAppiumParams);
      expect(res).to.be.equal(`"{\\"browser\\":\\"${browserName}\\",\\"appiumAddress\\":\\"${remoteAppiumParams.address}\\",\\"appiumPort\\":\\"${remoteAppiumParams.port}\\"}"`);
    });
    
    afterAll(() => {
      global.platform = process.platform;
    }); 
  });

  describe("processCores", function() {
    it("should return default value if cores value is unspecified", async function() {
      let browserName = "chrome", cores = undefined;

      const res = await processCores(browserName, cores);
      expect(res).to.be.equal(2);
    });
    
    it("should return n for chrome", async function() {
      let browserName = "chrome", cores = 4;

      const res = await processCores(browserName, cores);
      expect(res).to.be.equal(cores);
    });

    it("should return n for firefox", async function() {
      let browserName = "firefox", cores = 4;

      const res = await processCores(browserName, cores);
      expect(res).to.be.equal(cores);
    });

    it("should return 1 for safari even if cores is provided", async function() {
      let browserName = "safari", cores = 4;

      const res = await processCores(browserName, cores);
      expect(res).to.be.equal(1);
    });

    it("should return 1 for edge browser even if cores is provided", async function() {
      let browserName = "edge", cores = 4;

      const res = await processCores(browserName, cores);
      expect(res).to.be.equal(1);
    });

    it("should return 1 for android even if cores is provided", async function() {
      let browserName = "android", cores = 4;

      const res = await processCores(browserName, cores);
      expect(res).to.be.equal(1);
    });

    it("should return 1 for iOS even if cores is provided", async function() {
      let browserName = "ios", cores = 4;

      const res = await processCores(browserName, cores);
      expect(res).to.be.equal(1);
    });
  });

  describe("mergeDesiredCaps", function() {
    it("should return the same desiredCaps if no new capabilities", async function() {
      let existingCaps = {
        android: {
          platformName: 'Android',
          platformVersion: '10',
          browserName: 'Chrome',
          platform: 'ANDROID',
          newCommandTimeout: 30,
          'chromeOptions': {
            'androidPackage': 'com.android.chrome',
            'w3c': false
          }
        }
      };
      let newCaps = {}

      const res = await mergeDesiredCaps(existingCaps, newCaps);
      expect(res).to.deep.equal(existingCaps);
    });

    it("should return the updated desiredCaps with new capabilities", async function() {
      let existingCaps = {
        android: {
          platformName: 'Android',
          platformVersion: '10',
          browserName: 'Chrome',
          platform: 'ANDROID',
          newCommandTimeout: 30,
          'chromeOptions': {
            'androidPackage': 'com.android.chrome',
            'w3c': false
          }
        }
      };
      let newCaps = {
        android: {
          fullReset: true
        }
      };

      const res = await mergeDesiredCaps(existingCaps, newCaps);
      const expectedCaps = {
        android: {
          platformName: 'Android',
          platformVersion: '10',
          browserName: 'Chrome',
          platform: 'ANDROID',
          newCommandTimeout: 30,
          'chromeOptions': {
            'androidPackage': 'com.android.chrome',
            'w3c': false
          },
          fullReset: true
        }
      };
      expect(res).to.deep.equal(expectedCaps);
    });

    it("should return the updated desiredCaps with new capabilities with 2 attributes", async function() {
      let existingCaps = {
        android: {
          platformName: 'Android',
          platformVersion: '10',
          browserName: 'Chrome',
          platform: 'ANDROID',
          newCommandTimeout: 30,
          'chromeOptions': {
            'androidPackage': 'com.android.chrome',
            'w3c': false
          }
        },
        ios: {
          browserName: 'Safari',
          platformName: 'iOS',
          platformVersion: '13.5',
          deviceName: 'iPhone 11',
          automationName: 'XCUITest'
        }
      };
      let newCaps = {
        android: {
          fullReset: true
        },
        ios: {
          startIWDP: true,
          newCommandTimeout: 30,
          safariAllowPopups: true
        }
      };

      const res = await mergeDesiredCaps(existingCaps, newCaps);
      const expectedCaps = {
        android: {
          platformName: 'Android',
          platformVersion: '10',
          browserName: 'Chrome',
          platform: 'ANDROID',
          newCommandTimeout: 30,
          'chromeOptions': {
            'androidPackage': 'com.android.chrome',
            'w3c': false
          },
          fullReset: true
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
      expect(res).to.deep.equal(expectedCaps);
    });

    it("should return proper desiredCaps without unwanted attributes", async function() {
      let existingCaps = {
        android: {
          platformName: 'Android',
          platformVersion: '10',
          browserName: 'Chrome',
          platform: 'ANDROID',
          newCommandTimeout: 30,
          'chromeOptions': {
            'androidPackage': 'com.android.chrome',
            'w3c': false
          }
        },
        ios: {
          browserName: 'Safari',
          platformName: 'iOS',
          platformVersion: '13.5',
          deviceName: 'iPhone 11',
          automationName: 'XCUITest'
        }
      };
      let newCaps = {
        android: {
          fullReset: true
        },
        ios: {
          startIWDP: true,
          newCommandTimeout: 30,
          safariAllowPopups: true
        },
        chrome: {
          browserName: 'chrome',
          unhandledPromptBehavior: 'accept'
        }
      };

      const res = await mergeDesiredCaps(existingCaps, newCaps);
      const expectedCaps = {
        android: {
          platformName: 'Android',
          platformVersion: '10',
          browserName: 'Chrome',
          platform: 'ANDROID',
          newCommandTimeout: 30,
          'chromeOptions': {
            'androidPackage': 'com.android.chrome',
            'w3c': false
          },
          fullReset: true
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
      expect(res).to.deep.equal(expectedCaps);
    });

    it("should return proper desiredCaps without any duplicated attributes in each browser object", async function() {
      let existingCaps = {
        android: {
          platformName: 'Android',
          platformVersion: '10',
          browserName: 'Chrome',
          platform: 'ANDROID',
          newCommandTimeout: 30,
          'chromeOptions': {
            'androidPackage': 'com.android.chrome',
            'w3c': false
          }
        },
        ios: {
          browserName: 'Safari',
          platformName: 'iOS',
          platformVersion: '13.5',
          deviceName: 'iPhone 11',
          automationName: 'XCUITest'
        }
      };
      let newCaps = {
        android: {
          platformName: 'Android',
          platformVersion: '10',
          browserName: 'Chrome',
          platform: 'ANDROID',
          fullReset: true
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

      const res = await mergeDesiredCaps(existingCaps, newCaps);
      const expectedCaps = {
        android: {
          platformName: 'Android',
          platformVersion: '10',
          browserName: 'Chrome',
          platform: 'ANDROID',
          newCommandTimeout: 30,
          'chromeOptions': {
            'androidPackage': 'com.android.chrome',
            'w3c': false
          },
          fullReset: true
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
      expect(res).to.deep.equal(expectedCaps);
    });
  });

  describe("isAppSession", function() {
    it("should return true for android app session", async function() {
      let caps = {
        android: {
          platformName: 'Android',
          platformVersion: '10',
          app: '/path/to/apk/file',
          platform: 'ANDROID',
          newCommandTimeout: 30
        }
      };
      caps = JSON.stringify(caps);

      const res = isAppSession(caps);
      expect(res).to.be.true;
    });

    it("should return false for android browser session", async function() {
      let caps = {
        android: {
          platformName: 'Android',
          platformVersion: '10',
          browserName: 'Chrome',
          platform: 'ANDROID',
          newCommandTimeout: 30,
          'chromeOptions': {
            'androidPackage': 'com.android.chrome',
            'w3c': false
          }
        }
      };
      caps = JSON.stringify(caps);

      const res = isAppSession(caps);
      expect(res).to.be.false;
    });

    it("should return true for ios app session", async function() {
      let caps = {
        ios: {
          platformName: 'iOS',
          platformVersion: '12.1',
          app: '/path/to/ipa/file',
          platform: 'IOS',
          newCommandTimeout: 30
        }
      };
      caps = JSON.stringify(caps);

      const res = isAppSession(caps);
      expect(res).to.be.true;
    });

    it("should return false for ios browser session", async function() {
      let caps = {
        ios: {
          platformName: 'iOS',
          platformVersion: '14.2',
          browserName: 'Safari',
          platform: 'IOS',
          newCommandTimeout: 30,
          fullReset: true
        }
      };
      caps = JSON.stringify(caps);

      const res = isAppSession(caps);
      expect(res).to.be.false;
    });

    it("should return false for chrome browser session", async function() {
      let caps = {
        chrome: {
          browserName: 'chrome',
          unhandledPromptBehavior: 'accept'
        }
      };
      caps = JSON.stringify(caps);

      const res = isAppSession(caps);
      expect(res).to.be.false;
    });
  });
});