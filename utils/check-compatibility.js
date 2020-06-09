const chrome = require('selenium-webdriver/chrome');
const { Builder } = require('selenium-webdriver');
const { exec } = require('child_process');

function checkChromeCompatibility() {
    exec('chromedriver -v', async (err, stdout, stderr) => {
        if (stdout != '') {
            console.log(`--- Installed Chromedriver version:` + `\n${stdout}`);
            const isCompatible = await example();
            if(!isCompatible) {
                process.exit(1);
            }
        }
        if (stderr != '') {
            console.log(`--- Error finding Chromdriver:` + `\n${stderr}Install chromedriver using npm`);
            process.exit(1);
        }
    });
}

async function example() {
    try {
        const driver = await new Builder()
            .forBrowser('chrome')
            .withCapabilities(new chrome.Options().headless())
            .build();
        await driver.get('https://www.google.com');
        await driver.close();
        return true;
    } catch(e) {
        console.error(e.message);
        return false;
    }
}

module.exports = {
    isChromeCompatible: checkChromeCompatibility
};