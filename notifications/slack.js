const { SlackWebhookClient } = require('messaging-api-slack');

/**
 * Function to send slack notification when rerun mechanism is triggered due to failing tests
 * 1. [--webhook-url] Slack WebHook URL
 * 2. [--ci-link-title] (optional) CI Link title to indicate a specific CI build title
 * 3. [--ci-link-url] (optional) CI Link to build results
 * 
 * npm run headless:ci -- --tags=<tags> --webhook-url=<url> --ci-link-title=<title> --ci-link-url=<url>
 */
const sendSlackNotification = function() {
    const custom_title = `FT re-run mechanism triggered`;
    let custom_value = `Tests from your recent execution were failing; please check.`;
    
    if (global.ciLinkTitle && global.ciLinkUrl) {
        global.ciLinkTitle = (global.ciLinkTitle.includes('<')) ? global.ciLinkTitle.replace(/</g, '&lt;') : global.ciLinkTitle;
        global.ciLinkTitle = (global.ciLinkTitle.includes('>')) ? global.ciLinkTitle.replace(/>/g, '&gt;') : global.ciLinkTitle;
        global.ciLinkTitle = (global.ciLinkTitle.includes('&')) ? global.ciLinkTitle.replace(/&/g, '&amp;') : global.ciLinkTitle;

        custom_value = `<${global.ciLinkUrl}|${global.ciLinkTitle}> had some failing tests; please check.`;
    }

    const message = {
        fallback: 'Notification on test run completion',
        color: 'warning',
        fields: [
            {
                title: custom_title,
                value: custom_value,
                short: false
            }
        ]
    };

    const client = new SlackWebhookClient(global.webhookUrl);
    client.sendAttachment(message);
}

module.exports = {
    sendSlackNotification: sendSlackNotification
};