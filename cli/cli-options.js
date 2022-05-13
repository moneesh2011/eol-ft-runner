module.exports = {
    config: {
        alias: 'c',
        description: 'Configuration file specifying feature and step-definition paths',
        demandOption: true,
        requiresArg: true,
        type: 'string'
    },
    browser : {
        alias: 'b',
        description: 'Browser used in tests; Eg. chrome, firefox, safari, android, ios',
        demandOption: false,
        requiresArg: true,
        type: 'array'
    },
    headless : {
        description: 'Headless option to run in headless mode. Supported only for chrome and firefox.',
        demandOption: false,
        requiresArg: false,
        type: 'string'
    },
    tags : {
        alias: 't',
        description: 'Tagged scenarios to be executed; Value to be prefixed with @',
        demandOption: false,
        requiresArg: true,
        type: 'string'
    },
    cores : {
        description: 'Number of threads in execution during parallel run',
        demandOption: false,
        requiresArg: true,
        type: 'number'
    },
    retry: {
        description: 'Cucumber-js native retry mechanism to run any failed test scenario(s)',
        demandOption: false,
        requiresArg: true,
        type: 'number'
    },
    rerun: {
        description: 'Rerun failing test scenario(s) by preserving the original execution report',
        demandOption: false,
        requiresArg: false,
        type: 'boolean'
    },
    webhookUrl: {
        description: 'Slack webhook url',
        demandOption: false,
        requiresArg: true,
        type: 'string'
    },
    ciLinkTitle: {        
        description: 'Send slack notifications',
        demandOption: false,
        requiresArg: true,
        type: 'string'
    },
    ciLinkUrl: {        
        description: 'Send slack notifications',
        demandOption: false,
        requiresArg: true,
        type: 'string'
    },
    parallelType: {
        description: 'Used in parallel tests. Allow to run each feature file in a single thread. Expected values: "features" | "scenarios"',
        demandOption: false,
        requiresArg: true,
        type: 'string'
    },
    remoteAppiumHub: {
        description: 'Allow to update remoteAppiumHub Url for mobile farm execution',
        demandOption: false,
        requiresArg: true,
        type: 'string'
    }
}