const process = require('process');

module.exports = {
  'takeScreenshot': async function (driver) { // Function to take screenshot
    const image = await driver.takeScreenshot();
    const screenshotPath = process.cwd() + '/reports/screenshot.png';
    await require('fs').writeFile(screenshotPath, image, 'base64', () => {});
    return image;
  }
};