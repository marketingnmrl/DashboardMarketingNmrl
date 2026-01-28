"use client";

import type { CRMTag } from "@/types/crm";

interface TagBadgeProps {
    tag: CRMTag;
    onRemove?: () => void;
    size?: "sm" | "md";
}

export function TagBadge({ tag, onRemove, size = "sm" }: TagBadgeProps) {
    const sizeClasses = size === "sm"
        ? "text-[10px] px-1.5 py-0.5 gap-1"
        : "text-xs px-2 py-1 gap-1.5";

    // Calculate text color based on background brightness
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    };

    const rgb = hexToRgb(tag.color);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    const textColor = brightness > 128 ? "#1f2937" : "#ffffff";

    return (
        <span
            className={`inline-flex items-center font-medium rounded-full ${sizeClasses}`}
            style={{
                backgroundColor: tag.color,
                color: textColor
            }}
        >
            {tag.name}
            {onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="hover:opacity-70 transition-opacity"
                    title="Remover tag"
                >
                    ×
                </button>
            )}
        </span>
    );
}

interface TagListProps {
    tags: CRMTag[];
    onRemove?: (tagId: string) => void;
    maxVisible?: number;
}

export function TagList({ tags, onRemove, maxVisible = 3 }: TagListProps) {
    const visibleTags = tags.slice(0, maxVisible);
    const hiddenCount = tags.length - maxVisible;

    return (
        <div className="flex flex-wrap gap-1 items-center">
            {visibleTags.map(tag => (
                <TagBadge
                    key={tag.id}
                    tag={tag}
                    onRemove={onRemove ? () => onRemove(tag.id) : undefined}
                />
            ))}
            {hiddenCount > 0 && (
                <span className="text-[10px] text-gray-400 px-1">
                    +{hiddenCount}
                </span>
            )}
        </div>
    );
}
