import FirecrawlApp from '@mendable/firecrawl-js';

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

export async function getWebsiteData(url: string) {
    try {
        const scrapeResponse = await app.scrapeUrl(url, {
            formats: ['markdown'],
        });
        if (scrapeResponse.success) {
            return scrapeResponse.markdown
        }
        throw new Error(scrapeResponse.error)
    } catch (error) {
        throw error
    }
}