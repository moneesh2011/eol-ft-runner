const fs = require('fs');
const { generateReport } = require('../utils/generate-report');
const { exitAndroidEmulator } = require('./emulator-manager');

const browserImgSrc = {
  firefox: 'https://raw.githubusercontent.com/moneesh2011/browser-icons/master/icons/32/firefox-32.png',
  chrome: 'https://raw.githubusercontent.com/moneesh2011/browser-icons/master/icons/32/chrome-32.png',
  safari: 'https://raw.githubusercontent.com/moneesh2011/browser-icons/master/icons/32/safari-32.png',
  ie: 'https://raw.githubusercontent.com/moneesh2011/browser-icons/master/icons/32/internet_explorer-32.png',
  android: 'https://raw.githubusercontent.com/moneesh2011/browser-icons/master/icons/32/android-32.png',
  ios: 'https://raw.githubusercontent.com/moneesh2011/browser-icons/master/icons/32/apple-32.png',
  edge: 'https://raw.githubusercontent.com/moneesh2011/browser-icons/master/icons/32/edge-32.png'
};

const getPlatformName = async (wd) => {
  let session = await wd.getSession();
  let caps = await session.getCapabilities();
  return caps.get("platform");
};

const getBrowserName = async (wd) => {
  let session = await wd.getSession();
  let caps = await session.getCapabilities();
  return caps.get("browserName");
};

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

const createFolder = (reportsDir) => {
  const dirPath = (global.platform === 'win32') ? reportsDir : reportsDir.replace('\\', '');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
}

const cleanup = (browsers, reportsPath) => {
  browsers.forEach(browser => {
    fs.unlinkSync(`${reportsPath}/cucumber-report-${browser}.json`);
  });
  if (global.browsers.includes('android')) exitAndroidEmulator();
};

const waitForReport = (reportsDir) => {
  const filePath = (global.platform === 'win32') ? reportsDir : reportsDir.replace('\\', '');
  const start = Date.now();
  const content = () => {
    return fs.readFileSync(filePath, { encoding: 'utf8' });
  };

  while (!fs.existsSync(filePath) && Date.now() - start < 60000) {}
  if (!fs.existsSync(filePath)) {
    throw new Error(`file at path ${filePath} don't exists`);
  }

  while (content() == '' && Date.now() - start < 60000) {}

  if (content() != '') {
    console.log(`Time to generate JSON report: ${millisToMinutesAndSeconds(Date.now() - start)}`.italic);
  } else {
    throw new Error('Cucumber report file is empty!');
  }
};

const mergeReports = (browsers, reportsDir) => {
  const reportsPath = (global.platform === 'win32') ? reportsDir : reportsDir.replace('\\', '');
  let output = [];
  browsers.forEach(browser => {
    const jsonFile = `${reportsPath}/cucumber-report-${browser}.json`;
    waitForReport(jsonFile);
    const json = require(jsonFile);
    json.forEach(feature => {
      feature.name = `<img src='${browserImgSrc[browser]}' /> ${feature.name}`;
      output.push(feature);
    });
  });
  fs.writeFileSync(`${reportsPath}/cucumber-report.json`, JSON.stringify(output));
  console.log(' # JSON reports merged! # ');
  cleanup(browsers, reportsPath);
  generateReport(reportsPath);
};

module.exports = {
  getPlatformName: getPlatformName,
  getBrowserName: getBrowserName,
  mergeReports: mergeReports,
  createFolder: createFolder
};