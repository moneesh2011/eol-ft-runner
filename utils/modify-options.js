async function processTags(browser, tag) {
    const cliTags = tag.replace(/ /g, ' or ');
    const excludeTags = ((browser === 'android') || (browser === 'ios')) ? '@desktop' : '@mobile';
    const tags = tag ? `${cliTags} and not ${excludeTags}` : `not ${excludeTags}`;
    return tags;
}

async function processWorldParams(browserName, headlessFlag, remoteAppiumParams) {
    if (global.platform === 'win32') {
        let worldParams = `"{\\"browser\\":\\"${browserName}\\"`;
        if (headlessFlag !== undefined) worldParams += `,\\"headless\\":\\"true\\"`;
        if (remoteAppiumParams !== undefined) {
            if (remoteAppiumParams.address !== undefined) worldParams += `,\\"appiumAddress\\":\\"${remoteAppiumParams.address}\\"`;
            if (remoteAppiumParams.port !== undefined) worldParams += `,\\"appiumPort\\":\\"${remoteAppiumParams.port}\\"`;
        }
        worldParams += `}"`;
        return worldParams;
    } else {
        let worldParams = `'{"browser":"${browserName}"`;
        if (headlessFlag !== undefined) worldParams += `,"headless":"true"`;
        if (remoteAppiumParams !== undefined) {
            if (remoteAppiumParams.address !== undefined) worldParams += `,"appiumAddress":"${remoteAppiumParams.address}"`;
            if (remoteAppiumParams.port !== undefined) worldParams += `,"appiumPort":"${remoteAppiumParams.port}"`;
        }
        worldParams += `}'`;
        return worldParams;
    }
}

async function processCores(browserName, cores) {
    return ((browserName === 'safari' || browserName === 'edge' || browserName === 'android' || browserName === 'ios')) ? 1 : (cores || 2);
}

async function mergeDesiredCaps(existingCaps, newCaps) {
    let mergedCaps = {};
    mergedCaps = {...existingCaps};

    let oKeys = Object.keys(existingCaps);
    let nKeys = Object.keys(newCaps);

    nKeys.forEach(function(key) {
        let toBeCopiedKeys = Object.keys(newCaps[key]);
        if (!oKeys.includes(key)) return;
        
        toBeCopiedKeys.forEach(function(attr) {
        mergedCaps[key][attr] = newCaps[key][attr];
        });
    });

    return mergedCaps;
}

function isAppSession(caps) {
    caps = JSON.parse(caps);
    if (caps['android']) {
        if (caps['android']['app']) {
            return true;
        } else {
            return false;
        }
    } else if (caps['ios']) {
        if (caps['ios']['app']) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

module.exports = {
    processTags: processTags,
    processWorldParams: processWorldParams,
    processCores: processCores,
    mergeDesiredCaps: mergeDesiredCaps,
    isAppSession: isAppSession
};