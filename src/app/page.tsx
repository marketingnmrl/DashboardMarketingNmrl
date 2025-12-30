"use client";

import { usePageMetrics } from "@/hooks/usePageMetrics";

// KPI Card Component
function KPICard({
  icon,
  label,
  value,
  change,
  changeType = "positive",
  subtitle,
}: {
  icon: string;
  label: string;
  value: string;
  change: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
}) {
  const changeColors = {
    positive: "bg-[#C2DF0C] text-[#19069E]",
    negative: "bg-red-100 text-red-700",
    neutral: "bg-white/90 text-gray-600",
  };

  const changeIcons = {
    positive: "trending_up",
    negative: "trending_down",
    neutral: "trending_flat",
  };

  return (
    <div className="p-6 rounded-xl bg-[#19069E] text-white shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group">
      {/* Background Icon */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <span className="material-symbols-outlined text-[100px] text-white">{icon}</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-2.5 bg-white/10 rounded-lg backdrop-blur-sm">
          <span className="material-symbols-outlined text-[#C2DF0C] text-[24px]">{icon}</span>
        </div>
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${changeColors[changeType]}`}>
          <span className="material-symbols-outlined text-[14px] mr-1">{changeIcons[changeType]}</span>
          {change}
        </span>
      </div>

      {/* Content */}
      <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">
        {label}
      </p>
      <p className="text-3xl font-extrabold text-white relative z-10">{value}</p>
      {subtitle && (
        <p className="text-xs text-blue-200 mt-2 font-medium relative z-10">{subtitle}</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  // Provide metrics for AI Assistant
  usePageMetrics({
    pagina: "Visão Geral do Desempenho",
    descricao: "Dashboard principal com métricas consolidadas de todas as campanhas",
    periodo: "Dezembro 2025",
    filtros: {
      campanha: "Todas",
      plataforma: "Todas",
    },
    kpis: {
      investimento_total: 42500,
      impressoes: 2400000,
      cliques: 85340,
      leads: 3200,
      conversoes: 450,
      cpc_medio: 0.50,
      cpm_medio: 17.70,
      ctr_medio: 3.55,
      taxa_conversao: 14.06,
    },
    dados_adicionais: {
      campanhas_ativas: 4,
      melhor_campanha: "Black Friday 2025",
      origem_trafego: {
        google_search: 45,
        redes_sociais: 25,
        pago_ads: 20,
        direto_email: 10,
      },
    },
  });

  return (

    <div className="max-w-7xl mx-auto space-y-8">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <KPICard
          icon="payments"
          label="Investimento Total"
          value="R$ 42.500"
          change="12.5%"
          changeType="positive"
          subtitle="vs. R$ 37.800 (Mês anterior)"
        />
        <KPICard
          icon="visibility"
          label="Total de Impressões"
          value="2.4M"
          change="8.2%"
          changeType="positive"
          subtitle="vs. 2.2M (Mês anterior)"
        />
        <KPICard
          icon="ads_click"
          label="Total de Cliques"
          value="85.340"
          change="5.4%"
          changeType="positive"
          subtitle="vs. 80.950 (Mês anterior)"
        />
        <KPICard
          icon="group_add"
          label="Total de Leads"
          value="3.200"
          change="15.3%"
          changeType="positive"
          subtitle="vs. 2.775 (Mês anterior)"
        />
        <KPICard
          icon="shopping_cart_checkout"
          label="Total de Conversões"
          value="450"
          change="22.1%"
          changeType="positive"
          subtitle="vs. 368 (Mês anterior)"
        />
        <KPICard
          icon="price_change"
          label="CPC Médio"
          value="R$ 0,50"
          change="-2.1%"
          changeType="positive"
          subtitle="Otimização positiva"
        />
        <KPICard
          icon="campaign"
          label="CPM Médio"
          value="R$ 17,70"
          change="0.5%"
          changeType="neutral"
          subtitle="Estável vs. mês anterior"
        />
        <KPICard
          icon="percent"
          label="CTR Médio"
          value="3.55%"
          change="0.5%"
          changeType="positive"
          subtitle="Acima da média do setor"
        />
        <KPICard
          icon="fact_check"
          label="Taxa de Conversão Total"
          value="14.06%"
          change="1.2%"
          changeType="positive"
          subtitle="Alta performance"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Evolution Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#19069E]">Evolução de Tráfego e Leads</h3>
              <p className="text-sm text-gray-500 font-normal">Comparativo diário (Últimos 30 dias)</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button className="px-3 py-1 text-xs font-bold rounded bg-white text-[#19069E] shadow-sm border border-gray-200">
                Diário
              </button>
              <button className="px-3 py-1 text-xs font-medium rounded text-gray-500 hover:text-[#19069E] transition-colors">
                Semanal
              </button>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="relative w-full h-[250px] bg-gradient-to-b from-[#19069E]/5 to-transparent rounded-lg flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-[#19069E]/30">show_chart</span>
              <p className="text-sm text-gray-400 mt-2">Gráfico de linha será renderizado aqui</p>
            </div>
          </div>

          <div className="flex justify-between mt-4 text-xs text-gray-400 font-medium">
            <span>01 Set</span>
            <span>08 Set</span>
            <span>15 Set</span>
            <span>22 Set</span>
            <span>29 Set</span>
          </div>
        </div>

        {/* Traffic Origin Chart */}
        <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-[#19069E] mb-1">Origem do Tráfego</h3>
          <p className="text-sm text-gray-500 font-normal mb-6">Distribuição por canal</p>

          {/* Donut Placeholder */}
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="relative w-48 h-48 rounded-full border-[24px] border-[#19069E] flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[24px] border-transparent border-t-[#C2DF0C] border-r-[#C2DF0C]" style={{ transform: "rotate(45deg)" }}></div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-[#19069E]">45%</span>
                <span className="text-xs text-gray-500 font-medium">Orgânico</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#19069E]"></span>
                <span className="text-gray-600 font-medium">Google Search</span>
              </div>
              <span className="font-bold text-gray-900">45%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#C2DF0C]"></span>
                <span className="text-gray-600 font-medium">Redes Sociais</span>
              </div>
              <span className="font-bold text-gray-900">25%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-300"></span>
                <span className="text-gray-600 font-medium">Pago (Ads)</span>
              </div>
              <span className="font-bold text-gray-900">20%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-200"></span>
                <span className="text-gray-600 font-medium">Direto / Email</span>
              </div>
              <span className="font-bold text-gray-900">10%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Conversions Table */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#19069E]">Últimas Conversões</h3>
            <p className="text-sm text-gray-500 font-normal">Leads que converteram em vendas recentemente</p>
          </div>
          <button className="text-sm font-bold text-[#19069E] hover:underline">Ver todos</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-bold text-[#19069E]">
              <tr>
                <th className="px-6 py-4">Lead</th>
                <th className="px-6 py-4">Campanha</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#19069E]/10 text-[#19069E] flex items-center justify-center text-xs font-bold">
                    JD
                  </div>
                  João da Silva
                </td>
                <td className="px-6 py-4">Verão 2025 Promo</td>
                <td className="px-6 py-4">Hoje, 14:30</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                    Concluído
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 450,00</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#19069E]/10 text-[#19069E] flex items-center justify-center text-xs font-bold">
                    MC
                  </div>
                  Maria Costa
                </td>
                <td className="px-6 py-4">Black Friday Antecipada</td>
                <td className="px-6 py-4">Ontem, 09:15</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                    Concluído
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 1.200,00</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">
                    PL
                  </div>
                  Pedro Lima
                </td>
                <td className="px-6 py-4">Lançamento Ebook</td>
                <td className="px-6 py-4">28 Set, 16:45</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                    Processando
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 89,90</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#19069E]/10 text-[#19069E] flex items-center justify-center text-xs font-bold">
                    AN
                  </div>
                  Ana Nunes
                </td>
                <td className="px-6 py-4">Retargeting Facebook</td>
                <td className="px-6 py-4">28 Set, 11:20</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C2DF0C] text-[#19069E]">
                    Concluído
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-[#19069E]">R$ 320,00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
