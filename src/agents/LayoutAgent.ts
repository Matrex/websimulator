import { BaseAgent } from './BaseAgent';
import { constants } from '../config/constants';

interface LayoutRequirements {
    type: string;
    elements: Array<{
        type: string;
        content?: string;
        size?: {
            width?: number;
            height?: number;
        };
    }>;
    constraints?: {
        maxWidth?: number;
        responsive?: boolean;
        spacing?: string;
    };
}

interface LayoutResult {
    layout: string;
    css: string;
    meta: {
        type: string;
        timestamp: number;
        responsive: boolean;
    };
}

export class LayoutAgent extends BaseAgent {
    constructor() {
        super('layout');
    }

    async process(requirements: LayoutRequirements): Promise<LayoutResult> {
        await this.logMessage({
            type: 'layout_generation',
            requirements
        });

        try {
            // Analyze requirements and generate appropriate layout
            const layoutType = this.determineLayoutType(requirements);
            const layoutCSS = this.generateLayoutCSS(requirements);

            return {
                layout: layoutType,
                css: layoutCSS,
                meta: {
                    type: layoutType,
                    timestamp: Date.now(),
                    responsive: requirements.constraints?.responsive ?? true
                }
            };
        } catch (error) {
            console.error('Layout generation error:', error);
            throw new Error(constants.ERRORS.GENERATION);
        }
    }

    private determineLayoutType(requirements: LayoutRequirements): string {
        // If type is explicitly specified, use it
        if (requirements.type) {
            return requirements.type;
        }

        // Analyze elements to determine best layout
        const elementTypes = requirements.elements.map(el => el.type);
        
        if (elementTypes.includes('hero')) {
            return 'landing';
        }

        if (elementTypes.includes('sidebar')) {
            return 'dashboard';
        }

        if (elementTypes.includes('gallery')) {
            return 'grid';
        }

        // Default to standard layout
        return 'standard';
    }

    private generateLayoutCSS(requirements: LayoutRequirements): string {
        const { constraints = {} } = requirements;
        const { maxWidth = 1200, responsive = true, spacing = '1rem' } = constraints;

        let css = `
            .container {
                max-width: ${maxWidth}px;
                margin: 0 auto;
                padding: ${spacing};
            }
        `;

        if (responsive) {
            css += `
                @media (max-width: 768px) {
                    .container {
                        padding: calc(${spacing} / 2);
                    }
                }
            `;
        }

        // Add layout-specific styles based on type
        switch (requirements.type) {
            case 'landing':
                css += this.getLandingPageCSS(requirements);
                break;
            case 'dashboard':
                css += this.getDashboardCSS(requirements);
                break;
            case 'grid':
                css += this.getGridLayoutCSS(requirements);
                break;
            default:
                css += this.getStandardLayoutCSS(requirements);
        }

        return css;
    }

    private getLandingPageCSS(requirements: LayoutRequirements): string {
        return `
            .hero {
                min-height: 80vh;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 2rem;
            }

            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                padding: 4rem 2rem;
            }
        `;
    }

    private getDashboardCSS(requirements: LayoutRequirements): string {
        return `
            .dashboard {
                display: grid;
                grid-template-columns: 250px 1fr;
                min-height: 100vh;
            }

            .sidebar {
                background: #f5f5f5;
                padding: 1rem;
            }

            .main-content {
                padding: 2rem;
            }

            @media (max-width: 768px) {
                .dashboard {
                    grid-template-columns: 1fr;
                }

                .sidebar {
                    display: none;
                }
            }
        `;
    }

    private getGridLayoutCSS(requirements: LayoutRequirements): string {
        return `
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 1.5rem;
                padding: 1.5rem;
            }

            .grid-item {
                background: #fff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
        `;
    }

    private getStandardLayoutCSS(requirements: LayoutRequirements): string {
        return `
            .content {
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
            }

            .section {
                margin-bottom: 3rem;
            }
        `;
    }
}
