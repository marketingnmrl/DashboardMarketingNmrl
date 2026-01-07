"use client";

import { useState, useEffect } from "react";
import { usePageMetrics } from "@/hooks/usePageMetrics";
import { useDashboardSettings } from "@/hooks/useDashboardSettings";
import { useStractData, DatePreset, getDateRangeFromPreset, DATE_PRESET_LABELS } from "@/hooks/useStractData";

// Format currency
function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Format number with locale
function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}

// Format percentage
function formatPercent(value: number): string {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

// KPI Card Component
function KPICard({
  icon,
  label,
  value,
  subtitle,
  isLoading,
}: {
  icon: string;
  label: string;
  value: string;
  subtitle?: string;
  isLoading?: boolean;
}) {
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
      </div>

      {/* Content */}
      <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">
        {label}
      </p>
      {isLoading ? (
        <div className="h-9 w-24 bg-white/20 rounded animate-pulse" />
      ) : (
        <p className="text-3xl font-extrabold text-white relative z-10">{value}</p>
      )}
      {subtitle && (
        <p className="text-xs text-blue-200 mt-2 font-medium relative z-10">{subtitle}</p>
      )}
    </div>
  );
}

// Date Preset Selector Component
function DatePresetSelector({
  value,
  onChange,
}: {
  value: DatePreset;
  onChange: (preset: DatePreset) => void;
}) {
  const presets: DatePreset[] = ["today", "yesterday", "last7days", "last30days", "thisMonth", "lastMonth"];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((preset) => (
        <button
          key={preset}
          onClick={() => onChange(preset)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${value === preset
              ? "bg-[#19069E] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          {DATE_PRESET_LABELS[preset]}
        </button>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { settings, isLoading: settingsLoading } = useDashboardSettings();
  const [datePreset, setDatePreset] = useState<DatePreset>("last7days");
  const [dateRange, setDateRange] = useState(() => getDateRangeFromPreset("last7days"));

  // Update date range when preset changes
  useEffect(() => {
    setDateRange(getDateRangeFromPreset(datePreset));
  }, [datePreset]);

  // Fetch Stract data
  const {
    metrics,
    dailyData,
    campaignSummary,
    isLoading: dataLoading,
    error,
    dateRange: availableDateRange,
  } = useStractData(settings?.visaoGeralSheetUrl, {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const isLoading = settingsLoading || dataLoading;
  const hasData = !error && metrics.totalImpressions > 0;

  // Provide metrics for AI Assistant
  usePageMetrics({
    pagina: "Visão Geral do Desempenho",
    descricao: "Dashboard principal com métricas consolidadas de todas as campanhas",
    periodo: `${dateRange.startDate} a ${dateRange.endDate}`,
    filtros: {
      campanha: "Todas",
      plataforma: "Todas",
    },
    kpis: {
      investimento_total: metrics.totalSpend,
      impressoes: metrics.totalImpressions,
      cliques: metrics.totalClicks,
      leads: metrics.totalLeads,
      cpc_medio: metrics.avgCpc,
      cpm_medio: metrics.avgCpm,
      ctr_medio: metrics.avgCtr,
    },
    dados_adicionais: {
      campanhas_ativas: metrics.uniqueCampaigns,
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header with Date Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#19069E]">Visão Geral</h2>
          {availableDateRange && (
            <p className="text-sm text-gray-500">
              Dados disponíveis: {availableDateRange.start} a {availableDateRange.end}
            </p>
          )}
        </div>
        <DatePresetSelector value={datePreset} onChange={setDatePreset} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-500">error</span>
            <div>
              <p className="font-bold">Erro ao carregar dados</p>
              <p className="text-sm">{error}</p>
              <p className="text-sm mt-2">
                Configure a planilha em{" "}
                <a href="/configuracoes" className="underline font-medium">
                  Configurações
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Sheet Configured Warning */}
      {!settings?.visaoGeralSheetUrl && !settingsLoading && (
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-yellow-500">info</span>
            <div>
              <p className="font-bold">Planilha não configurada</p>
              <p className="text-sm">
                Você precisa configurar a URL do Google Sheets para visualizar os dados reais.
              </p>
              <a
                href="/configuracoes"
                className="inline-flex items-center gap-1 mt-2 text-sm font-bold text-[#19069E] hover:underline"
              >
                <span className="material-symbols-outlined text-[16px]">settings</span>
                Ir para Configurações
              </a>
            </div>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <KPICard
          icon="payments"
          label="Investimento Total"
          value={hasData ? formatCurrency(metrics.totalSpend) : "—"}
          subtitle={`${dateRange.startDate} a ${dateRange.endDate}`}
          isLoading={isLoading}
        />
        <KPICard
          icon="visibility"
          label="Total de Impressões"
          value={hasData ? formatNumber(metrics.totalImpressions) : "—"}
          subtitle="Período selecionado"
          isLoading={isLoading}
        />
        <KPICard
          icon="ads_click"
          label="Total de Cliques"
          value={hasData ? formatNumber(metrics.totalClicks) : "—"}
          subtitle="Período selecionado"
          isLoading={isLoading}
        />
        <KPICard
          icon="group_add"
          label="Leads"
          value={hasData ? formatNumber(metrics.totalLeads) : "—"}
          subtitle="Período selecionado"
          isLoading={isLoading}
        />
        <KPICard
          icon="price_change"
          label="CPC Médio"
          value={hasData ? formatCurrency(metrics.avgCpc) : "—"}
          subtitle="Custo por clique"
          isLoading={isLoading}
        />
        <KPICard
          icon="campaign"
          label="CPM Médio"
          value={hasData ? formatCurrency(metrics.avgCpm) : "—"}
          subtitle="Custo por mil impressões"
          isLoading={isLoading}
        />
        <KPICard
          icon="percent"
          label="CTR Médio"
          value={hasData ? formatPercent(metrics.avgCtr) : "—"}
          subtitle="Taxa de cliques"
          isLoading={isLoading}
        />
        <KPICard
          icon="work"
          label="Campanhas Ativas"
          value={hasData ? formatNumber(metrics.uniqueCampaigns) : "—"}
          subtitle="No período selecionado"
          isLoading={isLoading}
        />
        <KPICard
          icon="view_in_ar"
          label="Landing Page Views"
          value={hasData ? formatNumber(metrics.totalLandingPageViews) : "—"}
          subtitle="Visualizações da LP"
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Evolution Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#19069E]">Evolução Diária</h3>
              <p className="text-sm text-gray-500 font-normal">
                Investimento e cliques por dia
              </p>
            </div>
          </div>

          {/* Simple Bar Chart Visualization */}
          {isLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse">
                hourglass_empty
              </span>
            </div>
          ) : dailyData.length > 0 ? (
            <div className="space-y-3">
              {dailyData.slice(-7).map((day) => {
                const maxSpend = Math.max(...dailyData.map((d) => d.spend));
                const barWidth = maxSpend > 0 ? (day.spend / maxSpend) * 100 : 0;
                return (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-20">{day.date.slice(5)}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-[#19069E] h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${barWidth}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {formatCurrency(day.spend)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">{day.clicks} cliques</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <span className="material-symbols-outlined text-4xl">show_chart</span>
                <p className="text-sm mt-2">Sem dados para o período</p>
              </div>
            </div>
          )}
        </div>

        {/* Campaign Distribution */}
        <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-[#19069E] mb-1">Por Campanha</h3>
          <p className="text-sm text-gray-500 font-normal mb-4">Distribuição de investimento</p>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : campaignSummary.length > 0 ? (
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {campaignSummary.map((campaign) => {
                // Extract short name from campaign name
                const shortName = campaign.campaignName.match(/\[([^\]]+)\]/g)?.[1]?.replace(/[\[\]]/g, "") || campaign.campaignName.slice(0, 20);
                return (
                  <div key={campaign.campaignName} className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]" title={campaign.campaignName}>
                        {shortName}
                      </span>
                      <span className="text-sm font-bold text-[#19069E]">
                        {formatCurrency(campaign.spend)}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>{formatNumber(campaign.impressions)} imp</span>
                      <span>{formatNumber(campaign.clicks)} cliques</span>
                      <span>CTR {formatPercent(campaign.ctr)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <span className="material-symbols-outlined text-4xl">pie_chart</span>
                <p className="text-sm mt-2">Sem dados</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Table */}
      {campaignSummary.length > 0 && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-[#19069E]">Detalhamento por Campanha</h3>
            <p className="text-sm text-gray-500 font-normal">
              Performance de cada campanha no período
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-bold text-[#19069E]">
                <tr>
                  <th className="px-6 py-4">Campanha</th>
                  <th className="px-6 py-4 text-right">Investimento</th>
                  <th className="px-6 py-4 text-right">Impressões</th>
                  <th className="px-6 py-4 text-right">Cliques</th>
                  <th className="px-6 py-4 text-right">CTR</th>
                  <th className="px-6 py-4 text-right">CPC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaignSummary.map((campaign) => (
                  <tr key={campaign.campaignName} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-[300px] truncate" title={campaign.campaignName}>
                      {campaign.campaignName}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[#19069E]">
                      {formatCurrency(campaign.spend)}
                    </td>
                    <td className="px-6 py-4 text-right">{formatNumber(campaign.impressions)}</td>
                    <td className="px-6 py-4 text-right">{formatNumber(campaign.clicks)}</td>
                    <td className="px-6 py-4 text-right">{formatPercent(campaign.ctr)}</td>
                    <td className="px-6 py-4 text-right">{formatCurrency(campaign.cpc)}</td>
                  </tr>
                ))}
              </tbody>
              {/* Totals Row */}
              <tfoot className="bg-[#19069E]/5 font-bold">
                <tr>
                  <td className="px-6 py-4 text-[#19069E]">Total</td>
                  <td className="px-6 py-4 text-right text-[#19069E]">
                    {formatCurrency(metrics.totalSpend)}
                  </td>
                  <td className="px-6 py-4 text-right text-[#19069E]">
                    {formatNumber(metrics.totalImpressions)}
                  </td>
                  <td className="px-6 py-4 text-right text-[#19069E]">
                    {formatNumber(metrics.totalClicks)}
                  </td>
                  <td className="px-6 py-4 text-right text-[#19069E]">
                    {formatPercent(metrics.avgCtr)}
                  </td>
                  <td className="px-6 py-4 text-right text-[#19069E]">
                    {formatCurrency(metrics.avgCpc)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
