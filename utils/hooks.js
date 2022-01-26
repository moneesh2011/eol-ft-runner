const { After, Status } = require('../index');
const errorHandler = require('./error-handler');

After(async function(testcase) {
    if (testcase.result.status === Status.FAILED) {
        let imgData = await errorHandler.takeScreenshot(this.driver.driver);
        
        await this.attach('TIME (in sec): ' + testcase.result.duration.seconds.toString());
        await this.attach(testcase.result.message.toString());
        await this.attach('\nBROWSER LOGS:' + (await this.driver.getBrowserConsoleLogs()));
        await this.attach(new Buffer(imgData, 'base64'), 'image/png');
    }
    await this.driver.close();
});