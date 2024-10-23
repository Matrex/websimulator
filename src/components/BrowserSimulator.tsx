import React, { useState, useRef, useEffect } from 'react';
import { Globe, ArrowLeft, ArrowRight, Home, RotateCw, Bell, MoreVertical, Loader2 } from 'lucide-react';
import { ContextMenu } from './ContextMenu';
import { VersionControl } from './VersionControl';
import { VersionManager } from '../utils/versionControl';
import { AgentOrchestrator } from '../agents/AgentOrchestrator';
import { cacheService } from '../services/cache/CacheService';
import { rateLimiter } from '../services/ratelimiter/RateLimiter';
import { constants } from '../config/constants';
import { openRouterService } from '../services/api/OpenRouter';

interface EditingContent {
    show: boolean;
    type: 'content' | 'style';
    element?: HTMLElement;
    value: string;
}

interface ContextMenuState {
    show: boolean;
    x: number;
    y: number;
    element?: HTMLElement;
}

type ImageType = 'all' | 'photo' | 'illustration' | 'vector';

export const BrowserSimulator: React.FC = () => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [generatedContent, setGeneratedContent] = useState('');
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({ show: false, x: 0, y: 0 });
    const [editingContent, setEditingContent] = useState<EditingContent>({ 
        show: false, 
        type: 'content', 
        value: '' 
    });
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const versionManager = useRef(new VersionManager());
    const orchestrator = useRef(new AgentOrchestrator());

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setLoadingProgress(prev => {
                    if (prev >= 90) return prev;
                    return prev + Math.random() * 10;
                });
            }, 500);
            return () => clearInterval(interval);
        } else {
            setLoadingProgress(0);
        }
    }, [loading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) {
            setError('Please enter a description');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Check cache first
            const cachedContent = await cacheService.get(input);
            if (cachedContent) {
                setGeneratedContent(cachedContent);
                versionManager.current.addVersion(cachedContent, 'Loaded from cache');
                return;
            }

            // Check rate limit
            try {
                const canProceed = await rateLimiter.canMakeRequest();
                if (!canProceed) {
                    throw new Error(constants.ERRORS.RATE_LIMIT);
                }
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                }
                return;
            }

            const result = await orchestrator.current.generate({
                content: input,
                requirements: {
                    images: {
                        query: input,
                        count: 3,
                        type: 'photo' as ImageType
                    }
                }
            });

            const fullContent = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <style>
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                            }
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            }
                            ${result.css}
                        </style>
                    </head>
                    <body>
                        ${result.html}
                        <script>${result.js}</script>
                    </body>
                </html>
            `;

            await cacheService.set(input, fullContent);
            setGeneratedContent(fullContent);
            versionManager.current.addVersion(fullContent, 'Initial generation');
            setLoadingProgress(100);
        } catch (error) {
            setError(constants.ERRORS.GENERATION);
            console.error('Generation error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!iframeRef.current) return;

        const iframe = iframeRef.current;
        const rect = iframe.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Get element at position in iframe
        const element = document.elementFromPoint(x, y) as HTMLElement;
        if (!element) return;

        setContextMenu({
            show: true,
            x: e.clientX,
            y: e.clientY,
            element
        });
    };

    const handleContextAction = async (action: string) => {
        if (!contextMenu.element || !iframeRef.current?.contentDocument) return;

        try {
            const element = contextMenu.element;
            
            switch (action) {
                case 'edit':
                    setEditingContent({
                        show: true,
                        type: 'content',
                        element,
                        value: element.innerHTML
                    });
                    break;

                case 'style':
                    const computedStyle = window.getComputedStyle(element);
                    const currentStyles = Array.from(computedStyle)
                        .filter(prop => computedStyle.getPropertyValue(prop))
                        .map(prop => `${prop}: ${computedStyle.getPropertyValue(prop)};`)
                        .join('\n');
                    
                    setEditingContent({
                        show: true,
                        type: 'style',
                        element,
                        value: currentStyles
                    });
                    break;

                case 'copy':
                    const clone = element.cloneNode(true) as HTMLElement;
                    element.parentNode?.insertBefore(clone, element.nextSibling);
                    versionManager.current.addVersion(
                        iframeRef.current.contentDocument.documentElement.outerHTML,
                        'Element duplicated'
                    );
                    break;

                case 'delete':
                    element.remove();
                    versionManager.current.addVersion(
                        iframeRef.current.contentDocument.documentElement.outerHTML,
                        'Element deleted'
                    );
                    break;
            }
        } catch (error) {
            setError('Failed to perform action. Please try again.');
            console.error('Context menu action error:', error);
        }

        setContextMenu({ show: false, x: 0, y: 0 });
    };

    const handleEditingSave = async () => {
        if (!editingContent.element || !editingContent.show || !iframeRef.current?.contentDocument) return;

        try {
            if (editingContent.type === 'content') {
                // Generate new content using AI
                const result = await openRouterService.generateCode(editingContent.value, {
                    elementType: editingContent.element.tagName.toLowerCase(),
                    existingContent: editingContent.element.innerHTML
                });

                editingContent.element.innerHTML = result.html;
                
                // Add any new styles
                if (result.css) {
                    const styleElement = iframeRef.current.contentDocument.createElement('style');
                    styleElement.textContent = result.css;
                    iframeRef.current.contentDocument.head.appendChild(styleElement);
                }
            } else {
                const styleObj = editingContent.value.split(';')
                    .filter(style => style.trim())
                    .reduce((acc, style) => {
                        const [prop, value] = style.split(':').map(s => s.trim());
                        if (prop && value) {
                            acc[prop] = value;
                        }
                        return acc;
                    }, {} as { [key: string]: string });

                Object.assign(editingContent.element.style, styleObj);
            }

            versionManager.current.addVersion(
                iframeRef.current.contentDocument.documentElement.outerHTML,
                `${editingContent.type === 'content' ? 'Content' : 'Style'} edited`
            );
        } catch (error) {
            setError('Failed to save changes. Please try again.');
            console.error('Editing save error:', error);
        }

        setEditingContent({ show: false, type: 'content', value: '' });
    };

    const handleRevisionSubmit = async (prompt: string) => {
        try {
            setLoading(true);
            const result = await openRouterService.generateCode(prompt, {
                context: 'Revising existing content',
                existingContent: generatedContent
            });

            const fullContent = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <style>
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                            }
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            }
                            ${result.css}
                        </style>
                    </head>
                    <body>
                        ${result.html}
                        <script>${result.js}</script>
                    </body>
                </html>
            `;

            setGeneratedContent(fullContent);
            versionManager.current.addVersion(fullContent, `Revision: ${prompt}`);
        } catch (error) {
            setError('Failed to apply revision. Please try again.');
            console.error('Revision error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8">
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
                {/* Browser Chrome */}
                <div className="bg-gray-100 border-b border-gray-200">
                    {/* Window Controls */}
                    <div className="flex items-center p-3 gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        
                        {/* Navigation */}
                        <div className="flex items-center gap-2 ml-4">
                            <button className="p-1.5 hover:bg-gray-200 rounded-full">
                                <ArrowLeft className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-200 rounded-full">
                                <ArrowRight className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-200 rounded-full">
                                <Home className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-200 rounded-full">
                                <RotateCw className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* URL/Input Bar */}
                    <form onSubmit={handleSubmit} className="px-4 pb-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border shadow-sm">
                            <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="What would you like to create today?"
                                className="flex-1 outline-none text-gray-700"
                                disabled={loading}
                            />
                            {loading ? (
                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                            ) : (
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition-colors"
                                >
                                    Generate
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Loading Progress */}
                {loading && (
                    <div className="h-1 bg-gray-100">
                        <div 
                            className="h-full bg-blue-500 transition-all duration-300 ease-out"
                            style={{ width: `${loadingProgress}%` }}
                        />
                    </div>
                )}

                {/* Content Area */}
                <div className="h-[calc(100vh-12rem)]">
                    <div 
                        className="w-full h-full relative"
                        onContextMenu={handleContextMenu}
                    >
                        <iframe
                            ref={iframeRef}
                            srcDoc={generatedContent}
                            className="w-full h-full"
                            sandbox="allow-scripts"
                            title="preview"
                        />
                    </div>
                </div>

                {/* Version Control Panel */}
                <VersionControl
                    versions={versionManager.current.getVersions()}
                    currentVersion={versionManager.current.getCurrentVersion()}
                    onRestore={(id) => {
                        const content = versionManager.current.restore(id);
                        if (content) setGeneratedContent(content);
                    }}
                    onSubmitRevision={handleRevisionSubmit}
                />

                {/* Context Menu */}
                {contextMenu.show && (
                    <ContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        element={contextMenu.element}
                        onAction={handleContextAction}
                        onClose={() => setContextMenu({ show: false, x: 0, y: 0 })}
                    />
                )}

                {/* Edit Modal */}
                {editingContent.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-4 w-2/3 max-h-[80vh] flex flex-col">
                            <h3 className="text-lg font-semibold mb-2">
                                {editingContent.type === 'content' ? 'Edit Content' : 'Edit Style'}
                            </h3>
                            <textarea
                                value={editingContent.value}
                                onChange={(e) => setEditingContent(prev => ({ ...prev, value: e.target.value }))}
                                className="flex-1 min-h-[300px] p-2 border rounded font-mono text-sm"
                            />
                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    onClick={() => setEditingContent({ show: false, type: 'content', value: '' })}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditingSave}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Toast */}
                {error && (
                    <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up">
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
