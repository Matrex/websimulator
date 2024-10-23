export const constants = {
    API: {
        OPENROUTER_URL: 'https://openrouter.ai/api/v1',
        PIXABAY_URL: process.env.NEXT_PUBLIC_API_URL || 'https://pixabay.com/api/',
        MAX_IMAGES: Number(process.env.NEXT_PUBLIC_MAX_IMAGES_PER_REQUEST) || 5
    },
    RATE_LIMIT: {
        MAX_REQUESTS: 50,
        WINDOW_MS: 60000 // 1 minute
    },
    CACHE: {
        DURATION: Number(process.env.NEXT_PUBLIC_CACHE_DURATION_MINUTES) * 60 * 1000 || 3600000 // 1 hour default
    },
    PROMPTS: {
        SYSTEM: {
            GENERAL: process.env.NEXT_PUBLIC_SYSTEM_PROMPT_GENERAL,
            CODE: {
                INITIAL: "Focus on generating semantic HTML, modern CSS, and vanilla JavaScript. Ensure all code follows current best practices and WCAG guidelines.",
                EDIT: "Modify existing code while maintaining structure and functionality. Focus on the specific element being edited.",
                REVISION: "Update the existing code based on user feedback while preserving core functionality."
            },
            LAYOUT: {
                INITIAL: "Analyze the user's needs and create appropriate layouts. Consider responsive design, visual hierarchy, and user experience principles.",
                EDIT: "Modify the layout while maintaining overall structure and responsiveness.",
                REVISION: "Adjust the layout based on user feedback while preserving the core design principles."
            },
            IMAGE: {
                INITIAL: "When handling images, ensure proper lazy loading, alt text, and optimized delivery. Consider art direction and visual impact.",
                EDIT: "Modify image presentation while maintaining performance and accessibility.",
                REVISION: "Update image handling based on user feedback while preserving optimization."
            }
        },
        AGENTS: {
            CODE: {
                INITIAL: "Generate clean, semantic code with modern best practices.",
                EDIT: "Modify specific code elements while maintaining consistency.",
                ELEMENT_EDIT: "Update the selected element while preserving context.",
                STYLE_EDIT: "Modify styles while maintaining design consistency."
            },
            LAYOUT: {
                INITIAL: "Create responsive, user-friendly layouts.",
                EDIT: "Adjust layout structure while maintaining responsiveness.",
                COMPONENT: "Design specific components within the layout."
            },
            IMAGE: {
                INITIAL: "Select and optimize images for the content.",
                EDIT: "Modify image presentation and optimization.",
                GALLERY: "Create image galleries and collections."
            }
        },
        CONTEXT: {
            ELEMENT_EDIT: "Editing a specific element within the generated content.",
            STYLE_EDIT: "Modifying styles for a specific element.",
            REVISION: "Making broader changes to the entire content.",
            COMPONENT: "Working with specific components or sections."
        }
    },
    ERRORS: {
        API_KEY: process.env.NEXT_PUBLIC_ERROR_MSG_API_KEY || 'API key not found in environment variables',
        RATE_LIMIT: process.env.NEXT_PUBLIC_ERROR_MSG_RATE_LIMIT || 'Rate limit exceeded. Please try again later',
        GENERATION: process.env.NEXT_PUBLIC_ERROR_MSG_GENERATION || 'Error generating content. Please refine your prompt'
    }
};
