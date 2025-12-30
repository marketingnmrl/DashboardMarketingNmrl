"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";

// Map paths to page titles and filter visibility
// showFilters: show the entire filter row (date + export)
// showCampaignFilters: show campaign/channel filter buttons
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
        showCampaignFilters: true, // Aggregate view of all campaigns
    },
    "/analise/alcance": {
        title: "Alcance e Exposição",
        description: "Acompanhe a visibilidade da marca e o desempenho das campanhas.",
        showFilters: true,
        showCampaignFilters: true, // Platform-specific reach metrics
    },
    "/analise/trafego": {
        title: "Análise de Tráfego",
        description: "Métricas detalhadas de cliques, campanhas e performance.",
        showFilters: true,
        showCampaignFilters: true, // Traffic by source/platform
    },
    "/analise/conteudo": {
        title: "Desempenho de Conteúdo",
        description: "Análise detalhada de posts e engajamento em tempo real.",
        showFilters: true,
        showCampaignFilters: false, // Content analysis, not campaign-based
    },
    "/analise/funil": {
        title: "Métricas de Funil",
        description: "Visualize a jornada do cliente e a eficiência de conversão.",
        showFilters: true,
        showCampaignFilters: true, // Funnel can be filtered by campaign
    },
    "/analise/eficiencia": {
        title: "Métricas de Eficiência",
        description: "Acompanhe a performance detalhada dos seus anúncios.",
        showFilters: true,
        showCampaignFilters: true, // Efficiency by platform
    },
    "/analise/investimentos": {
        title: "Investimentos em Marketing",
        description: "CPM, CPC, CPL, CAC, ROI e distribuição de verba.",
        showFilters: true,
        showCampaignFilters: true, // Costs by platform
    },
    "/conversoes/leads": {
        title: "Conversões e Leads",
        description: "Visão geral de performance e KPIs em tempo real.",
        showFilters: true,
        showCampaignFilters: true, // Leads by source
    },
    "/conversoes/financeiro": {
        title: "Gestão Financeira",
        description: "Caixa, vendas, metas e negócios em aberto.",
        showFilters: true,
        showCampaignFilters: false, // Management view, not campaign-based
    },
    "/gestao/campanhas": {
        title: "Gestão de Campanhas",
        description: "Acompanhe métricas, Leads e o ROI em tempo real.",
        showFilters: true,
        showCampaignFilters: true, // Campaign management
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
        <header className="bg-[#19069E] border-b border-[#12047A] px-4 py-4 md:px-6 md:py-5 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                {/* Left side: Hamburger + Page Title */}
                <div className="flex items-center gap-3">
                    {/* Hamburger Menu Button - Mobile/Tablet only */}
                    <button
                        onClick={openSidebar}
                        className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/10 text-white transition-colors"
                        aria-label="Abrir menu"
                    >
                        <span className="material-symbols-outlined text-[28px]">menu</span>
                    </button>

                    {/* Page Title */}
                    <div className="flex flex-col gap-0.5">
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                            {pageInfo.title}
                        </h1>
                        <p className="text-blue-200 text-xs md:text-sm lg:text-base font-medium opacity-90 hidden sm:block">
                            {pageInfo.description}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {/* Search (Desktop) */}
                    <div className="hidden lg:block relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#19069E]">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar métricas..."
                            className="h-10 pl-10 pr-4 rounded-lg bg-white border-none focus:ring-2 focus:ring-[#C2DF0C] text-sm text-[#19069E] w-64 placeholder-[#19069E]/50 font-regular"
                        />
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                        <span className="material-symbols-outlined text-[22px]">notifications</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-[#C2DF0C] rounded-full border-2 border-[#19069E]"></span>
                    </button>

                    {/* User Avatar */}
                    <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden border border-white/20 cursor-pointer hover:ring-2 hover:ring-[#C2DF0C] transition-all">
                        <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                            AD
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            {shouldShowFilters && (
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-4 md:mt-5 pt-4 md:pt-5 border-t border-white/10">
                    {/* Date Picker */}
                    <button className="flex items-center justify-center gap-2 h-8 md:h-9 px-3 md:px-4 rounded-lg border border-white/20 bg-white/10 text-white text-xs md:text-sm font-medium hover:bg-white/20 transition-colors">
                        <span className="material-symbols-outlined text-[16px] md:text-[18px]">calendar_today</span>
                        <span>Este Mês</span>
                    </button>

                    {/* Channel Filters - only show on campaign-relevant pages */}
                    {shouldShowCampaignFilters && (
                        <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
                            <button className="flex items-center gap-2 h-8 md:h-9 px-3 md:px-4 rounded-full bg-white text-[#19069E] text-xs font-bold whitespace-nowrap shadow-sm">
                                Todas
                                <span className="material-symbols-outlined text-[14px] md:text-[16px]">check</span>
                            </button>
                            <button className="flex items-center gap-2 h-8 md:h-9 px-3 md:px-4 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium whitespace-nowrap hover:bg-white hover:text-[#19069E] transition-all">
                                Facebook
                            </button>
                            <button className="flex items-center gap-2 h-8 md:h-9 px-3 md:px-4 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium whitespace-nowrap hover:bg-white hover:text-[#19069E] transition-all">
                                Google
                            </button>
                            <button className="hidden sm:flex items-center gap-2 h-8 md:h-9 px-3 md:px-4 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium whitespace-nowrap hover:bg-white hover:text-[#19069E] transition-all">
                                Email
                            </button>
                        </div>
                    )}

                    {/* Export Button */}
                    <button className="ml-auto flex items-center justify-center gap-2 h-8 md:h-9 px-3 md:px-4 rounded-lg bg-[#C2DF0C] hover:bg-[#B0CC0B] text-[#19069E] text-xs md:text-sm font-bold shadow-lg transition-all">
                        <span className="material-symbols-outlined text-[16px] md:text-[18px]">download</span>
                        <span className="hidden sm:inline">Exportar</span>
                    </button>
                </div>
            )}
        </header>
    );
}
