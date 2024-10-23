import { constants } from '../../config/constants';

class RateLimiter {
    private requests: Map<string, number[]>;
    private maxRequests: number;
    private timeWindow: number;

    constructor() {
        this.requests = new Map();
        this.maxRequests = constants.RATE_LIMIT.MAX_REQUESTS;
        this.timeWindow = constants.RATE_LIMIT.WINDOW_MS;
    }

    async checkLimit(key: string): Promise<boolean> {
        const now = Date.now();
        const userRequests = this.requests.get(key) || [];
        
        // Clean old requests
        const validRequests = userRequests.filter(
            timestamp => now - timestamp < this.timeWindow
        );
        
        if (validRequests.length >= this.maxRequests) {
            throw new Error('Rate limit exceeded. Please wait before trying again.');
        }
        
        validRequests.push(now);
        this.requests.set(key, validRequests);
        return true;
    }

    canMakeRequest(): Promise<boolean> {
        // Use a default key for general rate limiting
        return this.checkLimit('default');
    }
}

export const rateLimiter = new RateLimiter();
