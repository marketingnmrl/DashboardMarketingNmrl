"use client";

import { useState, useRef, useEffect } from "react";
import type { CRMTag } from "@/types/crm";
import { TagBadge } from "./TagBadge";

interface TagSelectorProps {
    availableTags: CRMTag[];
    selectedTags: CRMTag[];
    onTagSelect: (tag: CRMTag) => void;
    onTagRemove: (tagId: string) => void;
    onCreateTag?: (name: string, color: string) => Promise<CRMTag | null>;
    placeholder?: string;
}

const TAG_COLORS = [
    "#EF4444", // Red
    "#F97316", // Orange
    "#EAB308", // Yellow
    "#22C55E", // Green
    "#14B8A6", // Teal
    "#3B82F6", // Blue
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#6B7280", // Gray
    "#19069E", // Brand purple
];

export function TagSelector({
    availableTags,
    selectedTags,
    onTagSelect,
    onTagRemove,
    onCreateTag,
    placeholder = "Selecione ou crie tags..."
}: TagSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
    const [isCreating, setIsCreating] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter tags not already selected
    const filteredTags = availableTags
        .filter(tag => !selectedTags.some(s => s.id === tag.id))
        .filter(tag => tag.name.toLowerCase().includes(search.toLowerCase()));

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCreateTag = async () => {
        if (!onCreateTag || !search.trim()) return;

        setIsCreating(true);
        const newTag = await onCreateTag(search.trim(), newTagColor);
        if (newTag) {
            onTagSelect(newTag);
            setSearch("");
        }
        setIsCreating(false);
    };

    const showCreateOption = search.trim() &&
        !availableTags.some(t => t.name.toLowerCase() === search.toLowerCase().trim()) &&
        onCreateTag;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Selected tags display */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="min-h-[42px] px-3 py-2 border border-gray-200 rounded-xl bg-white cursor-pointer hover:border-gray-300 transition-colors flex flex-wrap gap-1.5 items-center"
            >
                {selectedTags.map(tag => (
                    <TagBadge
                        key={tag.id}
                        tag={tag}
                        size="md"
                        onRemove={() => onTagRemove(tag.id)}
                    />
                ))}
                {selectedTags.length === 0 && (
                    <span className="text-gray-400 text-sm">{placeholder}</span>
                )}
                <span className="material-symbols-outlined text-gray-400 ml-auto text-[18px]">
                    {isOpen ? "expand_less" : "expand_more"}
                </span>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-hidden">
                    {/* Search input */}
                    <div className="p-2 border-b border-gray-100">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar ou criar tag..."
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                            autoFocus
                        />
                    </div>

                    {/* Tag list */}
                    <div className="max-h-40 overflow-y-auto p-1">
                        {filteredTags.map(tag => (
                            <button
                                key={tag.id}
                                onClick={() => {
                                    onTagSelect(tag);
                                    setSearch("");
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: tag.color }}
                                />
                                <span className="text-sm text-gray-700">{tag.name}</span>
                            </button>
                        ))}

                        {filteredTags.length === 0 && !showCreateOption && (
                            <p className="px-3 py-2 text-sm text-gray-400 text-center">
                                Nenhuma tag encontrada
                            </p>
                        )}
                    </div>

                    {/* Create new tag option */}
                    {showCreateOption && (
                        <div className="border-t border-gray-100 p-2 bg-gray-50">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-gray-500">Cor:</span>
                                <div className="flex gap-1">
                                    {TAG_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setNewTagColor(color)}
                                            className={`w-5 h-5 rounded-full transition-transform ${newTagColor === color ? "ring-2 ring-offset-1 ring-gray-400 scale-110" : ""
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={handleCreateTag}
                                disabled={isCreating}
                                className="w-full px-3 py-2 bg-[#19069E] text-white text-sm font-bold rounded-lg hover:bg-[#12047a] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isCreating ? (
                                    <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                )}
                                Criar "{search.trim()}"
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
