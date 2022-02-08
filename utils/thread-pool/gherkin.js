const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const Gherkin = require('@cucumber/gherkin');
const Messages = require('@cucumber/messages');
const Finder = require('fs-finder');

function getFeatures(featuresPath) {
    return Finder.from(featuresPath).findFiles('*.feature');
}

function flattenTags(tagArray) {
    if (tagArray.length) {
        return _.map(tagArray, (tag) => tag.name);
    }
    return [];
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
                tag: flattenTags(child.scenario.tags)
            })
        }
    }
    return scenarios;
}

function filterScenarioWithExclusionTags(scenarios, exclusionTag) {
    if (!exclusionTag) return scenarios;
    return _.filter(scenarios, 
        (scene) => !_.includes(scene.tag, exclusionTag));
}

function getScenarioWithTag(featurePath, tags) {
    const scenarios = getScenarios(featurePath);
    
    const [ runTags, excludeTag ] = tags.split(/and not /g);
    
    let taggedScenarios = [];
    if (!runTags) {
        taggedScenarios = scenarios;
    } else {
        const tagList = runTags.split(/ or /g);
        for (let tag of tagList)
            taggedScenarios.push(..._.filter(scenarios, 
                (scenario) => _.includes(scenario.tag, tag.trim())));
    }
    
    taggedScenarios = filterScenarioWithExclusionTags(taggedScenarios, excludeTag);
    return taggedScenarios;
}

module.exports = {
    getScenarioWithTag: getScenarioWithTag
};