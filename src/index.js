import express from 'express';
import bodyParser from 'body-parser';
import { MercuryExtractor, ReadabilityExtractor, DiffbotExtractor } from './strategies/articleExtractors.js';
import { OpenAISummarizer, GeminiSummarizer, BedrockSummarizer } from './strategies/summarizers.js';
import { postToSlack } from './utils/slackApi.js';

const app = express();
app.use(bodyParser.json());

function selectArticleExtractor() {
    const strategy = process.env.ARTICLE_STRATEGY;
    if (strategy === 'diffbot') return new DiffbotExtractor(process.env.DIFFBOT_TOKEN);
    if (strategy === 'readability') return new ReadabilityExtractor();
    return new MercuryExtractor();
}

function selectSummarizer() {
    const strategy = process.env.SUMMARIZER_STRATEGY;
    if (strategy === 'gemini') return new GeminiSummarizer(process.env.GEMINI_API_KEY);
    if (strategy === 'bedrock') return new BedrockSummarizer();
    return new OpenAISummarizer(process.env.OPENAI_API_KEY);
}

app.post('/webhook', async (req, res) => {
    try {
        const url = req.body.url;
        const channel = req.body.channel;

        const extractor = selectArticleExtractor();
        const summarizer = selectSummarizer();

        const article = await extractor.extract(url);
        const summary = await summarizer.summarize(article.content);

        await postToSlack({ channel, text: summary });

        res.status(200).send('OK');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.listen(3000, () => console.log('Bot server running on port 3000'));
