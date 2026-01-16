"use client";

import { useState } from "react";
import { useAccessControlContext } from "@/contexts/AccessControlContext";
import { ALL_ROUTES } from "@/types/access-control";

export default function AccessControlSettings() {
    const {
        accessLevels,
        orgUsers,
        isAdmin,
        currentUser,
        createAccessLevel,
        updateAccessLevel,
        deleteAccessLevel,
        createOrgUser,
        updateOrgUser,
        deleteOrgUser,
        isLoading,
        error,
        refresh,
    } = useAccessControlContext();

    const [activeTab, setActiveTab] = useState<"levels" | "users">("levels");
    const [showNewLevelModal, setShowNewLevelModal] = useState(false);
    const [showNewUserModal, setShowNewUserModal] = useState(false);
    const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
    const [saveMessage, setSaveMessage] = useState<{ success: boolean; message: string } | null>(null);

    // New level form state
    const [newLevelName, setNewLevelName] = useState("");
    const [newLevelDesc, setNewLevelDesc] = useState("");
    const [newLevelRoutes, setNewLevelRoutes] = useState<string[]>([]);
    const [newLevelIsAdmin, setNewLevelIsAdmin] = useState(false);

    // New user form state
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserName, setNewUserName] = useState("");
    const [newUserLevelId, setNewUserLevelId] = useState("");

    const handleCreateLevel = async () => {
        try {
            await createAccessLevel(newLevelName, newLevelDesc, newLevelRoutes, newLevelIsAdmin);
            setShowNewLevelModal(false);
            setNewLevelName("");
            setNewLevelDesc("");
            setNewLevelRoutes([]);
            setNewLevelIsAdmin(false);
            setSaveMessage({ success: true, message: "Nível criado com sucesso!" });
        } catch (err) {
            setSaveMessage({ success: false, message: err instanceof Error ? err.message : "Erro ao criar nível" });
        }
    };

    const handleCreateUser = async () => {
        try {
            if (!newUserLevelId) {
                setSaveMessage({ success: false, message: "Selecione um nível de acesso" });
                return;
            }
            await createOrgUser(newUserEmail, newUserName, newUserLevelId);
            setShowNewUserModal(false);
            setNewUserEmail("");
            setNewUserName("");
            setNewUserLevelId("");
            setSaveMessage({ success: true, message: "Usuário adicionado com sucesso!" });
        } catch (err) {
            setSaveMessage({ success: false, message: err instanceof Error ? err.message : "Erro ao adicionar usuário" });
        }
    };

    const handleDeleteLevel = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este nível? Usuários associados perderão acesso.")) return;
        try {
            await deleteAccessLevel(id);
            setSaveMessage({ success: true, message: "Nível excluído!" });
        } catch (err) {
            setSaveMessage({ success: false, message: err instanceof Error ? err.message : "Erro ao excluir" });
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover este usuário?")) return;
        try {
            await deleteOrgUser(id);
            setSaveMessage({ success: true, message: "Usuário removido!" });
        } catch (err) {
            setSaveMessage({ success: false, message: err instanceof Error ? err.message : "Erro ao remover" });
        }
    };

    const handleUpdateUserLevel = async (userId: string, levelId: string) => {
        try {
            await updateOrgUser(userId, { accessLevelId: levelId });
            setSaveMessage({ success: true, message: "Nível alterado!" });
        } catch (err) {
            setSaveMessage({ success: false, message: err instanceof Error ? err.message : "Erro ao alterar" });
        }
    };

    const toggleRoute = (route: string) => {
        setNewLevelRoutes(prev =>
            prev.includes(route)
                ? prev.filter(r => r !== route)
                : [...prev, route]
        );
    };

    // Group routes by section
    const routesBySection = ALL_ROUTES.reduce((acc, route) => {
        if (!acc[route.section]) acc[route.section] = [];
        acc[route.section].push(route);
        return acc;
    }, {} as Record<string, typeof ALL_ROUTES[number][]>);

    if (!isAdmin) {
        return (
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="text-center py-8 text-gray-500">
                    <span className="material-symbols-outlined text-4xl mb-2">lock</span>
                    <p>Você não tem permissão para gerenciar níveis de acesso.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-[#19069E] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#C2DF0C]">admin_panel_settings</span>
                    Controle de Acesso
                </h3>
                <p className="text-sm text-gray-500">Gerencie níveis de acesso e usuários</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("levels")}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === "levels"
                            ? "text-[#19069E] border-b-2 border-[#19069E]"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Níveis de Acesso
                </button>
                <button
                    onClick={() => setActiveTab("users")}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === "users"
                            ? "text-[#19069E] border-b-2 border-[#19069E]"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Usuários
                </button>
            </div>

            {/* Messages */}
            {saveMessage && (
                <div className={`p-3 mb-4 rounded-lg text-sm ${saveMessage.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    <span className="material-symbols-outlined text-[16px] mr-1 align-middle">
                        {saveMessage.success ? "check_circle" : "error"}
                    </span>
                    {saveMessage.message}
                </div>
            )}

            {isLoading ? (
                <div className="h-32 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#19069E] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : activeTab === "levels" ? (
                <>
                    {/* Access Levels Tab */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setShowNewLevelModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#19069E] hover:bg-[#12047A] text-white font-bold text-sm rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Novo Nível
                        </button>
                    </div>

                    <div className="space-y-3">
                        {accessLevels.map(level => (
                            <div
                                key={level.id}
                                className="p-4 rounded-lg border border-gray-200 hover:border-[#19069E]/30 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${level.isAdmin ? "bg-[#C2DF0C]" : "bg-gray-100"}`}>
                                            <span className={`material-symbols-outlined text-[20px] ${level.isAdmin ? "text-[#19069E]" : "text-gray-500"}`}>
                                                {level.isAdmin ? "verified_user" : "person"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{level.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {level.isAdmin ? "Acesso total" : `${level.allowedRoutes.length} rotas permitidas`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDeleteLevel(level.id)}
                                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            title="Excluir nível"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                                {!level.isAdmin && level.allowedRoutes.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {level.allowedRoutes.slice(0, 5).map(route => (
                                            <span key={route} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                {route}
                                            </span>
                                        ))}
                                        {level.allowedRoutes.length > 5 && (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                +{level.allowedRoutes.length - 5} mais
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        {accessLevels.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <span className="material-symbols-outlined text-4xl mb-2">folder_off</span>
                                <p>Nenhum nível de acesso criado</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* Users Tab */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setShowNewUserModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#19069E] hover:bg-[#12047A] text-white font-bold text-sm rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                            Adicionar Usuário
                        </button>
                    </div>

                    <div className="space-y-3">
                        {orgUsers.map(user => (
                            <div
                                key={user.id}
                                className="p-4 rounded-lg border border-gray-200 hover:border-[#19069E]/30 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#19069E] flex items-center justify-center text-white text-sm font-bold">
                                            {user.name?.slice(0, 2).toUpperCase() || user.email.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-gray-900">{user.name || user.email}</p>
                                                {user.isOwner && (
                                                    <span className="px-2 py-0.5 bg-[#C2DF0C] text-[#19069E] text-xs font-bold rounded-full">
                                                        Proprietário
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={user.accessLevelId || ""}
                                            onChange={(e) => handleUpdateUserLevel(user.id, e.target.value)}
                                            disabled={user.isOwner}
                                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E] disabled:opacity-50"
                                        >
                                            <option value="">Sem acesso</option>
                                            {accessLevels.map(level => (
                                                <option key={level.id} value={level.id}>{level.name}</option>
                                            ))}
                                        </select>
                                        {!user.isOwner && (
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                title="Remover usuário"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {orgUsers.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <span className="material-symbols-outlined text-4xl mb-2">group_off</span>
                                <p>Nenhum usuário cadastrado</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* New Level Modal */}
            {showNewLevelModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-[#19069E]">Novo Nível de Acesso</h3>
                                <button onClick={() => setShowNewLevelModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Nível</label>
                                <input
                                    type="text"
                                    value={newLevelName}
                                    onChange={(e) => setNewLevelName(e.target.value)}
                                    placeholder="Ex: Gestor de Tráfego"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    value={newLevelDesc}
                                    onChange={(e) => setNewLevelDesc(e.target.value)}
                                    placeholder="Ex: Acesso a campanhas e métricas"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newLevelIsAdmin}
                                        onChange={(e) => setNewLevelIsAdmin(e.target.checked)}
                                        className="w-4 h-4 rounded text-[#19069E] focus:ring-[#19069E]"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Acesso de Administrador (todas as rotas)</span>
                                </label>
                            </div>
                            {!newLevelIsAdmin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rotas Permitidas</label>
                                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-4">
                                        {Object.entries(routesBySection).map(([section, routes]) => (
                                            <div key={section}>
                                                <p className="text-xs font-bold uppercase text-gray-400 mb-2">{section}</p>
                                                <div className="space-y-1">
                                                    {routes.map(route => (
                                                        <label key={route.href} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                            <input
                                                                type="checkbox"
                                                                checked={newLevelRoutes.includes(route.href)}
                                                                onChange={() => toggleRoute(route.href)}
                                                                className="w-4 h-4 rounded text-[#19069E] focus:ring-[#19069E]"
                                                            />
                                                            <span className="material-symbols-outlined text-[16px] text-gray-400">{route.icon}</span>
                                                            <span className="text-sm text-gray-700">{route.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowNewLevelModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateLevel}
                                disabled={!newLevelName}
                                className="px-4 py-2 bg-[#19069E] hover:bg-[#12047A] text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                            >
                                Criar Nível
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New User Modal */}
            {showNewUserModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-[#19069E]">Adicionar Usuário</h3>
                                <button onClick={() => setShowNewUserModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    placeholder="usuario@email.com"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                <input
                                    type="text"
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    placeholder="Nome do usuário"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Acesso</label>
                                <select
                                    value={newUserLevelId}
                                    onChange={(e) => setNewUserLevelId(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#19069E]"
                                >
                                    <option value="">Selecione um nível</option>
                                    {accessLevels.map(level => (
                                        <option key={level.id} value={level.id}>{level.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                                <span className="material-symbols-outlined text-[16px] mr-1 align-middle">info</span>
                                O usuário precisa criar uma conta com este email para acessar o dashboard.
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowNewUserModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateUser}
                                disabled={!newUserEmail || !newUserLevelId}
                                className="px-4 py-2 bg-[#19069E] hover:bg-[#12047A] text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                            >
                                Adicionar Usuário
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
