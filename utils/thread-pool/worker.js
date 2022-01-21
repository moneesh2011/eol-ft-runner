const path = require('path');
const { execSync } = require('child_process');
const workerpool = require("workerpool");

async function runCucumber(id, feature) {
    let relFeaturePath = feature.absFeaturePath.replace(`${process.cwd()}/`, '');
    
    const cukeRunCmd = path.resolve(__dirname, 'node_modules/.bin/cucumber-js');
    let command = `${cukeRunCmd} ${relFeaturePath} --publish-quiet`;
    if (feature.tag) command =+ ` --tags ${feature.tag}`;
   
    console.info(`Task: ${id} has been started. Running cmd: ${command}`);
    await execSync(command, { stdio: 'inherit' });
}

workerpool.worker({
    runCucumber: runCucumber
})