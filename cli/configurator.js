const path = require('path');
const fs = require('fs');

class Configurator {
    constructor(argv) {
        this.configFilePath = argv.config;
        this.argv = argv;
        this.configFileObj = {};
        
        this.options = {
            browser: '',
            tags: '',
            cores: '',
            featurePath: '',
            stepDefinitionPath: '',
            supportFolderPath: '',
            reportFolderPath: '',
            retry: '',
            rerun: '',
            remoteAppiumHub: '',
            desiredCapabilities: ''
        };

        this.setConfigFileObject();
        this.setOptions(this.configFileObj);
        this.setOptions(this.argv);
    }

    setConfigFileObject() {
        if (typeof this.configFilePath !== 'undefined') {
          if (fs.existsSync(this.configFilePath)) {
            this.configFileObj = require(path.resolve(this.configFilePath)); // eslint-disable-line global-require, import/no-dynamic-require
    
            this.configFileObj = this.configFileObj.configurations;
          } else {
            throw new Error(`${this.configFilePath} is not a valid file`);
          }
        }
      }

    setOptions(options) {
        for (const [paramKey, paramValue] of Object.entries(options)) {
          for (const [key, value] of Object.entries(this.options)) {
            if (paramKey === key) {
              if (typeof paramValue !== 'undefined') {
                if (typeof paramValue === 'string' && Array.isArray(value)) {
                  this.options[paramKey] = paramValue.split(',');
                } else {
                  this.options[paramKey] = paramValue;
                }
              }
            }
          }
        }
      }
}

module.exports = Configurator;