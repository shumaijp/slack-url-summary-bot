const express = require('express');
const bodyParser = require('body-parser');
const { URL } = require('url');
const { decode } = require('html-entities');
const { MercuryExtractor, ReadabilityExtractor, DiffbotExtractor } = require('./strategies/articleExtractors');
const { OpenAISummarizer, GeminiSummarizer, BedrockSummarizer } = require('./strategies/summarizers');
const { postToSlack } = require('./utils/slackApi');

const app = express();
app.use(bodyParser.json());

function selectArticleExtractor() {
    const strategy = process.env.ARTICLE_STRATEGY;
    console.log(`Extractor strategy: ${strategy}`);
    if (strategy === 'diffbot') return new DiffbotExtractor(process.env.DIFFBOT_TOKEN);
    if (strategy === 'readability') return new ReadabilityExtractor();
    return new MercuryExtractor();
}

function selectSummarizer() {
    const strategy = process.env.SUMMARIZER_STRATEGY;
    console.log(`Summarizer strategy: ${strategy}`);
    if (strategy === 'gemini') return new GeminiSummarizer(process.env.GEMINI_API_KEY);
    if (strategy === 'bedrock') return new BedrockSummarizer();
    return new OpenAISummarizer(process.env.OPENAI_API_KEY);
}

app.post('/webhook', async (req, res) => {
    const { type, challenge, event } = req.body;

    // Slack URL Verificationへの対応
    if (type === 'url_verification') {
        return res.status(200).send(challenge);
    }

    // Retryリクエストは無視
    const retryNumHeader = req.headers['x-slack-retry-num'];
    console.log(`X-Slack-Retry-Num: ${retryNumHeader}`);
    if (retryNumHeader && parseInt(retryNumHeader, 10) > 0) {
        console.log('Ignoring retry request');
        return res.status(200).send('Retry ignored');
    }
    // message_changedイベントは無視
    if (event.subtype === 'message_changed') {
        console.log('Ignoring message_changed subtype event');
        return res.status(200).send('Ignored message_changed event');
    }

    try {
        const channel = event.channel;
        console.log(`event.channel: ${channel}`);

        // メッセージからURLを取得
        let url;
        if (event.subtype === 'message_changed' && event.message && event.message.text) {
            console.log('Ignoring event.message.text');
            // console.log(`event.message.text: ${event.message.text}`);
            // const trimmed = event.message.text.trim();
            // if (/^<https?:\/\/[^|>]+>$/.test(trimmed)) {
            //     url = trimmed.slice(1, -1); // <>を外す
            // }
        } else if (event.text) {
            console.log(`event.text: ${event.text}`);
            const trimmed = event.text.trim();
            if (/^<https?:\/\/[^|>]+>$/.test(trimmed)) {
                url = trimmed.slice(1, -1);
            }
        }

        if (url) {
            url = new URL(url).toString();  // 自動的に適切にエンコードされる
        }
        console.log(`url: ${url}`);

        if (!url) {
            console.log("No URL found in message");
            return res.status(200).send('No URL to summarize');
        }

        const extractor = selectArticleExtractor();
        const summarizer = selectSummarizer();

        console.log("Extract...")
        const article = await extractor.extract(url);
        console.log(`Extracted article: ${decode(article.content)}`)

        console.log("Summerize...")
        const summary = await summarizer.summarize(article.content);
        console.log(`Summerized: ${summary}`)

        await postToSlack({ channel, text: summary });

        res.status(200).send('OK');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.listen(3000, () => console.log('Bot server running on port 3000'));

module.exports = app;
