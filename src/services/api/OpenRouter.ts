import { constants } from '../../config/constants';

interface GenerationOptions {
    context?: string;
    style?: string;
    elementType?: string;
    existingContent?: string;
    promptType?: 'INITIAL' | 'EDIT' | 'REVISION' | 'ELEMENT_EDIT' | 'STYLE_EDIT' | 'COMPONENT' | 'GALLERY';
}

class OpenRouterService {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
        this.baseUrl = constants.API.OPENROUTER_URL;
    }

    async generateCode(prompt: string, options: GenerationOptions = {}) {
        try {
            const enhancedPrompt = this.constructPrompt(prompt, options);
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
                    'X-Title': 'WebSim.ai'
                },
                body: JSON.stringify({
                    model: 'anthropic/claude-3-opus-20240229',
                    messages: [
                        {
                            role: 'system',
                            content: this.getSystemPrompt(options)
                        },
                        {
                            role: 'user',
                            content: enhancedPrompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 4096
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return this.parseResponse(data);
        } catch (error) {
            console.error('OpenRouter API error:', error);
            throw error;
        }
    }

    private getSystemPrompt(options: GenerationOptions): string {
        const prompts = constants.PROMPTS.SYSTEM;
        const promptType = options.promptType || 'INITIAL';
        let systemPrompt = '';

        if (options.elementType === 'code') {
            systemPrompt = (prompts.CODE as any)[promptType] || prompts.CODE.INITIAL;
        } else if (options.elementType === 'layout') {
            systemPrompt = (prompts.LAYOUT as any)[promptType] || prompts.LAYOUT.INITIAL;
        } else if (options.elementType === 'image') {
            systemPrompt = (prompts.IMAGE as any)[promptType] || prompts.IMAGE.INITIAL;
        } else {
            systemPrompt = prompts.GENERAL || '';
        }

        systemPrompt += `\n
Key requirements:
- Use semantic HTML5 elements
- Implement modern CSS best practices
- Write clean, efficient JavaScript
- Ensure responsive design
- Follow accessibility guidelines
- Create engaging animations
- Use proper error handling
- Implement user feedback
- Optimize performance`;

        if (options.style) {
            systemPrompt += `\nAdhere to this style guide: ${options.style}`;
        }

        return systemPrompt;
    }

    private constructPrompt(prompt: string, options: GenerationOptions): string {
        let enhancedPrompt = prompt;

        if (options.context) {
            enhancedPrompt = `Context: ${options.context}\n\nRequest: ${prompt}`;
        }

        if (options.existingContent) {
            enhancedPrompt += `\n\nExisting content to modify: ${options.existingContent}`;
        }

        enhancedPrompt += `\n
Please provide the code in three distinct sections:
1. HTML: Semantic structure with proper accessibility attributes
2. CSS: Modern styling with responsive design and animations
3. JavaScript: Clean, efficient code with proper event handling

Additional requirements:
- Use CSS Grid and Flexbox for layouts
- Implement smooth transitions and animations
- Add hover states and interactive elements
- Ensure mobile responsiveness
- Include error handling and loading states
- Add appropriate ARIA labels and roles
- Optimize for performance`;

        return enhancedPrompt;
    }

    private parseResponse(data: any) {
        const content = data.choices[0].message.content;
        
        // Extract code blocks with improved regex patterns
        const htmlMatch = content.match(/```html\n([\s\S]*?)```/);
        const cssMatch = content.match(/```css\n([\s\S]*?)```/);
        const jsMatch = content.match(/```javascript\n([\s\S]*?)```/);

        // Clean and format the extracted code
        const html = this.formatCode(htmlMatch ? htmlMatch[1].trim() : '');
        const css = this.formatCode(cssMatch ? cssMatch[1].trim() : '');
        const js = this.formatCode(jsMatch ? jsMatch[1].trim() : '');

        return {
            html,
            css,
            js,
            raw: content
        };
    }

    private formatCode(code: string): string {
        // Remove extra whitespace and empty lines
        return code
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
    }
}

export const openRouterService = new OpenRouterService();
