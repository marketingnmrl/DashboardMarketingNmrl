"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomFields } from "@/hooks/useCustomFields";
import type { CustomFieldType } from "@/types/crm";

interface ApiKey {
    id: string;
    name: string;
    key_prefix: string;
    last_used_at: string | null;
    created_at: string;
}

const fieldTypeLabels: Record<CustomFieldType, string> = {
    text: "Texto",
    number: "Número",
    date: "Data",
    select: "Lista de Opções",
    boolean: "Sim/Não"
};

const fieldTypeIcons: Record<CustomFieldType, string> = {
    text: "text_fields",
    number: "123",
    date: "calendar_month",
    select: "list",
    boolean: "toggle_on"
};

export default function CRMConfiguracoesPage() {
    const { user } = useAuth();
    const { customFields, isLoading: isLoadingFields, createCustomField, deleteCustomField } = useCustomFields();

    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Custom field creation state
    const [showCreateField, setShowCreateField] = useState(false);
    const [newFieldName, setNewFieldName] = useState("");
    const [newFieldType, setNewFieldType] = useState<CustomFieldType>("text");
    const [newFieldOptions, setNewFieldOptions] = useState("");
    const [isCreatingField, setIsCreatingField] = useState(false);

    // Fetch API keys
    const fetchApiKeys = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        const { data, error } = await supabase
            .from("crm_api_keys")
            .select("id, name, key_prefix, last_used_at, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setApiKeys(data);
        }
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        fetchApiKeys();
    }, [fetchApiKeys]);

    // Generate random API key
    const generateApiKey = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let key = "crm_";
        for (let i = 0; i < 32; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return key;
    };

    // Create new API key
    const handleCreate = async () => {
        if (!newKeyName.trim() || !user) return;

        setIsCreating(true);
        const key = generateApiKey();
        const keyHash = await hashKey(key);
        const keyPrefix = key.substring(0, 8);

        const { error } = await supabase
            .from("crm_api_keys")
            .insert({
                user_id: user.id,
                name: newKeyName,
                key_hash: keyHash,
                key_prefix: keyPrefix
            });

        if (!error) {
            setCreatedKey(key);
            setNewKeyName("");
            await fetchApiKeys();
        }
        setIsCreating(false);
    };

    // Hash key (simple implementation for client-side)
    const hashKey = async (key: string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(key);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    };

    // Delete API key
    const handleDeleteKey = async (id: string) => {
        if (!confirm("Excluir esta chave de API?")) return;

        await supabase
            .from("crm_api_keys")
            .delete()
            .eq("id", id);

        await fetchApiKeys();
    };

    // Create custom field
    const handleCreateField = async () => {
        if (!newFieldName.trim()) return;

        setIsCreatingField(true);
        const options = newFieldType === "select"
            ? newFieldOptions.split(",").map(o => o.trim()).filter(o => o)
            : undefined;

        await createCustomField(newFieldName, newFieldType, options);

        setNewFieldName("");
        setNewFieldType("text");
        setNewFieldOptions("");
        setShowCreateField(false);
        setIsCreatingField(false);
    };

    // Delete custom field
    const handleDeleteField = async (id: string) => {
        if (!confirm("Excluir este campo? Os dados existentes serão mantidos nos leads.")) return;
        await deleteCustomField(id);
    };

    // Copy to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copiado!");
    };

    const webhookUrl = typeof window !== "undefined"
        ? `${window.location.origin}/api/crm/leads/webhook`
        : "/api/crm/leads/webhook";

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-[#19069E]">⚙️ Configurações do CRM</h1>
                <p className="text-sm text-gray-500">Gerencie campos personalizados, chaves de API e integrações</p>
            </div>

            {/* Custom Fields */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-bold text-gray-800">🏷️ Campos Personalizados</h2>
                        <p className="text-xs text-gray-500">Campos disponíveis para todos os leads</p>
                    </div>
                    <button
                        onClick={() => setShowCreateField(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#C2DF0C] text-[#19069E] font-bold rounded-xl hover:bg-[#B0CC0B]"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Novo Campo
                    </button>
                </div>

                {/* Create Field Form */}
                {showCreateField && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Nome do Campo</label>
                                <input
                                    type="text"
                                    value={newFieldName}
                                    onChange={(e) => setNewFieldName(e.target.value)}
                                    placeholder="Ex: Cargo, Interesse, Orçamento..."
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Tipo</label>
                                <select
                                    value={newFieldType}
                                    onChange={(e) => setNewFieldType(e.target.value as CustomFieldType)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                                >
                                    <option value="text">Texto</option>
                                    <option value="number">Número</option>
                                    <option value="date">Data</option>
                                    <option value="select">Lista de Opções</option>
                                    <option value="boolean">Sim/Não</option>
                                </select>
                            </div>
                        </div>

                        {newFieldType === "select" && (
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Opções (separadas por vírgula)</label>
                                <input
                                    type="text"
                                    value={newFieldOptions}
                                    onChange={(e) => setNewFieldOptions(e.target.value)}
                                    placeholder="Ex: Plano A, Plano B, Plano Pro"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                />
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={handleCreateField}
                                disabled={!newFieldName.trim() || isCreatingField}
                                className="px-4 py-2 bg-[#19069E] text-white font-medium rounded-lg disabled:opacity-50"
                            >
                                {isCreatingField ? "Criando..." : "Criar Campo"}
                            </button>
                            <button
                                onClick={() => setShowCreateField(false)}
                                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Fields List */}
                {isLoadingFields ? (
                    <div className="text-center py-8">
                        <span className="material-symbols-outlined text-3xl text-gray-300 animate-pulse">hourglass_empty</span>
                    </div>
                ) : customFields.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2">label_off</span>
                        <p>Nenhum campo personalizado criado</p>
                        <p className="text-xs mt-1">Crie campos para adicionar informações extras aos leads</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {customFields.map(field => (
                            <div
                                key={field.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#19069E]/10 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#19069E] text-[20px]">
                                            {fieldTypeIcons[field.field_type]}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{field.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {fieldTypeLabels[field.field_type]}
                                            {field.options && field.options.length > 0 && (
                                                <span> • {(field.options as string[]).join(", ")}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <code className="text-xs bg-gray-200 px-2 py-1 rounded">{field.field_key}</code>
                                    <button
                                        onClick={() => handleDeleteField(field.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Webhook Info */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <h2 className="font-bold text-gray-800 mb-4">🔗 Webhook para Leads</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Use este endpoint para enviar leads de formulários externos, Zapier, Make, n8n, etc.
                </p>

                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">URL do Webhook</label>
                        <div className="flex gap-2">
                            <code className="flex-1 p-3 bg-gray-100 rounded-lg text-sm font-mono break-all">
                                {webhookUrl}
                            </code>
                            <button
                                onClick={() => copyToClipboard(webhookUrl)}
                                className="px-3 py-2 bg-[#19069E] text-white rounded-lg hover:bg-[#0F0466]"
                            >
                                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Método</label>
                        <code className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded font-mono text-sm">
                            POST
                        </code>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Exemplo com Campos Personalizados</label>
                        <pre className="p-3 bg-gray-100 rounded-lg text-sm font-mono overflow-x-auto">
                            {`{
  "pipeline_id": "uuid-do-pipeline",
  "name": "Nome do Lead",
  "email": "email@exemplo.com",
  "custom_fields": {
    ${customFields.slice(0, 3).map(f => `"${f.field_key}": "valor"`).join(",\n    ") || '"campo": "valor"'}
  }
}`}
                        </pre>
                    </div>
                </div>
            </div>

            {/* API Keys */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-800">🔑 Chaves de API</h2>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#C2DF0C] text-[#19069E] font-bold rounded-xl hover:bg-[#B0CC0B]"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Nova Chave
                    </button>
                </div>

                {/* Created Key Display */}
                {createdKey && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                            <div className="flex-1">
                                <p className="font-bold text-green-800 mb-2">Chave criada com sucesso!</p>
                                <p className="text-sm text-green-700 mb-2">
                                    Copie esta chave agora. Ela não será exibida novamente.
                                </p>
                                <div className="flex gap-2">
                                    <code className="flex-1 p-2 bg-white rounded border border-green-200 font-mono text-sm">
                                        {createdKey}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(createdKey)}
                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                    </button>
                                </div>
                                <button
                                    onClick={() => setCreatedKey(null)}
                                    className="mt-3 text-sm text-green-700 hover:underline"
                                >
                                    Entendi, fechar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Form */}
                {showCreate && !createdKey && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome da Chave (para identificação)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="Ex: Webhook n8n, Formulário Site..."
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                            />
                            <button
                                onClick={handleCreate}
                                disabled={!newKeyName.trim() || isCreating}
                                className="px-4 py-2 bg-[#19069E] text-white font-medium rounded-lg hover:bg-[#0F0466] disabled:opacity-50"
                            >
                                {isCreating ? "Criando..." : "Criar"}
                            </button>
                            <button
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Keys List */}
                {isLoading ? (
                    <div className="text-center py-8">
                        <span className="material-symbols-outlined text-3xl text-gray-300 animate-pulse">hourglass_empty</span>
                    </div>
                ) : apiKeys.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2">key_off</span>
                        <p>Nenhuma chave de API criada</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {apiKeys.map(key => (
                            <div
                                key={key.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                            >
                                <div>
                                    <p className="font-medium text-gray-800">{key.name}</p>
                                    <p className="text-sm text-gray-500">
                                        <code className="text-xs bg-gray-200 px-2 py-0.5 rounded">{key.key_prefix}...</code>
                                        {" • "}
                                        Criada em {new Date(key.created_at).toLocaleDateString("pt-BR")}
                                        {key.last_used_at && (
                                            <> • Último uso: {new Date(key.last_used_at).toLocaleDateString("pt-BR")}</>
                                        )}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeleteKey(key.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
