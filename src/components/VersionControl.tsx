import React, { useState } from 'react';
import { History, ChevronRight, Send } from 'lucide-react';

interface Version {
    id: number;
    content: string;
    timestamp: number;
    description: string;
}

interface VersionControlProps {
    versions: Version[];
    currentVersion: number;
    onRestore: (id: number) => void;
    onSubmitRevision: (prompt: string) => void;
}

export const VersionControl: React.FC<VersionControlProps> = ({
    versions,
    currentVersion,
    onRestore,
    onSubmitRevision
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [revisionPrompt, setRevisionPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (revisionPrompt.trim()) {
            onSubmitRevision(revisionPrompt);
            setRevisionPrompt('');
        }
    };

    return (
        <div className={`fixed right-0 top-0 h-full bg-white shadow-lg transition-all duration-300 ${isOpen ? 'w-80' : 'w-12'}`}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute left-0 top-1/2 -translate-x-full transform rounded-l-lg bg-white p-2 shadow-lg"
            >
                <ChevronRight className={`h-6 w-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Panel Content */}
            <div className="h-full overflow-hidden">
                {isOpen && (
                    <div className="flex h-full flex-col">
                        {/* Header */}
                        <div className="border-b p-4">
                            <div className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                <h2 className="font-semibold">Version History</h2>
                            </div>
                        </div>

                        {/* Versions List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {versions.map((version) => (
                                <div
                                    key={version.id}
                                    className={`mb-3 cursor-pointer rounded-lg border p-3 transition-colors ${
                                        version.id === currentVersion
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                    onClick={() => onRestore(version.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Version {version.id + 1}</span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(version.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">{version.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Revision Input */}
                        <div className="border-t p-4">
                            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                                <textarea
                                    value={revisionPrompt}
                                    onChange={(e) => setRevisionPrompt(e.target.value)}
                                    placeholder="Describe your changes..."
                                    className="min-h-[100px] rounded-lg border p-2 text-sm focus:border-blue-500 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                                    disabled={!revisionPrompt.trim()}
                                >
                                    <Send className="h-4 w-4" />
                                    Submit Revision
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
