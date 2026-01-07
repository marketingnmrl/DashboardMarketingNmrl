"use client";

import { useState } from "react";
import { usePageMetrics } from "@/hooks/usePageMetrics";
import { useDashboardSettings } from "@/hooks/useDashboardSettings";

export default function ConfiguracoesPage() {
    const { settings, isLoading, isSaving, updateSheetUrl, testSheetUrl } = useDashboardSettings();
    const [visaoGeralUrl, setVisaoGeralUrl] = useState("");
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [urlInitialized, setUrlInitialized] = useState(false);

    // Initialize URL from settings when loaded
    if (settings && !urlInitialized && !isLoading) {
        setVisaoGeralUrl(settings.visaoGeralSheetUrl || "");
        setUrlInitialized(true);
    }

    usePageMetrics({
        pagina: "Configurações",
        descricao: "Configurações de integrações e conta",
        periodo: "N/A",
        kpis: {}
    });

    const handleTestConnection = async () => {
        if (!visaoGeralUrl) {
            setTestResult({ success: false, message: "Cole a URL da planilha primeiro" });
            return;
        }
        setIsTesting(true);
        setTestResult(null);
        const result = await testSheetUrl(visaoGeralUrl);
        setTestResult(result);
        setIsTesting(false);
    };

    const handleSaveUrl = async () => {
        await updateSheetUrl("visaoGeralSheetUrl", visaoGeralUrl || null);
        setTestResult({ success: true, message: "URL salva com sucesso!" });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Planilhas de Dados Section */}
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#19069E] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#C2DF0C]">table_chart</span>
                        Planilhas de Dados
                    </h3>
                    <p className="text-sm text-gray-500">Configure as URLs das planilhas do Google Sheets (Stract) para cada seção do dashboard</p>
                </div>

                <div className="space-y-6">
                    {/* Visão Geral Sheet */}
                    <div className="p-4 rounded-lg border border-gray-200 hover:border-[#19069E]/30 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-[#19069E] rounded-lg">
                                <span className="material-symbols-outlined text-[20px] text-[#C2DF0C]">dashboard</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Visão Geral</p>
                                <p className="text-xs text-gray-500">Dados de campanhas para o dashboard principal</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL do Google Sheets
                                </label>
                                <input
                                    type="url"
                                    value={visaoGeralUrl}
                                    onChange={(e) => {
                                        setVisaoGeralUrl(e.target.value);
                                        setTestResult(null);
                                    }}
                                    placeholder="https://docs.google.com/spreadsheets/d/..."
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-sm"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    A planilha deve estar pública ou compartilhada com &quot;qualquer pessoa com o link&quot;
                                </p>
                            </div>

                            {testResult && (
                                <div className={`p-3 rounded-lg text-sm ${testResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                    <span className="material-symbols-outlined text-[16px] mr-1 align-middle">
                                        {testResult.success ? "check_circle" : "error"}
                                    </span>
                                    {testResult.message}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={handleTestConnection}
                                    disabled={isTesting || !visaoGeralUrl}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isTesting ? (
                                        <>
                                            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                            Testando...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[18px]">lan</span>
                                            Testar Conexão
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleSaveUrl}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#C2DF0C] hover:bg-[#B0CC0B] text-[#19069E] font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[18px]">save</span>
                                            Salvar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Placeholder for future sheets */}
                    <div className="p-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 opacity-60">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-200 rounded-lg">
                                <span className="material-symbols-outlined text-[20px] text-gray-400">add</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-500">Mais planilhas em breve...</p>
                                <p className="text-xs text-gray-400">Investimentos, Tráfego, etc.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Integrations Section */}
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#19069E]">Integrações</h3>
                    <p className="text-sm text-gray-500">Conecte suas contas de anúncios</p>
                </div>

                <div className="space-y-4">
                    {[
                        { name: "Google Ads", icon: "search", connected: true, account: "marketing@namoral.com" },
                        { name: "Meta Ads", icon: "thumb_up", connected: true, account: "Marketing Na Moral" },
                        { name: "LinkedIn Ads", icon: "work", connected: false, account: null },
                        { name: "TikTok Ads", icon: "play_circle", connected: false, account: null },
                    ].map((integration) => (
                        <div
                            key={integration.name}
                            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#19069E]/30 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${integration.connected ? "bg-[#19069E]" : "bg-gray-100"}`}>
                                    <span className={`material-symbols-outlined text-[24px] ${integration.connected ? "text-[#C2DF0C]" : "text-gray-400"}`}>
                                        {integration.icon}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{integration.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {integration.connected ? integration.account : "Não conectado"}
                                    </p>
                                </div>
                            </div>
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${integration.connected
                                    ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                                    : "bg-[#C2DF0C] text-[#19069E] hover:bg-[#B0CC0B]"
                                    }`}
                            >
                                {integration.connected ? "Desconectar" : "Conectar"}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Users Section */}
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-[#19069E]">Usuários</h3>
                        <p className="text-sm text-gray-500">Gerencie o acesso à plataforma</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#19069E] hover:bg-[#12047A] text-white font-bold text-sm rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        Convidar
                    </button>
                </div>

                <div className="space-y-3">
                    {[
                        { name: "Admin User", email: "admin@namoral.com", role: "Administrador", avatar: "AD" },
                        { name: "João Silva", email: "joao@namoral.com", role: "Editor", avatar: "JS" },
                        { name: "Maria Costa", email: "maria@namoral.com", role: "Visualizador", avatar: "MC" },
                    ].map((user) => (
                        <div
                            key={user.email}
                            className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#19069E] flex items-center justify-center text-white text-sm font-bold">
                                    {user.avatar}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{user.name}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === "Administrador"
                                        ? "bg-[#19069E] text-white"
                                        : user.role === "Editor"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {user.role}
                                </span>
                                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#19069E] transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Account Settings */}
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#19069E]">Conta</h3>
                    <p className="text-sm text-gray-500">Configurações da sua conta</p>
                </div>

                <div className="space-y-6">
                    {/* Company Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nome da Empresa</label>
                            <input
                                type="text"
                                defaultValue="Marketing Na Moral"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">CNPJ</label>
                            <input
                                type="text"
                                defaultValue="12.345.678/0001-90"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-sm"
                            />
                        </div>
                    </div>

                    {/* Preferences */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Fuso Horário</label>
                        <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-sm">
                            <option>America/Sao_Paulo (GMT-3)</option>
                            <option>America/New_York (GMT-5)</option>
                            <option>Europe/London (GMT)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Moeda Padrão</label>
                        <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-sm">
                            <option>BRL (R$)</option>
                            <option>USD ($)</option>
                            <option>EUR (€)</option>
                        </select>
                    </div>

                    {/* Notifications */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Notificações</label>
                        <div className="space-y-3">
                            {[
                                { id: "email", label: "Receber relatórios por email", checked: true },
                                { id: "alerts", label: "Alertas de performance", checked: true },
                                { id: "budget", label: "Notificações de orçamento", checked: false },
                            ].map((notification) => (
                                <label key={notification.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                                    <span className="text-sm text-gray-700">{notification.label}</span>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            defaultChecked={notification.checked}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-checked:bg-[#C2DF0C] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button className="flex items-center gap-2 px-6 py-3 bg-[#C2DF0C] hover:bg-[#B0CC0B] text-[#19069E] font-bold rounded-lg shadow-lg transition-all">
                            <span className="material-symbols-outlined text-[20px]">save</span>
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="p-6 rounded-xl bg-red-50 border border-red-200">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-red-700">Zona de Perigo</h3>
                    <p className="text-sm text-red-600">Ações irreversíveis</p>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">Excluir Conta</p>
                        <p className="text-sm text-gray-500">Esta ação não pode ser desfeita</p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg transition-colors">
                        Excluir Conta
                    </button>
                </div>
            </div>
        </div>
    );
}
