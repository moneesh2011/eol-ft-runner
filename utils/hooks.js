const { After, Status } = require('../index');
const errorHandler = require('./error-handler');

After(async function(testcase) {
    if (testcase.result.status === Status.FAILED) {
        var imgData = testcase.result.exception.screenshot;
        if (imgData === undefined) {
        imgData = await errorHandler.takeScreenshot(this.driver.driver);
        }
        await this.attach(testcase.result.exception.name);
        await this.attach(testcase.result.exception.message);
        await this.attach('\nBROWSER LOGS:' + (await this.driver.getBrowserConsoleLogs()));
        await this.attach(new Buffer(imgData, 'base64'), 'image/png');
    }
    await this.driver.close();
});