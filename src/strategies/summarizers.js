const fetch = require('node-fetch');
const { decode } = require('html-entities');

class OpenAISummarizer {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async summarize(content) {
        const prompt = `以下の文章を300文字以内で日本語で要約してください:\n\n${decode(content)}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        return `OpenAIによる要約: ${data.choices[0].message.content.trim()}`;
        // return `要約 (OpenAI): ${data.choices[0].message.content.trim()}`;
        // return data.choices[0].message.content.trim();
    }
}

class GeminiSummarizer {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async summarize(content) {
        return `要約 (Gemini): ${content.substring(0, 100)}...`;
    }
}

class BedrockSummarizer {
    async summarize(content) {
        return `要約 (Bedrock): ${content.substring(0, 100)}...`;
    }
}

module.exports = {
    OpenAISummarizer,
    GeminiSummarizer,
    BedrockSummarizer
};
