const yargs = require('yargs');
const path = require('path');
const _ = require('lodash');
const { exec } = require('child_process');
const waitForPort = require('wait-port');
const colors = require('colors');

const { checkDriverCompatibility } = require('../utils/check-compatibility');
const options = require('./cli-options');
const Configurator = require('./configurator');
const { processTags, processWorldParams, processCores, mergeDesiredCaps, isAppSession } = require('../utils/modify-options');
const { createFolder, mergeReports, removeRerunTxtFiles } = require('../utils/utility');
const { startAppium, stopAppium } = require('../utils/appium-manager');
const { exitAndroidEmulator, closeSimulatorApp } = require('../utils/emulator-manager');
const { retryFailingTests } = require('./rerun-manager');
const appiumConfig = require('../utils/appium-config');

global.platform = process.platform;
global.appiumServer = null;

let env = process.env;

async function getCucumberArgs() {
    const { argv } = yargs
        .usage('eol-ft-runner [options]')
        .help('help').alias('help','h')
        .version('version').alias('version', 'v')
        .array('browser')
        .option(options);

    const configOptions = new Configurator(argv).options;
    global.configOptions = configOptions;
    global.browsers = configOptions.browser;
    global.remoteAppiumHub = configOptions.remoteAppiumHub;
    global.headless = argv.headless;
    global.retry = argv.retry || configOptions.retry;
    global.rerun = argv.rerun || configOptions.rerun;

    let addDesiredCaps, mergedDesiredCaps;
    addDesiredCaps = argv.addDesiredCaps;
    if (addDesiredCaps) {
        addDesiredCaps = JSON.parse(addDesiredCaps);
        mergedDesiredCaps = await mergeDesiredCaps(configOptions.desiredCapabilities, addDesiredCaps);
    } else {
        mergedDesiredCaps  = {...configOptions.desiredCapabilities};
    }

    if (mergedDesiredCaps) {
        env.desiredCaps = JSON.stringify(mergedDesiredCaps);
    }

    // get slack notification settings
    global.webhookUrl = argv.webhookUrl || '';
    global.ciLinkTitle = argv.ciLinkTitle || '';
    global.ciLinkUrl = argv.ciLinkUrl || '';

    if (global.retry && global.rerun) {
        console.info('Retry & Rerun can not be used together. Re-setting execution to only use cucumber-js <retry> mechanism.'.red.italic);
        global.rerun = false;
    }
    
    global.projDir = process.cwd().replace(/(\s+)/g, '\\$1');
    global.nodeCwd = path.resolve(__dirname).replace(/(\s+)/g, '\\$1');
    global.cucumberExePath = path.normalize(global.projDir + '/node_modules/.bin/cucumber-js');
    global.reportsPath = path.normalize(global.projDir + "/" + configOptions.reportFolderPath);

    createFolder(global.reportsPath);

    let cukeArgs = [];
    for (i=0; i < configOptions.browser.length; i++) {
        const tags = await processTags(configOptions.browser[i], configOptions.tags);
        const worldParams = await processWorldParams(configOptions.browser[i], global.headless, global.remoteAppiumHub);
        const cores = await processCores(configOptions.browser[i], configOptions.cores);
        
        cukeArgs.push([
            cucumberExePath,
            path.normalize(`${global.projDir}/${configOptions.featurePath}`),
            '--require',
            path.normalize(`${global.projDir}/${configOptions.stepDefinitionPath}`),
            '--require',
            path.normalize(`${global.nodeCwd}/../utils/hooks.js`),
            '--require',
            path.normalize(`${global.projDir}/${configOptions.supportFolderPath}`),
            '--require',
            path.normalize(`${global.nodeCwd}/../utils/world.js`),
            '--tags',
            `"${tags}"`,
            '--format',
            path.normalize(`json:${global.projDir}/${configOptions.reportFolderPath}/cucumber-report-${configOptions.browser[i]}.json`),
            '--parallel',
            cores,
            '--world-parameters',
            `${worldParams}`
        ]);
        if (global.retry) {
            cukeArgs[i].push('--retry', global.retry);
        }
        if (global.rerun) {
            cukeArgs[i].push(
                '--format',
                path.normalize(`rerun:${global.projDir}/${configOptions.reportFolderPath}/@rerun-${configOptions.browser[i]}.txt`)
            );
        }
    }
    return cukeArgs;
}

async function execCommands(commands) {
    try {
        const done = _.after(global.browsers.length, () => {
            console.log('********** COMPLETED **********'.rainbow);
            mergeReports(global.browsers, global.reportsPath); //refactor cleanup to be called from here
            if (global.rerun) {
                retryFailingTests();
            } else {
                if (!global.remoteAppiumHub) {
                    if (global.browsers.includes('android')) exitAndroidEmulator();
                    if (global.browsers.includes('ios')) closeSimulatorApp();
                    if (global.browsers.includes('android') || global.browsers.includes('ios')) stopAppium(global.appiumServer);
                }
                removeRerunTxtFiles();
            }
        });

        commands.forEach(async (command, index) => {
            const cli = command.join(" ");
            console.log(`\n=> Running: ${cli}\n`)
            exec(cli, { env: env }, (err, stdout, stderr) => {
                console.log(`[ --- ${global.browsers[index]} --- ]`.bgGreen.white);
                console.log(`--- stdout:`.yellow + `\n${stdout}`);
                if (stderr != '') {
                    console.log(`--- stderr:`.red + `\n${stderr}`);
                }
                done();
            });
        });
    } catch(e) {
        console.log('main error stacktrace', e.stack);
    }
}

async function runCucumberTests() {
    const commands = await getCucumberArgs();
    await checkDriverCompatibility(global.browsers, env.desiredCaps);
    
    if (global.browsers.includes('android') || global.browsers.includes('ios')) {
        if (!global.remoteAppiumHub) {
            console.log(`Mobile tests detected. Starting appium server...`.green);
            global.isAppSession = isAppSession(env.desiredCaps);
            global.appiumServer = startAppium(global.browsers);
            waitForPort({ host: appiumConfig.appium.address, port: appiumConfig.appium.port }).then(open => {
                if (open) {
                    execCommands(commands);
                } else {
                    console.error('Appium not started');
                }
            });
        } else {
            execCommands(commands);
        }
    } else {
        execCommands(commands);
    }
}

module.exports = {
    execCommands: execCommands,
    runCucumberTests: runCucumberTests
};