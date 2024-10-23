import { constants } from '../config/constants';

interface AgentMessage {
    timestamp: number;
    agent: string;
    type: string;
    content: any;
}

interface SystemPrompts {
    INITIAL: string;
    EDIT: string;
    REVISION: string;
}

interface AgentPrompts {
    INITIAL: string;
    EDIT: string;
    REVISION?: string;
    ELEMENT_EDIT?: string;
    STYLE_EDIT?: string;
    COMPONENT?: string;
    GALLERY?: string;
}

type PromptType = 'INITIAL' | 'EDIT' | 'REVISION' | 'ELEMENT_EDIT' | 'STYLE_EDIT' | 'COMPONENT' | 'GALLERY';

export abstract class BaseAgent {
    protected name: string;
    protected messageQueue: AgentMessage[];
    protected systemPrompt: SystemPrompts;
    protected agentPrompt: AgentPrompts;

    constructor(name: string) {
        this.name = name;
        this.messageQueue = [];
        this.systemPrompt = this.getSystemPrompt();
        this.agentPrompt = this.getAgentPrompt();
    }

    abstract process(message: any): Promise<any>;

    protected async logMessage(message: any): Promise<void> {
        this.messageQueue.push({
            timestamp: Date.now(),
            agent: this.name,
            type: message.type,
            content: message
        });

        // Keep only last 100 messages
        if (this.messageQueue.length > 100) {
            this.messageQueue = this.messageQueue.slice(-100);
        }
    }

    protected getSystemPrompt(): SystemPrompts {
        const prompts = constants.PROMPTS.SYSTEM;
        switch (this.name) {
            case 'codeGen':
                return prompts.CODE as SystemPrompts;
            case 'layout':
                return prompts.LAYOUT as SystemPrompts;
            case 'image':
                return prompts.IMAGE as SystemPrompts;
            default:
                return {
                    INITIAL: prompts.GENERAL || '',
                    EDIT: prompts.GENERAL || '',
                    REVISION: prompts.GENERAL || ''
                };
        }
    }

    protected getAgentPrompt(): AgentPrompts {
        const prompts = constants.PROMPTS.AGENTS;
        switch (this.name) {
            case 'codeGen':
                return prompts.CODE as AgentPrompts;
            case 'layout':
                return prompts.LAYOUT as AgentPrompts;
            case 'image':
                return prompts.IMAGE as AgentPrompts;
            default:
                return {
                    INITIAL: '',
                    EDIT: '',
                    REVISION: ''
                };
        }
    }

    protected getSystemPromptForType(type: PromptType): string {
        switch (type) {
            case 'INITIAL':
                return this.systemPrompt.INITIAL;
            case 'EDIT':
            case 'ELEMENT_EDIT':
            case 'STYLE_EDIT':
                return this.systemPrompt.EDIT;
            case 'REVISION':
                return this.systemPrompt.REVISION;
            case 'COMPONENT':
            case 'GALLERY':
                return this.systemPrompt.INITIAL;
            default:
                return this.systemPrompt.INITIAL;
        }
    }

    protected getAgentPromptForType(type: PromptType): string {
        return this.agentPrompt[type] || this.agentPrompt.INITIAL;
    }

    protected constructFullPrompt(userPrompt: string, type: PromptType = 'INITIAL'): string {
        const systemPromptText = this.getSystemPromptForType(type);
        const agentPromptText = this.getAgentPromptForType(type);

        return `${systemPromptText}\n\n${agentPromptText}\n\nUser Request: ${userPrompt}`;
    }

    getMessageHistory(): AgentMessage[] {
        return this.messageQueue;
    }

    clearMessageHistory(): void {
        this.messageQueue = [];
    }
}
