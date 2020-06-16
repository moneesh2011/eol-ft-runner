const yargs = require('yargs');
const path = require('path');
const _ = require('lodash');
const { exec } = require('child_process');
const colors = require('colors');

const { checkDriverCompatibility } = require('../utils/check-compatibility');
const options = require('./cli-options');
const Configurator = require('./configurator');
const { processTags, processWorldParams } = require('../utils/modify-options');
const { createFolder, mergeReports } = require('../utils/utility');

global.platform = process.platform;

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
            configOptions.cores,
            '--world-parameters',
            `${worldParams}`
        ]);
    }
    return cukeArgs;
}

async function runCucumberTests() {
    const commands = await getCucumberArgs();
    checkDriverCompatibility(global.browsers);
    
    try {
        const done = _.after(global.browsers.length, () => {
            console.log('********** COMPLETED **********'.rainbow);
            mergeReports(global.browsers, global.reportsPath);
        });

        commands.forEach(async (command, index) => {
            const cli = command.join(" ");
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

runCucumberTests();