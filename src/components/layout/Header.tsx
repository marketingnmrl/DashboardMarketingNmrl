"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";

// Map paths to page titles and filter visibility
const pageTitles: Record<string, {
    title: string;
    description: string;
    showFilters?: boolean;
    showCampaignFilters?: boolean;
}> = {
    "/": {
        title: "Visão Geral do Desempenho",
        description: "Métricas consolidadas e análise de resultados.",
        showFilters: true,
        showCampaignFilters: true,
    },
    "/analise/alcance": {
        title: "Alcance e Exposição",
        description: "Acompanhe a visibilidade da marca e o desempenho das campanhas.",
        showFilters: true,
        showCampaignFilters: true,
    },
    "/analise/trafego": {
        title: "Análise de Tráfego",
        description: "Métricas detalhadas de cliques, campanhas e performance.",
        showFilters: true,
        showCampaignFilters: true,
    },
    "/analise/conteudo": {
        title: "Desempenho de Conteúdo",
        description: "Análise detalhada de posts e engajamento em tempo real.",
        showFilters: true,
        showCampaignFilters: false,
    },
    "/analise/funil": {
        title: "Métricas de Funil",
        description: "Visualize a jornada do cliente e a eficiência de conversão.",
        showFilters: true,
        showCampaignFilters: true,
    },
    "/analise/eficiencia": {
        title: "Métricas de Eficiência",
        description: "Acompanhe a performance detalhada dos seus anúncios.",
        showFilters: true,
        showCampaignFilters: true,
    },
    "/analise/investimentos": {
        title: "Investimentos em Marketing",
        description: "CPM, CPC, CPL, CAC, ROI e distribuição de verba.",
        showFilters: true,
        showCampaignFilters: true,
    },
    "/conversoes/leads": {
        title: "Conversões e Leads",
        description: "Visão geral de performance e KPIs em tempo real.",
        showFilters: true,
        showCampaignFilters: true,
    },
    "/conversoes/financeiro": {
        title: "Gestão Financeira",
        description: "Caixa, vendas, metas e negócios em aberto.",
        showFilters: true,
        showCampaignFilters: false,
    },
    "/gestao/campanhas": {
        title: "Gestão de Campanhas",
        description: "Acompanhe métricas, Leads e o ROI em tempo real.",
        showFilters: true,
        showCampaignFilters: true,
    },
    "/gestao/relatorios": {
        title: "Relatórios e Exportação",
        description: "Gere relatórios personalizados e exporte dados.",
        showFilters: false,
        showCampaignFilters: false,
    },
    "/configuracoes": {
        title: "Configurações",
        description: "Gerencie integrações, usuários e preferências.",
        showFilters: false,
        showCampaignFilters: false,
    },
    "/funis": {
        title: "Meus Funis",
        description: "Gerencie seus funis de vendas e acompanhe a performance.",
        showFilters: false,
        showCampaignFilters: false,
    },
    "/funis/novo": {
        title: "Criar Novo Funil",
        description: "Configure um novo funil de vendas personalizado.",
        showFilters: false,
        showCampaignFilters: false,
    },
};

export default function Header() {
    const pathname = usePathname();
    const { openSidebar } = useSidebar();

    // Handle dynamic routes
    let pageInfo = pageTitles[pathname];
    if (!pageInfo && pathname.startsWith("/funis/") && pathname !== "/funis/novo") {
        pageInfo = {
            title: "Detalhes do Funil",
            description: "Visualize e edite as métricas do seu funil de vendas.",
            showFilters: false,
            showCampaignFilters: false,
        };
    }
    if (!pageInfo) {
        pageInfo = {
            title: "Dashboard",
            description: "Marketing Na Moral",
            showFilters: false,
            showCampaignFilters: false,
        };
    }

    const shouldShowFilters = pageInfo.showFilters ?? false;
    const shouldShowCampaignFilters = pageInfo.showCampaignFilters ?? false;

    return (
        <header className="bg-[#19069E] border-b border-[#12047A] px-3 py-2.5 md:px-6 md:py-4 lg:px-8 lg:py-5">
            {/* Main Row: Hamburger + Title + Actions */}
            <div className="flex items-center justify-between gap-2">
                {/* Left: Hamburger + Title */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Hamburger Menu Button - Mobile/Tablet only */}
                    <button
                        onClick={openSidebar}
                        className="lg:hidden p-1.5 -ml-1 rounded-lg hover:bg-white/10 text-white transition-colors shrink-0"
                        aria-label="Abrir menu"
                    >
                        <span className="material-symbols-outlined text-[24px]">menu</span>
                    </button>

                    {/* Page Title */}
                    <div className="min-w-0">
                        <h1 className="text-base md:text-xl lg:text-2xl font-extrabold tracking-tight text-white truncate">
                            {pageInfo.title}
                        </h1>
                        <p className="text-blue-200 text-xs md:text-sm font-medium opacity-90 hidden md:block truncate">
                            {pageInfo.description}
                        </p>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
                    {/* Search (Desktop only) */}
                    <div className="hidden lg:block relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#19069E]">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar métricas..."
                            className="h-9 pl-10 pr-4 rounded-lg bg-white border-none focus:ring-2 focus:ring-[#C2DF0C] text-sm text-[#19069E] w-56 placeholder-[#19069E]/50"
                        />
                    </div>

                    {/* Notifications */}
                    <button className="relative p-1.5 md:p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                        <span className="material-symbols-outlined text-[20px] md:text-[22px]">notifications</span>
                        <span className="absolute top-1 right-1 md:top-2 md:right-2 w-2 h-2 bg-[#C2DF0C] rounded-full border border-[#19069E]"></span>
                    </button>

                    {/* User Avatar */}
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/10 overflow-hidden border border-white/20 cursor-pointer hover:ring-2 hover:ring-[#C2DF0C] transition-all">
                        <div className="w-full h-full flex items-center justify-center text-white text-xs md:text-sm font-bold">
                            AD
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Row - More compact */}
            {shouldShowFilters && (
                <div className="flex items-center gap-1.5 md:gap-2 mt-2.5 md:mt-4 pt-2.5 md:pt-4 border-t border-white/10 overflow-x-auto">
                    {/* Date Picker */}
                    <button className="flex items-center gap-1.5 h-7 md:h-8 px-2.5 md:px-3 rounded-lg border border-white/20 bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors shrink-0">
                        <span className="material-symbols-outlined text-[14px] md:text-[16px]">calendar_today</span>
                        <span>Este Mês</span>
                    </button>

                    {/* Channel Filters */}
                    {shouldShowCampaignFilters && (
                        <>
                            <button className="flex items-center gap-1 h-7 md:h-8 px-2.5 md:px-3 rounded-full bg-white text-[#19069E] text-xs font-bold whitespace-nowrap shadow-sm shrink-0">
                                Todas
                                <span className="material-symbols-outlined text-[12px] md:text-[14px]">check</span>
                            </button>
                            <button className="h-7 md:h-8 px-2.5 md:px-3 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium whitespace-nowrap hover:bg-white hover:text-[#19069E] transition-all shrink-0">
                                Facebook
                            </button>
                            <button className="h-7 md:h-8 px-2.5 md:px-3 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium whitespace-nowrap hover:bg-white hover:text-[#19069E] transition-all shrink-0">
                                Google
                            </button>
                        </>
                    )}

                    {/* Export Button */}
                    <button className="ml-auto flex items-center justify-center h-7 md:h-8 w-7 md:w-auto md:px-3 rounded-lg bg-[#C2DF0C] hover:bg-[#B0CC0B] text-[#19069E] text-xs font-bold shadow-lg transition-all shrink-0">
                        <span className="material-symbols-outlined text-[16px] md:text-[18px]">download</span>
                        <span className="hidden md:inline ml-1.5">Exportar</span>
                    </button>
                </div>
            )}
        </header>
    );
}
