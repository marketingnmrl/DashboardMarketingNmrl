// Access Control Types

export interface AccessLevel {
    id: string;
    name: string;
    description?: string;
    allowedRoutes: string[];
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface OrgUser {
    id: string;
    authUserId: string | null;
    email: string;
    name: string | null;
    accessLevelId: string | null;
    accessLevel?: AccessLevel | null;
    isOwner: boolean;
    createdAt: string;
    updatedAt: string;
}

// All available routes in the system
export const ALL_ROUTES = [
    { section: "Dashboard", name: "Visão Geral", href: "/", icon: "dashboard" },
    { section: "Campanhas", name: "Campanhas", href: "/campanhas", icon: "campaign" },
    { section: "CRM", name: "Pipelines", href: "/crm/pipelines", icon: "view_kanban" },
    { section: "CRM", name: "Configurações CRM", href: "/crm/configuracoes", icon: "settings" },
    { section: "Funis", name: "Meus Funis", href: "/funis", icon: "filter_alt" },
    { section: "Análise", name: "Alcance", href: "/analise/alcance", icon: "visibility" },
    { section: "Análise", name: "Tráfego", href: "/analise/trafego", icon: "trending_up" },
    { section: "Análise", name: "Conteúdo", href: "/analise/conteudo", icon: "article" },
    { section: "Análise", name: "Eficiência", href: "/analise/eficiencia", icon: "speed" },
    { section: "Análise", name: "Investimentos", href: "/analise/investimentos", icon: "payments" },
    { section: "Conversões", name: "Leads", href: "/conversoes/leads", icon: "group" },
    { section: "Conversões", name: "Financeiro", href: "/conversoes/financeiro", icon: "attach_money" },
    { section: "Eventos", name: "Eventos", href: "/eventos", icon: "event" },
    { section: "Eventos", name: "Trimestral", href: "/eventos/trimestral", icon: "date_range" },
    { section: "Eventos", name: "Mensal", href: "/eventos/mensal", icon: "calendar_month" },
    { section: "Eventos", name: "Anual", href: "/eventos/anual", icon: "calendar_today" },
    { section: "Gestão", name: "Campanhas (Gestão)", href: "/gestao/campanhas", icon: "ads_click" },
    { section: "Gestão", name: "Relatórios", href: "/gestao/relatorios", icon: "summarize" },
    { section: "Placar", name: "Placar Semanal", href: "/placar-semanal", icon: "leaderboard" },
    { section: "Config", name: "Configurações", href: "/configuracoes", icon: "settings" },
] as const;

export type RouteHref = typeof ALL_ROUTES[number]["href"];
