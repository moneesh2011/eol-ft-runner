const _ = require('lodash');
const { argv } = require('process');
const colors = require('colors')
const path = require('path');
const workerpool = require('workerpool');

const { getScenarioWithTag } = require("./gherkin");
const { groupByFeatures } = require('./grouping');
const { mergeReports } = require("../utility");

function workerPools(configOptions, cukeOptions) {
    console.info("v0.5.0: Using --parallelType flag is currently restricted to the first `browser` in the configuration file" .bgBlue);
    let taskPool, features = [], cukeOption = cukeOptions[0]; //TODO: refactor to support iterations

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
        minWorkers: 1,
        maxWorkers: cukeOption.cores || 2,
        workerType: 'thread'
    });

    function start() {
        let browsers = [];
        let promises = [];
        const done = _.after(features.length, () => {
            console.log('********** COMPLETED **********'.rainbow);
            mergeReports(browsers, global.reportsPath);
        });
        
        for (let i=0; i < features.length; i++) {
            let id = i + 1;
            browsers.push(`${global.browsers[0]}-${id}`);

            promises.push(taskPool.proxy()
                .then(async function(myWorker) {
                    await myWorker.runCucumber((id), features[i], cukeOption); //TODO: refactor to consolidate features & cukeOption
                })
                .then(() => done())
                .catch(function(err) {
                    console.error(err);
                })
            );

            Promise.all(promises)
                .then(() => taskPool.terminate())
                .catch(function(err) {
                    console.log("error", err);
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