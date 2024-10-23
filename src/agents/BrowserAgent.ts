import { BaseAgent } from './BaseAgent';

export class BrowserAgent extends BaseAgent {
    constructor() {
        super('browser');
    }

    async process(input: string) {
        await this.logMessage({ type: 'input', content: input });

        const isUrl = input.startsWith('http');
        const requirements = await this.extractRequirements(input);

        return {
            type: isUrl ? 'url' : 'prompt',
            content: input,
            requirements,
            needsImages: this.detectImageNeeds(input),
            timestamp: Date.now()
        };
    }

    private async extractRequirements(input: string) {
        return {
            hasImages: input.toLowerCase().includes('image'),
            hasInteractivity: input.toLowerCase().includes('button'),
            hasAnimation: input.toLowerCase().includes('animate'),
            layout: 'standard'
        };
    }

    private detectImageNeeds(input: string): boolean {
        const imageTerms = ['image', 'picture', 'photo', 'gallery'];
        return imageTerms.some(term => input.toLowerCase().includes(term));
    }
}