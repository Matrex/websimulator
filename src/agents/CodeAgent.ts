import { BaseAgent } from './BaseAgent';
import { openRouterService } from '../services/api/OpenRouter';
import { constants } from '../config/constants';

interface ImageData {
    processed?: Array<{
        url: string;
        alt: string;
        width: number;
        height: number;
    }>;
    layout?: string;
}

interface GenerationState {
    content: string;
    requirements?: any;
    images?: ImageData;
}

interface GenerationResult {
    html: string;
    css: string;
    js: string;
    meta: {
        generatedAt: number;
        imageCount?: number;
        layout?: string;
    };
}

export class CodeGenAgent extends BaseAgent {
    constructor() {
        super('codeGen');
    }

    async process(state: GenerationState): Promise<GenerationResult> {
        await this.logMessage({ 
            type: 'generation', 
            content: state.content,
            hasImages: !!state.images?.processed?.length
        });

        try {
            const response = await openRouterService.generateCode(
                this.constructPrompt(state)
            );

            return {
                html: response.html,
                css: response.css,
                js: response.js,
                meta: {
                    generatedAt: Date.now(),
                    imageCount: state.images?.processed?.length || 0,
                    layout: state.images?.layout || 'default'
                }
            };
        } catch (error) {
            console.error('Code generation error:', error);
            throw new Error(constants.ERRORS.GENERATION);
        }
    }

    private constructPrompt(state: GenerationState): string {
        let prompt = this.constructFullPrompt(state.content);

        if (state.requirements) {
            prompt += `\n\nRequirements:\n${JSON.stringify(state.requirements, null, 2)}`;
        }

        if (state.images?.processed?.length) {
            const imageInfo = state.images.processed.map(img => ({
                url: img.url,
                alt: img.alt,
                dimensions: `${img.width}x${img.height}`
            }));

            prompt += `\n\nInclude these images:\n${JSON.stringify(imageInfo, null, 2)}`;
            
            if (state.images.layout) {
                prompt += `\n\nUse this layout style: ${state.images.layout}`;
            }
        }

        return prompt;
    }
}
