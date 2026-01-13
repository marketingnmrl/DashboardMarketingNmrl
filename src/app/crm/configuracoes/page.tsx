"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import crypto from "crypto";

interface ApiKey {
    id: string;
    name: string;
    key_prefix: string;
    last_used_at: string | null;
    created_at: string;
}

export default function CRMConfiguracoesPage() {
    const { user } = useAuth();
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

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
    const handleDelete = async (id: string) => {
        if (!confirm("Excluir esta chave de API?")) return;

        await supabase
            .from("crm_api_keys")
            .delete()
            .eq("id", id);

        await fetchApiKeys();
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
                <p className="text-sm text-gray-500">Gerencie chaves de API e integrações</p>
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
                        <label className="text-xs text-gray-500 block mb-1">Headers</label>
                        <pre className="p-3 bg-gray-100 rounded-lg text-sm font-mono overflow-x-auto">
                            {`Content-Type: application/json
X-API-Key: sua_chave_api`}
                        </pre>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Exemplo de Body</label>
                        <pre className="p-3 bg-gray-100 rounded-lg text-sm font-mono overflow-x-auto">
                            {`{
  "pipeline_id": "uuid-do-pipeline",
  "name": "Nome do Lead",
  "email": "email@exemplo.com",
  "phone": "+5511999999999",
  "origin": "paid",
  "utm_source": "facebook",
  "utm_campaign": "campanha_x"
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
                                    onClick={() => handleDelete(key.id)}
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
