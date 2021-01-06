const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const { Builder } = require('selenium-webdriver');
const { exec } = require('child_process');
const path = require('path');
const _ = require('lodash');

const edgeDriverPath = "node_modules/@sitespeed.io/edgedriver/vendor/msedgedriver";
const edgeOSDriverPath = (process.platform === "win32") ? `${edgeDriverPath}.exe` : edgeDriverPath;
const projPath = process.cwd().replace(/(\s+)/g, '\\$1');
const fullEdgeDriverPath = path.normalize(projPath + '/' + edgeOSDriverPath);
const fullChromeDriverPath = path.normalize(projPath + '/node_modules/.bin/chromedriver');

async function getDriverName(browser) {
    if ((browser === "chrome") || (browser === "android")) return "Chromedriver";
    else if (browser === "firefox") return "Geckodriver";
    else if (browser === "edge") return "MSEdgeDriver";
    else if (browser === "ie") return "IEDriver";
    else return "Unknown";
}

async function getCommand(browser) {
    switch(browser) {
        case "chrome":
            return `chromedriver -v`;
        case "firefox":
            return (global.platform === "win32") ? `geckodriver --version | findstr "+"` : `geckodriver --version | awk 'FNR == 1'`;
        case "android":
            return `${fullChromeDriverPath} -v`;
        case "edge":
            return (global.platform === "win32") ? `${fullEdgeDriverPath} -v` : `./${edgeDriverPath} -v`;
        case "ie":
            console.warn("Sorry, Internet Explorer (IE11) is currently not supported. Exiting..");
            process.exit(0);
        default:
            console.error("Exiting. Unknown/Unsupported browser name:", browser);
            process.exit(0);
    }
}

async function checkDriverCompatibility(browsers, desiredCaps) {
    let _browsers = [];
    if (!Array.isArray(browsers)) {
        _browsers.push(browsers);
    } else {
        Array.prototype.push.apply(_browsers, browsers);
    }    

    if (_browsers.includes("safari")) {
        console.log("SafariDriver is pre-packaged. Skipping driver check for Safari.");
        _browsers = await _.remove(_browsers, (value) => {
            return value !== "safari";
        });
    }

    if (_browsers.includes("ios")) {
        console.log("No driver checks required for iOS. Skipping..");
        _browsers = await _.remove(_browsers, (value) => {
            return value !== "ios";
        });
    }

    if (_browsers.includes("android") && desiredCaps) {
        if (isMobileAppSession(desiredCaps["android"])) {
            console.log("No driver checks required for Android app session. Skipping..");
            _browsers = await _.remove(_browsers, (value) => {
                return value !== "android";
            });
        }
    }

    if (_browsers.includes("chrome") || _browsers.includes("firefox") || _browsers.includes("android") || _browsers.includes("ie") || _browsers.includes("edge")) {
        for(i=0; i < _browsers.length; i++) {
            let browser = _browsers[i],
                driverName = await getDriverName(browser),
                command = await getCommand(browser);

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
        console.error("Skipping driver checks. Empty browser queue:", _browsers);
    }
}

async function example(browser) {
    let options, driver;
    if (browser === "chrome") {
        options = new chrome.Options().addArguments('--no-sandbox').addArguments('--disable-dev-shm-usage').headless();
    } else if (browser === "firefox") {
        options = new firefox.Options().headless();
    } else if (browser === "edge") {
        options = new edge.Options();
    } else if (browser === 'android') {
        options = new chrome.Options().addArguments('--no-sandbox').addArguments('--disable-dev-shm-usage').headless();
        browser = "chrome";
    }

    try {
        if (browser !== 'edge') {
            let runner = await new Builder()
                .forBrowser(browser)
                .withCapabilities(options);
            runner = await setWinDriverPath(runner, browser);
            driver = runner.build();
        } else {
            const service = await new edge.ServiceBuilder(fullEdgeDriverPath).setPort(5555).build();
            driver = edge.Driver.createSession(options, service);
        }
        await driver.get("about:blank"); //Using about:blank to avoid geo-locked content access issues
        await driver.close();
        return true;
    } catch(e) {
        console.error(e.message);
        return false;
    }
}

async function setWinDriverPath(runner, browser) {
    if (global.platform === 'win32') {
        if (browser === 'chrome') {
            return runner.setChromeService(new chrome.ServiceBuilder(require('chromedriver').path));
        } else if (browser === 'firefox') {
            return runner.setChromeService(new chrome.ServiceBuilder(require('geckodriver').path));
        }
    }
    else {
        return runner;
    }
}

async function isMobileAppSession(capability) {
    if (!capability) return false;
    if (Object.keys(capability).includes('app')) {
        return true;
    } else if (Object.keys(capability).includes('browserName')) {
        return false;
    }
}

module.exports = {
    checkDriverCompatibility: checkDriverCompatibility
};