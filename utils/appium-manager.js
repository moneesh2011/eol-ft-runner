const { execSync, spawn } = require('child_process');
const config = require('./appium-config');
const path = require('path');
const kill = require('kill-port');

const appiumConfig = config.appium;

const startAppium = () => {
  kill(appiumConfig.port);

  const npmBin = execSync('npm bin')
    .toString()
    .trim();

  const appiumExe = (process.platform === 'win32') ? path.normalize(`${npmBin}/appium.cmd`) : `${npmBin}/appium`;
  const output = spawn(appiumExe, [
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
  if (process.platform === "win32") {
    const processInfo = execSync(`netstat -ano | findstr "0.0.0.0:4723"`, { encoding: 'utf-8'} );
    const processPID = processInfo.trim().match(/[0-9]{3,5}$/g);
    execSync(`taskkill /F /PID ${processPID}`);
  }
  else server.kill('SIGHUP');
};

// const server = startAppiumServer();
// setTimeout(() => { server.kill('SIGHUP')}, 10000);

module.exports = {
  startAppium: startAppium,
  stopAppium: stopAppium
};