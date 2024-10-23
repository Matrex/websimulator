import { constants } from '../../config/constants';

class CacheService {
    private cache: Map<string, any>;
    private maxAge: number;

    constructor(maxAge: number = constants.CACHE.DURATION) {
        this.cache = new Map();
        this.maxAge = maxAge;
    }

    set(key: string, value: any): void {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    get(key: string): any {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > this.maxAge) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    clear(): void {
        this.cache.clear();
    }
}

export const cacheService = new CacheService();
