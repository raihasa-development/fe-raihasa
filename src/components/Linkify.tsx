import React from 'react';

/**
 * Linkify Component
 * Detects URLs in text and renders them as clickable links (a tags).
 * URL detection pattern: http:// or https:// followed by non-whitespace characters.
 */
export const Linkify = ({ children, className }: { children: string; className?: string }) => {
    if (!children) return null;

    // Simple regex for URLs starting with http or https
    // Captures the URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const parts = children.split(urlRegex);

    return (
        <span className={className}>
            {parts.map((part, i) => {
                if (part.match(urlRegex)) {
                    return (
                        <a
                            key={i}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1B7691] hover:underline cursor-pointer break-all"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </a>
                    );
                }
                return part;
            })}
        </span>
    );
};
