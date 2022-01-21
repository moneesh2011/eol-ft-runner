const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { exec } = require('child_process');
const colors = require('colors');

const { processWorldParams } = require('../utils/modify-options');
const { mergeReports, removeRerunTxtFiles } = require('../utils/utility');
const { stopAppium } = require('../utils/appium-manager');
const { exitAndroidEmulator, closeSimulatorApp } = require('../utils/emulator-manager');
const { sendSlackNotification } = require('../notifications/slack');

function getRerunFiles() {
    let markedForRerun = [];
    const retryFiles = [
        { browser:'chrome', file:'@rerun-chrome.txt' }, 
        { browser:'firefox', file: '@rerun-firefox.txt' },
        { browser:'safari', file: '@rerun-safari.txt' },
        { browser:'edge', file: '@rerun-edge.txt' },
        { browser:'android', file: '@rerun-android.txt' },
        { browser:'ios', file: '@rerun-ios.txt' }
    ];

    for(let index=0; index < retryFiles.length; index++) {
        let filePath = path.normalize(`${global.reportsPath}/${retryFiles[index].file}`);
        if (fs.existsSync(filePath)) {
            if ( content(filePath) !== '' ) {
                markedForRerun.push(retryFiles[index]);
            }
        }
    }
    return markedForRerun;
}

function content(filePath) {
    return fs.readFileSync(filePath, { encoding: 'utf8' });
}

async function retryCommands(rerunFiles) {
    global.browsers = [];
    let reCommands = [];
    
    for(let j=0; j < rerunFiles.length; j++) {
        let candidate = rerunFiles[j];
        const worldParams = await processWorldParams(candidate.browser, global.headless);
    
        reCommands.push([
            global.cucumberExePath,
            path.normalize(`${global.configOptions.reportFolderPath}/${candidate.file}`),
            '--require',
            path.normalize(`${global.projDir}/${global.configOptions.stepDefinitionPath}`),
            '--require',
            path.normalize(`${global.nodeCwd}/../utils/hooks.js`),
            '--require',
            path.normalize(`${global.projDir}/${global.configOptions.supportFolderPath}`),
            '--require',
            path.normalize(`${global.nodeCwd}/../utils/world.js`),
            '--format',
            path.normalize(`json:${global.projDir}/${global.configOptions.reportFolderPath}/cucumber-report-${candidate.browser}-rerun.json`),
            '--parallel',
            1,
            '--world-parameters',
            `${worldParams}`,
            '--publish-quiet'
        ]);
        global.browsers.push(`${candidate.browser}-rerun`);
    }
    return reCommands;
}

async function retryFailingTests() {
    const rerunFiles = await getRerunFiles();
    if (rerunFiles.length !== 0) {
        console.info(`\n<<< RETRY MECHANISM TRIGGERED >>> ...Failing tests found!`.bgBrightCyan.brightYellow.bold);
        const commands = await retryCommands(rerunFiles);
        try {
            const redone = _.after(global.browsers.length, () => {
                console.log('********** RE-RUN COMPLETED **********'.rainbow);
                mergeReports(global.browsers, global.reportsPath);
                if (!global.remoteAppiumHub) {
                    if (global.browsers.includes('android-rerun')) exitAndroidEmulator();
                    if (global.browsers.includes('ios-rerun')) closeSimulatorApp();
                    if (global.browsers.includes('android-rerun') || global.browsers.includes('ios-rerun')) stopAppium(global.appiumServer);
                }
                removeRerunTxtFiles();
                if(global.webhookUrl !== '') sendSlackNotification();
            });
        
            commands.forEach(async (command, index) => {
                const cli = command.join(" ");
                console.log(`\n=> Re-Running: ${cli}\n`)
                exec(cli, (err, stdout, stderr) => {
                    console.log(`[ --- ${global.browsers[index]} --- ]`.bgGreen.white);
                    console.log(`--- stdout:`.yellow + `\n${stdout}`);
                    if (stderr != '') {
                        console.log(`--- stderr:`.red + `\n${stderr}`);
                    }
                    redone();
                });
            });
        } catch(e) {
            console.log('Re-run error stacktrace', e.stack);
        }
    } else {
        console.log('Yay! No failing test scenarios');
        removeRerunTxtFiles();
    }
}

module.exports = {
    retryFailingTests: retryFailingTests
};