const colors = require('colors');
const path = require('path');
const workerpool = require("workerpool");

const { execSync } = require('child_process');
const { cukeCommandBuilder } = require('../../cli/command-builder');

async function runCucumber(id, feature, option) {
    let featurePath = feature.absFeaturePath.replace(`${process.cwd()}/`, '');
    option.featurePath = featurePath;

    let cukeRunCmd = cukeCommandBuilder(option);
    let command = cukeRunCmd.join(" ");

    console.info(`Task: ${id} has been started. Running cmd:`, command .green);
    await execSync(command, { stdio: 'inherit' });
}

workerpool.worker({
    runCucumber: runCucumber
});