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
        type: 'number',
        default: 2
    }
}