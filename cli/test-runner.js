const yargs = require('yargs');
const path = require('path');
const _ = require('lodash');
const { exec } = require('child_process');
const waitForPort = require('wait-port');
const colors = require('colors');

const { checkDriverCompatibility } = require('../utils/check-compatibility');
const options = require('./cli-options');
const Configurator = require('./configurator');
const { processTags, processWorldParams, processCores } = require('../utils/modify-options');
const { createFolder, mergeReports } = require('../utils/utility');
const { startAppium, stopAppium } = require('../utils/appium-manager');
const appiumConfig = require('../utils/appium-config');

global.platform = process.platform;
let appiumServer = null;

async function getCucumberArgs() {
    const { argv } = yargs
        .usage('eol-ft-runner [options]')
        .help('help').alias('help','h')
        .version('version').alias('version', 'v')
        .array('browser')
        .option(options);

    const configOptions = new Configurator(argv).options;
    global.browsers = configOptions.browser;

    let cukeArgs = [];
    const projDir = process.cwd().replace(/(\s+)/g, '\\$1');
    const nodeCwd = path.resolve(__dirname).replace(/(\s+)/g, '\\$1');
    
    const cucumberExePath = path.normalize(projDir + '/node_modules/.bin/cucumber-js');
    global.reportsPath = path.normalize(projDir + "/" + configOptions.reportFolderPath);
    createFolder(global.reportsPath);
    for (i=0; i < configOptions.browser.length; i++) {
        const tags = await processTags(configOptions.browser[i], configOptions.tags);
        const worldParams = await processWorldParams(configOptions.browser[i], argv.headless);
        const cores = await processCores(configOptions.browser[i], configOptions.cores);
        
        cukeArgs.push([
            cucumberExePath,
            path.normalize(`${projDir}/${configOptions.featurePath}`),
            '--require',
            path.normalize(`${projDir}/${configOptions.stepDefinitionPath}`),
            '--require',
            path.normalize(`${nodeCwd}/../utils/hooks.js`),
            '--require',
            path.normalize(`${projDir}/${configOptions.supportFolderPath}`),
            '--require',
            path.normalize(`${nodeCwd}/../utils/world.js`),
            '--tags',
            `"${tags}"`,
            '--format',
            path.normalize(`json:${projDir}/${configOptions.reportFolderPath}/cucumber-report-${configOptions.browser[i]}.json`),
            '--parallel',
            cores,
            '--world-parameters',
            `${worldParams}`
        ]);
        if (configOptions.retry) cukeArgs[i].push('--retry', configOptions.retry);
    }
    return cukeArgs;
}

async function execCommands(commands) {
    try {
        const done = _.after(global.browsers.length, () => {
            console.log('********** COMPLETED **********'.rainbow);
            mergeReports(global.browsers, global.reportsPath);
            if (global.browsers.includes('android') || global.browsers.includes('ios')) stopAppium(appiumServer);
        });

        commands.forEach(async (command, index) => {
            const cli = command.join(" ");
            console.log(`\n=> Running: ${cli}\n`)
            exec(cli, (err, stdout, stderr) => {
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
    await checkDriverCompatibility(global.browsers);
    
    if (global.browsers.includes('android') || global.browsers.includes('ios')) {
        console.log(`Mobile tests detected. Starting appium server...`.green);
        appiumServer = startAppium(global.browsers);
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
}

runCucumberTests();