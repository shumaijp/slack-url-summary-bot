const fetch = require('node-fetch');

async function postToSlack({ channel, text }) {
    const token = process.env.SLACK_BOT_TOKEN;
    const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            channel: channel,
            text: text
        })
    });

    const data = await response.json();
    if (!data.ok) {
        throw new Error(`Slack API Error: ${data.error}`);
    }
    console.log(`Posted to Slack: ${text}`);
}

module.exports = {
    postToSlack
};
