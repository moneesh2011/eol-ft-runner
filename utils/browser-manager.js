const { execSync } = require('child_process');

const closeSafariInstances = () => {
  for (j = 0; j < 2; j++) {
    const exitAppCmd = "quit app \"Safari\"";
    execSync(`osascript -e '${exitAppCmd}'`);
  }
};

const closeIEDriverInstances = () => {
  const exitIEDriverCmd = "taskkill /F /IM IEDriverServer.exe";
  execSync(exitIEDriverCmd);
};

const closeIEBrowserInstances = () => {
  const exitIEBrowserCmd = "taskkill /F /IM iexplore.exe";
  execSync(exitIEBrowserCmd);
};

module.exports = {
  closeSafariInstances,
  closeIEDriverInstances,
  closeIEBrowserInstances
};