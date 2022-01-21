const _ = require('lodash');
const { argv } = require('process');
const colors = require('colors')
const path = require('path');
const workerpool = require('workerpool');

const { getScenarioWithTag } = require("./gherkin");
const { groupByFeatures } = require('./grouping');

function workerPools(configOptions) {
    let taskPool, features = [];

    if (configOptions && configOptions.tags !== undefined) {
        const scenarios = getScenarioWithTag("/features", argv[3]);
        const groupedFeatures = groupByFeatures(scenarios);
        for (feature of groupedFeatures) {
            features.push({
                absFeaturePath: feature.featureFileName,
                tag: argv[3]
            });
        }
    }
    
    console.log("features", features);
    if (features.length === 0) {
        console.error("No matching feature files found. Exiting!");
        process.exit(1);
    }

    function init() {
        taskPool = workerpool.pool(path.resolve(__dirname, 'worker.js'), {
            minWorkers: 1,
            maxWorkers: 2,
            workerType: 'thread'
        });
    }

    function start() {
        const done = _.after(features.length, () => {
            console.log('********** COMPLETED **********'.rainbow);
            taskPool.terminate();
        });
        
        for (let i=0; i < features.length; i++) {
            taskPool.proxy()
                .then(async function(myWorker) {
                    await myWorker.runCucumber((i+1), features[i]);
                    done();
                })
                .catch(function(err) {
                    console.error(err);
                });
        }
    }
}

module.exports = {
    workerPools: workerPools
};