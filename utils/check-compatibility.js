const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const { Builder } = require('selenium-webdriver');
const { exec } = require('child_process');
const _ = require('lodash');

function getDriverName(browser) {
    if ((browser === "chrome") || (browser === "android")) return "Chromedriver";
    else if (browser === "firefox") return "Geckodriver";
    else if (browser === "ie") return "IEDriver";
    else return "Unknown";
}

function getCommand(browser) {
    switch(browser) {
        case "chrome":
            return `chromedriver -v`;
        case "firefox":
            return `geckodriver --version | awk 'FNR == 1'`;
        case "android":
            return `chromedriver -v`;
        case "ie":
            console.warn("Sorry, Internet Explorer (IE11) is currently not supported. Exiting..");
            process.exit(0);
        default:
            console.error("Exiting. Unknown browser name:", browser);
            process.exit(0);
    }
}

function checkDriverCompatibility(browsers) {
    if (!Array.isArray(browsers)) {
        browsers = [browsers];
    }

    if (browsers.includes("safari")) {
        console.log("Safari driver is pre-packaged. Skipping driver check for Safari.");
        browsers = _.remove(browsers, (value) => {
            return value !== "safari";
        });
    }

    if (browsers.includes("chrome") || browsers.includes("firefox") || browsers.includes("android") || browsers.includes("ie")) {
        for(i=0; i < browsers.length; i++) {
            let browser = browsers[i],
                driverName = getDriverName(browser),
                command = getCommand(browser);

            exec(command, async (err, stdout, stderr) => {
                if (stdout != '') {
                    console.log(`--- Installed ${driverName} version:` + `\n${stdout}`);
                    const isCompatible = await example(browser);
                    if(!isCompatible) {
                        process.exit(1);
                    }
                }
                if (stderr != '') {
                    console.error(`--- Error finding ${driverName}:` + `\n${stderr}Install ${driverName} using npm`);
                    process.exit(1);
                }
            });
        }
    } else {
        console.error("Skipping driver checks. Empty browsers array:", browsers);
    }
}

async function example(browser) {
    const options = (browser === "chrome") ? new chrome.Options().headless() : new firefox.Options().headless();
    try {
        const driver = await new Builder()
            .forBrowser(browser)
            .withCapabilities(options)
            .build();
        await driver.get("about:blank"); //Using about:blank to avoid geo-locked content access issues
        await driver.close();
        return true;
    } catch(e) {
        console.error(e.message);
        return false;
    }
}

module.exports = {
    checkDriverCompatibility: checkDriverCompatibility
};