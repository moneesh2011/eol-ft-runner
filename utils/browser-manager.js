const { execSync } = require('child_process');

const closeSafariInstances = () => {
  for (j = 0; j < 2; j++) {
    const exitAppCmd = "quit app \"Safari\"";
    execSync(`osascript -e '${exitAppCmd}'`);
  }
};

module.exports = {
  closeSafariInstances
};