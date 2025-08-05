const Mercury = require('@postlight/parser');

class MercuryExtractor {
    async extract(url) {
        const result = await Mercury.parse(url);
        const contentText = result.content.replace(/<[^>]+>/g, '');
        return {
            title: result.title,
            content: contentText,
            url: result.url,
            nextPageUrl: null
        };
    }
}

class ReadabilityExtractor {
    async extract(url) {
        throw new Error('ReadabilityExtractor not implemented yet');
    }
}

class DiffbotExtractor {
    constructor(token) {
        this.token = token;
    }

    async extract(url) {
        throw new Error('DiffbotExtractor not implemented yet');
    }
}

module.exports = {
    MercuryExtractor,
    ReadabilityExtractor,
    DiffbotExtractor
};
