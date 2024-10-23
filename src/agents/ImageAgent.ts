import { BaseAgent } from './BaseAgent';
import { constants } from '../config/constants';

interface ImageSearchParams {
    query: string;
    count?: number;
    type?: 'all' | 'photo' | 'illustration' | 'vector';
    orientation?: 'all' | 'horizontal' | 'vertical';
    category?: string;
    minWidth?: number;
    minHeight?: number;
}

interface ProcessedImage {
    url: string;
    alt: string;
    width: number;
    height: number;
    source: string;
    license: string;
    attribution?: string;
}

interface ImageSearchResult {
    images: ProcessedImage[];
    meta: {
        query: string;
        timestamp: number;
        total: number;
    };
}

interface PixabayImage {
    id: number;
    pageURL: string;
    type: string;
    tags: string;
    previewURL: string;
    previewWidth: number;
    previewHeight: number;
    webformatURL: string;
    webformatWidth: number;
    webformatHeight: number;
    largeImageURL: string;
    imageWidth: number;
    imageHeight: number;
    imageSize: number;
    views: number;
    downloads: number;
    collections: number;
    likes: number;
    comments: number;
    user_id: number;
    user: string;
    userImageURL: string;
}

interface PixabayResponse {
    total: number;
    totalHits: number;
    hits: PixabayImage[];
}

export class ImageAgent extends BaseAgent {
    private apiKey: string;
    private baseUrl: string;
    private maxImages: number;

    constructor() {
        super('image');
        this.apiKey = process.env.NEXT_PUBLIC_PIXABAY_API_KEY || '';
        this.baseUrl = constants.API.PIXABAY_URL;
        this.maxImages = constants.API.MAX_IMAGES;
    }

    async process(params: ImageSearchParams): Promise<ImageSearchResult> {
        await this.logMessage({
            type: 'image_search',
            params
        });

        try {
            if (!this.apiKey) {
                throw new Error(constants.ERRORS.API_KEY);
            }

            const images = await this.searchImages(params);
            const processedImages = this.processImages(images);

            return {
                images: processedImages,
                meta: {
                    query: params.query,
                    timestamp: Date.now(),
                    total: images.totalHits || 0
                }
            };
        } catch (error) {
            console.error('Image search error:', error);
            throw error;
        }
    }

    private async searchImages(params: ImageSearchParams): Promise<PixabayResponse> {
        const searchParams = new URLSearchParams({
            key: this.apiKey,
            q: params.query,
            per_page: String(params.count || this.maxImages),
            image_type: params.type || 'all',
            orientation: params.orientation || 'all',
            min_width: String(params.minWidth || 0),
            min_height: String(params.minHeight || 0),
            safesearch: 'true'
        });

        if (params.category) {
            searchParams.append('category', params.category);
        }

        const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`);
        
        if (!response.ok) {
            throw new Error(`Pixabay API error: ${response.status}`);
        }

        return response.json();
    }

    private processImages(apiResponse: PixabayResponse): ProcessedImage[] {
        if (!apiResponse.hits || !Array.isArray(apiResponse.hits)) {
            return [];
        }

        return apiResponse.hits.map(hit => ({
            url: hit.webformatURL,
            alt: this.generateAltText(hit.tags),
            width: hit.webformatWidth,
            height: hit.webformatHeight,
            source: 'Pixabay',
            license: 'Pixabay License',
            attribution: `Photo by ${hit.user}`
        }));
    }

    private generateAltText(tags: string): string {
        // Clean and format tags into a descriptive alt text
        return tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
            .join(', ');
    }

    async suggestImageLayout(images: ProcessedImage[]): Promise<string> {
        if (!images.length) return 'default';

        // Analyze image dimensions and count to suggest appropriate layout
        if (images.length === 1) {
            const image = images[0];
            if (image.width > image.height * 1.5) {
                return 'hero';
            }
            return 'single';
        }

        if (images.length <= 3) {
            return 'grid-small';
        }

        if (images.length <= 6) {
            return 'grid-medium';
        }

        return 'gallery';
    }

    getOptimizedImageUrl(image: ProcessedImage, maxWidth?: number): string {
        const url = new URL(image.url);
        
        if (maxWidth) {
            // Add width parameter if the service supports it
            url.searchParams.set('w', maxWidth.toString());
        }

        return url.toString();
    }
}
