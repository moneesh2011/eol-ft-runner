async function processTags(browser, tag) {
    const cliTags = tag.replace(/ /g, ' or ');
    const excludeTags = ((browser === 'android') || (browser === 'ios')) ? '@desktop' : '@mobile';
    const tags = tag ? `${cliTags} and not ${excludeTags}` : `not ${excludeTags}`;
    return tags;
}

async function processWorldParams(browserName, headlessFlag) {
    if (global.platform === 'win32') {
        return (headlessFlag !== undefined) ? `"{\\"browser\\":\\"${browserName}\\",\\"headless\\":\\"true\\"}"` : `"{\\"browser\\":\\"${browserName}\\"}"`;
    } else {
        return (headlessFlag !== undefined) ? `'{"browser":"${browserName}","headless":"true"}'` : `'{"browser":"${browserName}"}'`;
    }
}

async function processCores(browserName, cores) {
    return ((browserName === 'safari' || browserName === 'edge')) ? 1 : (cores || 2);
}

module.exports = {
    processTags: processTags,
    processWorldParams: processWorldParams,
    processCores: processCores
};