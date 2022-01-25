const _ = require('lodash');
const { argv } = require('process');
const colors = require('colors')
const path = require('path');
const workerpool = require('workerpool');

const { getScenarioWithTag } = require("./gherkin");
const { groupByFeatures } = require('./grouping');

function workerPools(configOptions, commands) {
    let taskPool, features = [], command = commands[0];

    if (configOptions && configOptions.tags !== undefined) {
        const featurePath = `${global.projDir}/${configOptions.featurePath}`;
        const scenarios = getScenarioWithTag(featurePath, configOptions.tags);
        const groupedFeatures = groupByFeatures(scenarios);
        for (feature of groupedFeatures) {
            features.push({
                absFeaturePath: feature.featureFileName,
                tag: configOptions.tags
            });
        }
    }
    
    if (features.length === 0) {
        console.error("No matching feature files found. Exiting!");
        process.exit(1);
    }

    taskPool = workerpool.pool(path.resolve(__dirname, 'worker.js'), {
        minWorkers: 2,
        maxWorkers: 2,
        workerType: 'thread'
    });

    function start() {
        const done = _.after(features.length, () => {
            console.log('********** COMPLETED **********'.rainbow);
            taskPool.terminate();
        });
        
        for (let i=0; i < features.length; i++) {
            taskPool.proxy()
                .then(async function(myWorker) {
                    await myWorker.runCucumber((i+1), features[i], command);
                })
                .then(() => done())
                .catch(function(err) {
                    console.error(err);
                });
        }
    }

    return {
        start: start
    };
}

module.exports = {
    workerPools: workerPools
};