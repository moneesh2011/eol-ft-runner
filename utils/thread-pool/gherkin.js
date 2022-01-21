const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const Gherkin = require('@cucumber/gherkin');
const Messages = require('@cucumber/messages');
const Finder = require('fs-finder');

function getFeatures(srcPath) {
    let featuresPath = path.resolve(__dirname + srcPath);
    return Finder.from(featuresPath).findFiles('*.feature');
}

function getScenarios(srcPath) {
    let uuidFn = Messages.IdGenerator.uuid();
    let builder = new Gherkin.AstBuilder(uuidFn);
    let matcher = new Gherkin.GherkinClassicTokenMatcher();
    const parser = new Gherkin.Parser(builder, matcher);

    let scenarios = [];
    const featuresPath = getFeatures(srcPath);
    for (let featurePath of featuresPath) {
        const data = parser.parse(fs.readFileSync(featurePath, "utf-8"));
        for (let child of data.feature.children) {
            scenarios.push({
                featureFileName: featurePath,
                scenarioLocation: child.scenario.location.line,
                tag: child.scenario.tags[0].name
            })
        }
    }
    return scenarios;
}

function getScenarioWithTag(featurePath, tagName) {
    const scenarios = getScenarios(featurePath);
    if (!tagName) return scenarios;

    return _.filter(scenarios, 
        (scenario) => scenario.tag.toLowerCase() === tagName);
}

module.exports = {
    getScenarioWithTag: getScenarioWithTag
};