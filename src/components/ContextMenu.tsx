import React, { useEffect, useRef } from 'react';
import { Edit, Copy, Trash, Paintbrush } from 'lucide-react';

interface ContextMenuProps {
    x: number;
    y: number;
    onAction: (action: string, data?: any) => void;
    onClose: () => void;
    element?: HTMLElement;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
    x,
    y,
    onAction,
    onClose,
    element
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const menuItems = [
        {
            label: 'Edit Content',
            icon: Edit,
            action: 'edit',
            description: 'Modify the element content'
        },
        {
            label: 'Edit Style',
            icon: Paintbrush,
            action: 'style',
            description: 'Change element styling'
        },
        {
            label: 'Duplicate',
            icon: Copy,
            action: 'copy',
            description: 'Create a copy of this element'
        },
        {
            label: 'Delete',
            icon: Trash,
            action: 'delete',
            description: 'Remove this element',
            className: 'text-red-600 hover:bg-red-50'
        }
    ];

    const getElementInfo = () => {
        if (!element) return null;
        
        return {
            tag: element.tagName.toLowerCase(),
            classes: Array.from(element.classList).join(' '),
            id: element.id
        };
    };

    const elementInfo = getElementInfo();

    return (
        <div
            ref={menuRef}
            className="fixed z-50 w-64 rounded-lg bg-white shadow-xl border border-gray-200 overflow-hidden"
            style={{
                left: x,
                top: y,
                transform: 'translate(8px, 8px)'
            }}
        >
            {/* Element Info */}
            {elementInfo && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="text-xs font-mono text-gray-600">
                        <span className="text-purple-600">{elementInfo.tag}</span>
                        {elementInfo.id && (
                            <span className="text-blue-600">#{elementInfo.id}</span>
                        )}
                        {elementInfo.classes && (
                            <span className="text-green-600">.{elementInfo.classes}</span>
                        )}
                    </div>
                </div>
            )}

            {/* Menu Items */}
            <div className="py-1">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 ${
                            item.className || 'text-gray-700'
                        }`}
                        onClick={() => {
                            onAction(item.action);
                            onClose();
                        }}
                    >
                        <item.icon className="w-4 h-4" />
                        <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
