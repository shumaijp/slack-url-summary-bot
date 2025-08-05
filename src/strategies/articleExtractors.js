import Mercury from '@postlight/parser';

export class MercuryExtractor {
    async extract(url) {
        const result = await Mercury.parse(url);
        const contentText = result.content.replace(/<[^>]+>/g, '');
        console.log(`Extracted Article: ${contentText}`);
        return {
            title: result.title,
            content: contentText,
            url: result.url,
            nextPageUrl: null
        };
    }
}

export class ReadabilityExtractor {
    async extract(url) {
        throw new Error('ReadabilityExtractor not implemented yet');
    }
}

export class DiffbotExtractor {
    constructor(token) {
        this.token = token;
    }

    async extract(url) {
        throw new Error('DiffbotExtractor not implemented yet');
    }
}
