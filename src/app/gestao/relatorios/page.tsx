"use client";

import { useState } from "react";
import { usePageMetrics } from "@/hooks/usePageMetrics";

export default function RelatoriosPage() {
    usePageMetrics({
        pagina: "Relatórios e Exportação",
        descricao: "Configuração e agendamento de relatórios",
        periodo: "Dezembro 2025",
        kpis: {}
    });

    const [selectedFormat, setSelectedFormat] = useState("pdf");
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["todos"]);

    const togglePlatform = (platform: string) => {
        if (platform === "todos") {
            setSelectedPlatforms(["todos"]);
        } else {
            const newPlatforms = selectedPlatforms.filter((p) => p !== "todos");
            if (newPlatforms.includes(platform)) {
                setSelectedPlatforms(newPlatforms.filter((p) => p !== platform));
            } else {
                setSelectedPlatforms([...newPlatforms, platform]);
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Report Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Report Form */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-[#19069E]">Configurar Relatório</h3>
                        <p className="text-sm text-gray-500">Selecione as opções para gerar seu relatório</p>
                    </div>

                    <div className="space-y-6">
                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Período de Análise</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Data Inicial</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-sm"
                                        defaultValue="2025-12-01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Data Final</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-sm"
                                        defaultValue="2025-12-31"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Platforms */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Plataformas</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: "todos", label: "Todos" },
                                    { id: "google", label: "Google Ads" },
                                    { id: "meta", label: "Meta Ads" },
                                    { id: "linkedin", label: "LinkedIn" },
                                ].map((platform) => (
                                    <button
                                        key={platform.id}
                                        onClick={() => togglePlatform(platform.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedPlatforms.includes(platform.id)
                                            ? "bg-[#19069E] text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {platform.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Metrics */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Métricas Incluídas</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: "impressions", label: "Impressões", checked: true },
                                    { id: "clicks", label: "Cliques", checked: true },
                                    { id: "ctr", label: "CTR", checked: true },
                                    { id: "leads", label: "Leads", checked: true },
                                    { id: "conversions", label: "Conversões", checked: true },
                                    { id: "investment", label: "Investimento", checked: true },
                                    { id: "cpl", label: "CPL", checked: false },
                                    { id: "roas", label: "ROAS", checked: false },
                                ].map((metric) => (
                                    <label key={metric.id} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            defaultChecked={metric.checked}
                                            className="w-4 h-4 text-[#19069E] border-gray-300 rounded focus:ring-[#19069E]"
                                        />
                                        {metric.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Format */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Formato</label>
                            <div className="flex gap-4">
                                <label
                                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedFormat === "pdf"
                                        ? "border-[#19069E] bg-[#19069E]/5"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="format"
                                        value="pdf"
                                        checked={selectedFormat === "pdf"}
                                        onChange={(e) => setSelectedFormat(e.target.value)}
                                        className="sr-only"
                                    />
                                    <span className="material-symbols-outlined text-[#19069E]">picture_as_pdf</span>
                                    <span className="font-medium text-gray-900">PDF</span>
                                </label>
                                <label
                                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedFormat === "csv"
                                        ? "border-[#19069E] bg-[#19069E]/5"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="format"
                                        value="csv"
                                        checked={selectedFormat === "csv"}
                                        onChange={(e) => setSelectedFormat(e.target.value)}
                                        className="sr-only"
                                    />
                                    <span className="material-symbols-outlined text-[#19069E]">table_chart</span>
                                    <span className="font-medium text-gray-900">CSV</span>
                                </label>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#C2DF0C] hover:bg-[#B0CC0B] text-[#19069E] font-bold rounded-lg shadow-lg transition-all">
                            <span className="material-symbols-outlined text-[20px]">description</span>
                            Gerar Relatório
                        </button>
                    </div>
                </div>

                {/* Schedule Form */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-[#19069E]">Agendar Envio Automático</h3>
                        <p className="text-sm text-gray-500">Configure o envio recorrente de relatórios</p>
                    </div>

                    <div className="space-y-6">
                        {/* Recipients */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Destinatários</label>
                            <input
                                type="text"
                                placeholder="email@exemplo.com, outro@exemplo.com"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Frequency */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Frequência</label>
                            <div className="flex gap-2">
                                {["Semanal", "Quinzenal", "Mensal"].map((freq) => (
                                    <button
                                        key={freq}
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-[#19069E] transition-all"
                                    >
                                        {freq}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Day Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Dia do Envio</label>
                            <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-sm">
                                <option>Segunda-feira</option>
                                <option>Terça-feira</option>
                                <option>Quarta-feira</option>
                                <option>Quinta-feira</option>
                                <option>Sexta-feira</option>
                            </select>
                        </div>

                        {/* Time */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Horário</label>
                            <input
                                type="time"
                                defaultValue="09:00"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Schedule Button */}
                        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#19069E] hover:bg-[#12047A] text-white font-bold rounded-lg shadow-lg transition-all">
                            <span className="material-symbols-outlined text-[20px]">schedule</span>
                            Agendar Relatório
                        </button>
                    </div>
                </div>
            </div>

            {/* Report History Table */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-[#19069E]">Histórico de Relatórios</h3>
                    <p className="text-sm text-gray-500">Relatórios gerados anteriormente</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-[#19069E]">
                            <tr>
                                <th className="px-6 py-4">Nome do Relatório</th>
                                <th className="px-6 py-4">Período</th>
                                <th className="px-6 py-4">Data de Geração</th>
                                <th className="px-6 py-4">Formato</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                                        <span className="font-medium text-gray-900">Relatório Mensal - Dezembro</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">01/12 - 31/12/2025</td>
                                <td className="px-6 py-4">28 Dez 2025, 09:00</td>
                                <td className="px-6 py-4">PDF</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Concluído
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">download</span>
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">share</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-green-600">table_chart</span>
                                        <span className="font-medium text-gray-900">Dados de Campanhas - Novembro</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">01/11 - 30/11/2025</td>
                                <td className="px-6 py-4">01 Dez 2025, 10:30</td>
                                <td className="px-6 py-4">CSV</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Concluído
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">download</span>
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">share</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                                        <span className="font-medium text-gray-900">Black Friday Analysis</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">20/11 - 30/11/2025</td>
                                <td className="px-6 py-4">01 Dez 2025, 08:00</td>
                                <td className="px-6 py-4">PDF</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                                        Concluído
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">download</span>
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                        </button>
                                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">share</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
