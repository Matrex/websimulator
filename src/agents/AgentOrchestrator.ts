import { CodeGenAgent } from './CodeAgent';
import { LayoutAgent } from './LayoutAgent';
import { ImageAgent } from './ImageAgent';
import { constants } from '../config/constants';

interface GenerationRequest {
    content: string;
    requirements?: {
        layout?: string;
        images?: {
            query?: string;
            count?: number;
            type?: 'all' | 'photo' | 'illustration' | 'vector';
        };
        style?: {
            theme?: string;
            colorScheme?: string;
        };
    };
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

export class AgentOrchestrator {
    private codeAgent: CodeGenAgent;
    private layoutAgent: LayoutAgent;
    private imageAgent: ImageAgent;

    constructor() {
        this.codeAgent = new CodeGenAgent();
        this.layoutAgent = new LayoutAgent();
        this.imageAgent = new ImageAgent();
    }

    async generate(request: GenerationRequest): Promise<GenerationResult> {
        try {
            // Step 1: Handle image requirements if present
            let imageData;
            if (request.requirements?.images?.query) {
                const imageResult = await this.imageAgent.process({
                    query: request.requirements.images.query,
                    count: request.requirements.images.count,
                    type: request.requirements.images.type
                });

                if (imageResult.images.length > 0) {
                    const layout = await this.imageAgent.suggestImageLayout(imageResult.images);
                    imageData = {
                        processed: imageResult.images,
                        layout
                    };
                }
            }

            // Step 2: Determine layout requirements
            let layoutRequirements;
            if (request.requirements?.layout || imageData?.layout) {
                layoutRequirements = await this.layoutAgent.process({
                    type: request.requirements?.layout || imageData?.layout || 'standard',
                    elements: this.determineLayoutElements(request, imageData),
                    constraints: {
                        responsive: true
                    }
                });
            }

            // Step 3: Generate final code
            const generationState = {
                content: request.content,
                requirements: {
                    ...request.requirements,
                    layout: layoutRequirements
                },
                images: imageData
            };

            const result = await this.codeAgent.process(generationState);

            return {
                html: result.html,
                css: this.combineCSS(result.css, layoutRequirements?.css),
                js: result.js,
                meta: {
                    ...result.meta,
                    layout: layoutRequirements?.layout || 'standard'
                }
            };
        } catch (error) {
            console.error('Generation orchestration error:', error);
            throw new Error(constants.ERRORS.GENERATION);
        }
    }

    private determineLayoutElements(request: GenerationRequest, imageData?: any) {
        const elements = [];

        // Add image elements if present
        if (imageData?.processed) {
            elements.push({
                type: imageData.processed.length === 1 ? 'single-image' : 'gallery',
                content: 'images'
            });
        }

        // Add other elements based on content analysis
        if (request.content.toLowerCase().includes('header')) {
            elements.push({ type: 'header' });
        }

        if (request.content.toLowerCase().includes('footer')) {
            elements.push({ type: 'footer' });
        }

        // Add a main content section by default
        elements.push({ type: 'main-content' });

        return elements;
    }

    private combineCSS(generatedCSS: string, layoutCSS?: string): string {
        if (!layoutCSS) return generatedCSS;

        return `
            /* Layout Styles */
            ${layoutCSS}

            /* Generated Styles */
            ${generatedCSS}
        `;
    }
}
