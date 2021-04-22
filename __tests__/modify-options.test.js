const { expect} = require('chai');
const { processTags, processWorldParams } = require('../utils/modify-options');

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
});