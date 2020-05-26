async function processTags(browser, tag) {
    const excludeTags = ((browser === 'android') || (browser === 'ios')) ? '@desktop' : '@mobile';
    const tags = tag ? `${tag} and not ${excludeTags}` : `not ${excludeTags}`;
    return tags;
}

async function processWorldParams(browserName, headlessFlag) {
    return (headlessFlag !== undefined) ? `'{"browser":"chrome","headless":"true"}'` : `'{"browser":"${browserName}"}'`;
}

module.exports = {
    processTags: processTags,
    processWorldParams: processWorldParams
};