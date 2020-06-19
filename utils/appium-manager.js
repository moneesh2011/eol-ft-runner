const { execSync, spawn } = require('child_process');
const config = require('./appium-config');
const kill = require('kill-port');

const appiumConfig = config.appium;

const startAppium = () => {
  kill(appiumConfig.port);

  const npmBin = execSync('npm bin')
    .toString()
    .trim();

  const output = spawn(`${npmBin}/appium`, [
    '--address',
    appiumConfig.address,
    '--log-level',
    appiumConfig.logLevel,
    '--port',
    appiumConfig.port,
    '--default-capabilities',
    JSON.stringify(appiumConfig.defaultCapabilities),
    '--chromedriver-executable',
    require('chromedriver').path
  ]);

  output.stdout.on('data', data => {
    console.log(`stdout: ${data}`);
  });

  output.stderr.on('data', err => {
    console.error(`stderr: ${err}`);
  });

  output.on('error', err => {
    console.error(`Error: ${err}`);
    process.exit(1);
  });

  output.on('exit', (code, signal) => {
    console.log(`Appium exited with ${code} on ${signal}`);
  });

  return output;
};

const stopAppium = server => {
  server.kill('SIGHUP');
};

// const server = startAppiumServer();
// setTimeout(() => { server.kill('SIGHUP')}, 10000);

module.exports = {
  startAppium: startAppium,
  stopAppium: stopAppium
};