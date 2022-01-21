function checkIfExists(target, key, val) {
    let isFound = false
    target.forEach((t) => {
        if (t[key] === val) isFound = true;
    });
    return isFound;
}

function getIndex(target, key, val) {
    let index = -1;
    target.forEach((t, i) => {
        if (t[key] === val) index = i;
    });
    return index;
}

function groupByFeatures(values, key="featureFileName") {
    let groupedScenarios = [];
    for (let value of values) {
        let scenario = `${value[key]}:${value['scenarioLocation']} `;
        scenario = scenario.replace(`${process.cwd()}/`, "");

        if (checkIfExists(groupedScenarios, key, value[key])) {
            let index = getIndex(groupedScenarios, key, value[key]);
            groupedScenarios[index]['scenarios'] += scenario;
        }
        else {
            groupedScenarios.push({
                featureFileName: value[key],
                scenarios: scenario
            });
        }
    }
    return groupedScenarios;
}

module.exports = {
    groupByFeatures: groupByFeatures
};