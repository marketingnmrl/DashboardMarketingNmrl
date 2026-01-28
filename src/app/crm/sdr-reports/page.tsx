"use client";

import { useState, useEffect, useMemo } from "react";
import { useSdrReports } from "@/hooks/useSdrReports";
import { useAccessControlContext } from "@/contexts/AccessControlContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SdrReportsPage() {
    const { orgUsers, currentUser } = useAccessControlContext();
    const { reports, fetchReports, upsertReport, deleteReport, isLoading } = useSdrReports();
    const [activeTab, setActiveTab] = useState<"new" | "history">("new");

    // Form State
    const [formData, setFormData] = useState({
        user_id: "",
        report_date: new Date().toISOString().slice(0, 10),
        // Aquisição
        acquisition_new_leads: 0,
        acquisition_responses: 0,
        acquisition_invalid_leads: 0,
        acquisition_disqualified_leads: 0,
        acquisition_appointments: 0,
        // Aplicação
        application_new_leads: 0,
        application_responses: 0,
        application_invalid_leads: 0,
        application_disqualified_leads: 0,
        application_appointments: 0,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    // Filters State
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10), // Last 30 days
        endDate: new Date().toISOString().slice(0, 10),
        userId: "all"
    });

    // Initial load
    useEffect(() => {
        if (currentUser && !formData.user_id) {
            setFormData(prev => ({ ...prev, user_id: currentUser.id }));
        }
    }, [currentUser]);

    useEffect(() => {
        if (activeTab === "history") {
            fetchReports(filters);
        }
    }, [activeTab, filters, fetchReports]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveMessage(null);

        const success = await upsertReport(formData);

        if (success) {
            setSaveMessage("Relatório salvo com sucesso!");
            setTimeout(() => setSaveMessage(null), 3000);
            // Switch to history tab or just clear? Usually keep form for editing same day.
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir este relatório?")) {
            await deleteReport(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">📊 Relatório SDR</h1>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab("new")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "new" ? "bg-white text-[#19069E] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Novo Relatório
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "history" ? "bg-white text-[#19069E] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Histórico
                    </button>
                </div>
            </div>

            {activeTab === "new" && (
                <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Meta Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data do Relatório *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.report_date}
                                    onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome SDR *</label>
                                <select
                                    required
                                    value={formData.user_id}
                                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                >
                                    <option value="">Selecione um usuário...</option>
                                    {orgUsers.map(user => (
                                        <option key={user.id} value={user.id}>{user.name || user.email}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Aquisição */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-[#19069E] border-b pb-2">🎯 Métricas Aquisição</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Leads Novos Aquisição *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.acquisition_new_leads}
                                        onChange={(e) => setFormData({ ...formData, acquisition_new_leads: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Respostas Aquisição *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.acquisition_responses}
                                        onChange={(e) => setFormData({ ...formData, acquisition_responses: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Leads Inválidos Aquisição *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.acquisition_invalid_leads}
                                        onChange={(e) => setFormData({ ...formData, acquisition_invalid_leads: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Leads Desqualificados Aquisição *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.acquisition_disqualified_leads}
                                        onChange={(e) => setFormData({ ...formData, acquisition_disqualified_leads: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Agendamentos de Aquisição *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.acquisition_appointments}
                                        onChange={(e) => setFormData({ ...formData, acquisition_appointments: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                    />
                                </div>
                            </div>

                            {/* Aplicação */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-[#19069E] border-b pb-2">💼 Métricas Aplicação</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Leads Novos Aplicação *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.application_new_leads}
                                        onChange={(e) => setFormData({ ...formData, application_new_leads: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Respostas Aplicação *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.application_responses}
                                        onChange={(e) => setFormData({ ...formData, application_responses: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Leads Inválidos Aplicação *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.application_invalid_leads}
                                        onChange={(e) => setFormData({ ...formData, application_invalid_leads: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Leads Desqualificados Aplicação *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.application_disqualified_leads}
                                        onChange={(e) => setFormData({ ...formData, application_disqualified_leads: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Agendamentos de Aplicação *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.application_appointments}
                                        onChange={(e) => setFormData({ ...formData, application_appointments: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end pt-6 border-t">
                            {saveMessage && (
                                <span className="text-green-600 font-medium mr-4 animate-fade-in">
                                    {saveMessage}
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={isSaving || !formData.user_id}
                                className="px-6 py-3 bg-[#C2DF0C] text-[#19069E] font-bold rounded-xl hover:bg-[#B0CC0B] disabled:opacity-50 transition-colors shadow-sm"
                            >
                                {isSaving ? "Salvando..." : "Salvar Relatório"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === "history" && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Período</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                                />
                                <span className="text-gray-400">até</span>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">SDR</label>
                            <select
                                value={filters.userId}
                                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                            >
                                <option value="all">Todos os usuários</option>
                                {orgUsers.map(user => (
                                    <option key={user.id} value={user.id}>{user.name || user.email}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-bold text-gray-700 min-w-[100px]">Data</th>
                                    <th className="text-left py-3 px-4 font-bold text-gray-700 min-w-[150px]">SDR</th>

                                    <th className="text-center py-3 px-2 font-bold text-gray-600 bg-blue-50/50" title="Novos (Aquisição)">Aq. Novos</th>
                                    <th className="text-center py-3 px-2 font-bold text-gray-600 bg-blue-50/50" title="Respostas (Aquisição)">Aq. Resp</th>
                                    <th className="text-center py-3 px-2 font-bold text-gray-600 bg-blue-50/50" title="Agendamentos (Aquisição)">Aq. Agend</th>

                                    <th className="text-center py-3 px-2 font-bold text-gray-600 bg-purple-50/50" title="Novos (Aplicação)">Ap. Novos</th>
                                    <th className="text-center py-3 px-2 font-bold text-gray-600 bg-purple-50/50" title="Respostas (Aplicação)">Ap. Resp</th>
                                    <th className="text-center py-3 px-2 font-bold text-gray-600 bg-purple-50/50" title="Agendamentos (Aplicação)">Ap. Agend</th>

                                    <th className="text-center py-3 px-4 font-bold text-gray-700">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center text-gray-500">
                                            Carregando...
                                        </td>
                                    </tr>
                                ) : reports.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center text-gray-500">
                                            Nenhum relatório encontrado neste período.
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((report) => (
                                        <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium">
                                                {format(new Date(report.report_date).setHours(12), "dd/MM/yyyy")}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-[#19069E] text-white flex items-center justify-center text-xs font-bold">
                                                        {(report.user?.name || report.user?.email || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="truncate max-w-[120px]" title={report.user?.name || report.user?.email}>
                                                        {report.user?.name || report.user?.email?.split('@')[0]}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-3 px-2 text-center bg-blue-50/30 font-mono">{report.acquisition_new_leads}</td>
                                            <td className="py-3 px-2 text-center bg-blue-50/30 font-mono">{report.acquisition_responses}</td>
                                            <td className="py-3 px-2 text-center bg-blue-50/30 font-bold text-[#19069E]">{report.acquisition_appointments}</td>

                                            <td className="py-3 px-2 text-center bg-purple-50/30 font-mono">{report.application_new_leads}</td>
                                            <td className="py-3 px-2 text-center bg-purple-50/30 font-mono">{report.application_responses}</td>
                                            <td className="py-3 px-2 text-center bg-purple-50/30 font-bold text-purple-700">{report.application_appointments}</td>

                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleDelete(report.id)}
                                                    className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
                                                    title="Excluir"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
