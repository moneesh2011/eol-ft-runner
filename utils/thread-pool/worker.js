const colors = require('colors');
const path = require('path');
const { execSync } = require('child_process');
const workerpool = require("workerpool");

async function runCucumber(id, feature, cmd) {
    let featurePath = feature.absFeaturePath.replace(`${process.cwd()}/`, '');
    
    const cukeRunCmd = cmd[0],
        stepDefFiles = `${cmd[2]} ${cmd[3]}`,
        hookFiles =  `${cmd[4]} ${cmd[5]}`,
        supportFiles =  `${cmd[6]} ${cmd[7]}`,
        worldFiles =  `${cmd[8]} ${cmd[9]}`,
        jsonFormat =  `${cmd[12]} ${cmd[13]}`,
        worldParams =  `${cmd[16]} ${cmd[17]}`,
        tags = (cmd[11]) ? `--tags ${cmd[11]}` : '';

    let command = `${cukeRunCmd} ${featurePath} ${stepDefFiles} ${hookFiles} ${supportFiles} ${worldFiles} ${tags} ${jsonFormat} ${worldParams} --publish-quiet`;
    
    console.info(`Task: ${id} has been started. Running cmd:`, command .green);
    await execSync(command, { stdio: 'inherit' });
}

workerpool.worker({
    runCucumber: runCucumber
});