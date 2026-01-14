"use client";

import { useState } from "react";
import Link from "next/link";

const API_BASE = "https://dashboard-marketing-nmrl.vercel.app/api/crm";

interface ApiEndpoint {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    path: string;
    description: string;
    headers: Record<string, string>;
    queryParams?: { name: string; required: boolean; description: string }[];
    bodyParams?: { name: string; type: string; required: boolean; description: string }[];
    example: {
        request?: object;
        response: object;
    };
}

const endpoints: ApiEndpoint[] = [
    {
        method: "GET",
        path: "/pipelines",
        description: "Lista todos os pipelines do usuário com suas etapas",
        headers: { "X-API-Key": "sua-api-key" },
        example: {
            response: {
                pipelines: [
                    {
                        id: "uuid-do-pipeline",
                        name: "Sessão Estratégica",
                        stages: [
                            { id: "uuid", name: "Novo Lead", color: "#3B82F6" },
                            { id: "uuid", name: "Qualificado", color: "#10B981" }
                        ]
                    }
                ],
                total: 1
            }
        }
    },
    {
        method: "POST",
        path: "/leads/webhook",
        description: "Cria um novo lead no pipeline especificado",
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": "sua-api-key"
        },
        bodyParams: [
            { name: "pipeline_id", type: "string (UUID)", required: true, description: "ID do pipeline" },
            { name: "stage_id", type: "string (UUID)", required: false, description: "ID da etapa inicial (usa primeira se não informar)" },
            { name: "name", type: "string", required: true, description: "Nome do lead" },
            { name: "email", type: "string", required: false, description: "Email do lead" },
            { name: "phone", type: "string", required: false, description: "Telefone" },
            { name: "company", type: "string", required: false, description: "Empresa" },
            { name: "origin", type: "string", required: false, description: "organic | paid | webhook (default: webhook)" },
            { name: "utm_source", type: "string", required: false, description: "UTM Source" },
            { name: "utm_medium", type: "string", required: false, description: "UTM Medium" },
            { name: "utm_campaign", type: "string", required: false, description: "UTM Campaign" },
            { name: "utm_content", type: "string", required: false, description: "UTM Content" },
            { name: "utm_term", type: "string", required: false, description: "UTM Term" },
            { name: "custom_fields", type: "object", required: false, description: "Campos personalizados" }
        ],
        example: {
            request: {
                pipeline_id: "uuid-do-pipeline",
                name: "João Silva",
                email: "joao@exemplo.com",
                phone: "(11) 99999-9999",
                origin: "paid",
                utm_source: "facebook",
                utm_campaign: "blackfriday",
                custom_fields: {
                    interesse: "Consultoria"
                }
            },
            response: {
                lead_id: "uuid-do-lead",
                status: "created",
                message: "Lead created successfully"
            }
        }
    },
    {
        method: "GET",
        path: "/leads/check",
        description: "Verifica se um lead já existe pelo email",
        headers: { "X-API-Key": "sua-api-key" },
        queryParams: [
            { name: "email", required: true, description: "Email para buscar" },
            { name: "pipeline_id", required: false, description: "Filtrar por pipeline específico" }
        ],
        example: {
            response: {
                exists: true,
                lead: {
                    id: "uuid-do-lead",
                    name: "João Silva",
                    email: "joao@exemplo.com",
                    pipeline_id: "uuid",
                    current_stage_id: "uuid"
                },
                total_matches: 1
            }
        }
    },
    {
        method: "GET",
        path: "/leads/{id}",
        description: "Busca um lead específico pelo ID",
        headers: { "X-API-Key": "sua-api-key" },
        example: {
            response: {
                lead: {
                    id: "uuid-do-lead",
                    name: "João Silva",
                    email: "joao@exemplo.com",
                    phone: "(11) 99999-9999",
                    current_stage_id: "uuid",
                    crm_pipeline_stages: {
                        id: "uuid",
                        name: "Qualificado",
                        color: "#10B981"
                    }
                }
            }
        }
    },
    {
        method: "PATCH",
        path: "/leads/{id}",
        description: "Atualiza dados de um lead",
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": "sua-api-key"
        },
        bodyParams: [
            { name: "name", type: "string", required: false, description: "Nome do lead" },
            { name: "email", type: "string", required: false, description: "Email" },
            { name: "phone", type: "string", required: false, description: "Telefone" },
            { name: "company", type: "string", required: false, description: "Empresa" },
            { name: "custom_fields", type: "object", required: false, description: "Campos personalizados" }
        ],
        example: {
            request: {
                phone: "(11) 88888-8888",
                custom_fields: { nota: "Cliente VIP" }
            },
            response: {
                lead: { id: "uuid", name: "...", phone: "(11) 88888-8888" },
                message: "Lead updated successfully"
            }
        }
    },
    {
        method: "POST",
        path: "/leads/{id}/move",
        description: "Move um lead para outra etapa do pipeline",
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": "sua-api-key"
        },
        bodyParams: [
            { name: "stage_id", type: "string (UUID)", required: true, description: "ID da nova etapa" }
        ],
        example: {
            request: {
                stage_id: "uuid-da-nova-etapa"
            },
            response: {
                success: true,
                lead_id: "uuid-do-lead",
                from_stage_id: "uuid-etapa-anterior",
                to_stage_id: "uuid-nova-etapa",
                stage_name: "Em Negociação",
                message: "Lead moved to Em Negociação"
            }
        }
    }
];

const methodColors: Record<string, string> = {
    GET: "bg-green-100 text-green-700 border-green-200",
    POST: "bg-blue-100 text-blue-700 border-blue-200",
    PATCH: "bg-yellow-100 text-yellow-700 border-yellow-200",
    DELETE: "bg-red-100 text-red-700 border-red-200"
};

export default function CRMDocsPage() {
    const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(0);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const generateCurl = (endpoint: ApiEndpoint): string => {
        let curl = `curl -X ${endpoint.method} "${API_BASE}${endpoint.path}"`;

        Object.entries(endpoint.headers).forEach(([key, value]) => {
            curl += ` \\\n  -H "${key}: ${value}"`;
        });

        if (endpoint.example.request) {
            curl += ` \\\n  -d '${JSON.stringify(endpoint.example.request, null, 2)}'`;
        }

        return curl;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/crm/configuracoes"
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-[#19069E]">Documentação da API</h1>
                    <p className="text-sm text-gray-500">
                        Endpoints para integração com o CRM
                    </p>
                </div>
            </div>

            {/* Base URL */}
            <div className="p-4 rounded-xl bg-gray-900 text-white">
                <p className="text-xs text-gray-400 mb-1">Base URL</p>
                <code className="text-green-400">{API_BASE}</code>
            </div>

            {/* Authentication */}
            <div className="p-6 rounded-xl bg-white border border-gray-200">
                <h2 className="font-bold text-[#19069E] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">key</span>
                    Autenticação
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                    Todas as requisições precisam do header <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">X-API-Key</code> com sua chave de API.
                </p>
                <p className="text-sm text-gray-500">
                    Gere sua chave em{" "}
                    <Link href="/crm/configuracoes" className="text-[#19069E] hover:underline">
                        Configurações do CRM
                    </Link>
                </p>
            </div>

            {/* Endpoints */}
            <div className="space-y-4">
                <h2 className="font-bold text-[#19069E] text-lg">Endpoints</h2>

                {endpoints.map((endpoint, index) => (
                    <div
                        key={index}
                        className="rounded-xl bg-white border border-gray-200 overflow-hidden"
                    >
                        {/* Header */}
                        <button
                            onClick={() => setExpandedEndpoint(expandedEndpoint === index ? null : index)}
                            className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                        >
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${methodColors[endpoint.method]}`}>
                                {endpoint.method}
                            </span>
                            <code className="text-sm font-medium text-gray-900">{endpoint.path}</code>
                            <span className="flex-1 text-left text-sm text-gray-500 ml-2">
                                {endpoint.description}
                            </span>
                            <span className="material-symbols-outlined text-gray-400">
                                {expandedEndpoint === index ? "expand_less" : "expand_more"}
                            </span>
                        </button>

                        {/* Content */}
                        {expandedEndpoint === index && (
                            <div className="border-t border-gray-200 p-4 space-y-4">
                                {/* Query Params */}
                                {endpoint.queryParams && (
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-700 mb-2">Query Parameters</h4>
                                        <div className="space-y-1">
                                            {endpoint.queryParams.map((param, i) => (
                                                <div key={i} className="flex gap-2 text-sm">
                                                    <code className="text-purple-600">{param.name}</code>
                                                    {param.required && <span className="text-red-500">*</span>}
                                                    <span className="text-gray-500">— {param.description}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Body Params */}
                                {endpoint.bodyParams && (
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-700 mb-2">Body Parameters</h4>
                                        <div className="space-y-1">
                                            {endpoint.bodyParams.map((param, i) => (
                                                <div key={i} className="flex gap-2 text-sm">
                                                    <code className="text-purple-600">{param.name}</code>
                                                    <span className="text-gray-400 text-xs">({param.type})</span>
                                                    {param.required && <span className="text-red-500">*</span>}
                                                    <span className="text-gray-500">— {param.description}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* cURL */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-bold text-gray-700">cURL</h4>
                                        <button
                                            onClick={() => copyToClipboard(generateCurl(endpoint), index)}
                                            className="text-xs text-[#19069E] hover:underline flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">
                                                {copiedIndex === index ? "check" : "content_copy"}
                                            </span>
                                            {copiedIndex === index ? "Copiado!" : "Copiar"}
                                        </button>
                                    </div>
                                    <pre className="p-3 rounded-lg bg-gray-900 text-green-400 text-xs overflow-x-auto">
                                        {generateCurl(endpoint)}
                                    </pre>
                                </div>

                                {/* Response Example */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-2">Response Example</h4>
                                    <pre className="p-3 rounded-lg bg-gray-100 text-gray-800 text-xs overflow-x-auto">
                                        {JSON.stringify(endpoint.example.response, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* N8N Integration */}
            <div className="p-6 rounded-xl bg-purple-50 border border-purple-200">
                <h2 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">integration_instructions</span>
                    Integração com N8N
                </h2>
                <div className="space-y-3 text-sm text-purple-700">
                    <p><strong>1.</strong> Use o nó <code className="bg-purple-100 px-1 rounded">HTTP Request</code></p>
                    <p><strong>2.</strong> Configure o header <code className="bg-purple-100 px-1 rounded">X-API-Key</code> com sua chave</p>
                    <p><strong>3.</strong> Use expressões como <code className="bg-purple-100 px-1 rounded">{"{{$json.campo}}"}</code> para mapear dados</p>
                </div>
            </div>
        </div>
    );
}
