"use client";

import { useEffect } from "react";
import { usePageMetrics } from "@/hooks/usePageMetrics";
import { useDashboardSettings } from "@/hooks/useDashboardSettings";
import { useStractData } from "@/hooks/useStractData";
import { useDateFilter } from "@/contexts/DateFilterContext";

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

// Bento KPI Card Component - supports different sizes
function BentoCard({
  icon,
  label,
  value,
  subtitle,
  isLoading,
  size = "sm",
  variant = "primary",
}: {
  icon: string;
  label: string;
  value: string;
  subtitle?: string;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg" | "wide";
  variant?: "primary" | "secondary" | "accent" | "light";
}) {
  const sizeClasses = {
    sm: "p-5",
    md: "p-6",
    lg: "p-8",
    wide: "p-6",
  };

  const valueClasses = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
    wide: "text-3xl",
  };

  const iconBgClasses = {
    sm: "text-[60px]",
    md: "text-[80px]",
    lg: "text-[120px]",
    wide: "text-[80px]",
  };

  const variantClasses = {
    primary: "bg-[#19069E] text-white",
    secondary: "bg-gradient-to-br from-[#19069E] to-[#2B1BB8] text-white",
    accent: "bg-gradient-to-br from-[#C2DF0C] to-[#A8C20A] text-[#19069E]",
    light: "bg-white border border-gray-200 text-gray-900",
  };

  const labelClasses = {
    primary: "text-blue-200",
    secondary: "text-blue-200",
    accent: "text-[#19069E]/70",
    light: "text-gray-500",
  };

  const subtitleClasses = {
    primary: "text-blue-200",
    secondary: "text-blue-200",
    accent: "text-[#19069E]/60",
    light: "text-gray-400",
  };

  const iconColorClasses = {
    primary: "text-white",
    secondary: "text-white",
    accent: "text-[#19069E]/20",
    light: "text-gray-100",
  };

  const badgeClasses = {
    primary: "bg-white/10 text-[#C2DF0C]",
    secondary: "bg-white/10 text-[#C2DF0C]",
    accent: "bg-[#19069E]/10 text-[#19069E]",
    light: "bg-gray-100 text-[#19069E]",
  };

  return (
    <div className={`rounded-2xl shadow-lg hover:shadow-xl transition-all relative overflow-hidden group ${sizeClasses[size]} ${variantClasses[variant]}`}>
      {/* Background Icon */}
      <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <span className={`material-symbols-outlined ${iconBgClasses[size]} ${iconColorClasses[variant]}`}>{icon}</span>
      </div>

      {/* Header Badge */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className={`p-2.5 rounded-xl backdrop-blur-sm ${badgeClasses[variant]}`}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
      </div>

      {/* Content */}
      <p className={`text-xs font-semibold uppercase tracking-wider mb-1 relative z-10 ${labelClasses[variant]}`}>
        {label}
      </p>
      {isLoading ? (
        <div className={`h-9 w-24 rounded animate-pulse ${variant === "light" ? "bg-gray-100" : "bg-white/20"}`} />
      ) : (
        <p className={`font-extrabold relative z-10 ${valueClasses[size]}`}>{value}</p>
      )}
      {subtitle && (
        <p className={`text-xs mt-2 font-medium relative z-10 ${subtitleClasses[variant]}`}>{subtitle}</p>
      )}
    </div>
  );
}

// Mini stat for compact display
function MiniStat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="p-2 rounded-lg bg-[#19069E]/10">
        <span className="material-symbols-outlined text-[18px] text-[#19069E]">{icon}</span>
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { settings, isLoading: settingsLoading } = useDashboardSettings();
  const { dateRange, setAvailableDates } = useDateFilter();

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

  // Update available dates in context when data loads
  useEffect(() => {
    if (dailyData.length > 0) {
      const dates = dailyData.map(d => d.date);
      setAvailableDates(dates);
    }
  }, [dailyData, setAvailableDates]);

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
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-500">error</span>
            <div>
              <p className="font-bold">Erro ao carregar dados</p>
              <p className="text-sm">{error}</p>
              <a href="/configuracoes" className="text-sm underline font-medium mt-1 inline-block">
                Ir para Configurações
              </a>
            </div>
          </div>
        </div>
      )}

      {/* No Sheet Configured Warning */}
      {!settings?.visaoGeralSheetUrl && !settingsLoading && (
        <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-700">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-yellow-500">info</span>
            <div>
              <p className="font-bold">Planilha não configurada</p>
              <p className="text-sm">Configure a URL do Google Sheets para visualizar os dados reais.</p>
              <a href="/configuracoes" className="inline-flex items-center gap-1 mt-2 text-sm font-bold text-[#19069E] hover:underline">
                <span className="material-symbols-outlined text-[16px]">settings</span>
                Ir para Configurações
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ============ BENTO GRID LAYOUT ============ */}

      {/* ROW 1: Main KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Investimento Total */}
        <div className="col-span-2 sm:col-span-1 lg:col-span-1">
          <BentoCard
            icon="payments"
            label="Investimento"
            value={hasData ? formatCurrency(metrics.totalSpend) : "—"}
            isLoading={isLoading}
            size="sm"
            variant="accent"
          />
        </div>

        {/* Impressões */}
        <BentoCard
          icon="visibility"
          label="Impressões"
          value={hasData ? formatNumber(metrics.totalImpressions) : "—"}
          isLoading={isLoading}
          size="sm"
          variant="primary"
        />

        {/* LP Views */}
        <BentoCard
          icon="view_in_ar"
          label="LP Views"
          value={hasData ? formatNumber(metrics.totalLandingPageViews) : "—"}
          isLoading={isLoading}
          size="sm"
          variant="primary"
        />

        {/* Cliques */}
        <BentoCard
          icon="ads_click"
          label="Cliques"
          value={hasData ? formatNumber(metrics.totalClicks) : "—"}
          isLoading={isLoading}
          size="sm"
          variant="primary"
        />

        {/* CTR */}
        <BentoCard
          icon="percent"
          label="CTR"
          value={hasData ? formatPercent(metrics.avgCtr) : "—"}
          isLoading={isLoading}
          size="sm"
          variant="secondary"
        />

        {/* Leads */}
        <BentoCard
          icon="group_add"
          label="Leads"
          value={hasData ? formatNumber(metrics.totalLeads) : "—"}
          isLoading={isLoading}
          size="sm"
          variant="primary"
        />
      </div>

      {/* ROW 2: Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <BentoCard
          icon="price_change"
          label="CPC Médio"
          value={hasData ? formatCurrency(metrics.avgCpc) : "—"}
          isLoading={isLoading}
          size="sm"
          variant="light"
        />
        <BentoCard
          icon="campaign"
          label="CPM Médio"
          value={hasData ? formatCurrency(metrics.avgCpm) : "—"}
          isLoading={isLoading}
          size="sm"
          variant="light"
        />
        <BentoCard
          icon="work"
          label="Campanhas"
          value={hasData ? formatNumber(metrics.uniqueCampaigns) : "—"}
          isLoading={isLoading}
          size="sm"
          variant="light"
        />
        <BentoCard
          icon="calendar_today"
          label="Período"
          value={`${dailyData.length} dias`}
          isLoading={isLoading}
          size="sm"
          variant="light"
        />
      </div>

      {/* ROW 3: Charts - Original Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Evolution Chart - Wide */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#19069E]">📈 Evolução Diária</h3>
              <p className="text-sm text-gray-500">Investimento e cliques por dia</p>
            </div>
          </div>

          {isLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-gray-300 animate-pulse">hourglass_empty</span>
            </div>
          ) : dailyData.length > 0 ? (
            <div className="space-y-2">
              {dailyData.slice(-7).map((day) => {
                const maxSpend = Math.max(...dailyData.map((d) => d.spend));
                const barWidth = maxSpend > 0 ? (day.spend / maxSpend) * 100 : 0;
                return (
                  <div key={day.date} className="flex items-center gap-3 group">
                    <span className="text-xs text-gray-500 w-12 font-mono">{day.date.slice(5)}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#19069E] to-[#C2DF0C] h-full rounded-full flex items-center justify-end pr-3 group-hover:shadow-md transition-shadow"
                        style={{ width: `${Math.max(barWidth, 8)}%` }}
                      >
                        <span className="text-xs text-white font-bold drop-shadow-sm">
                          {formatCurrency(day.spend)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 w-20 text-right font-medium">{day.clicks} cliques</span>
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

        {/* Quick Stats Panel */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm h-full">
          <h3 className="text-lg font-bold text-[#19069E] mb-4">⚡ Resumo Rápido</h3>

          <div className="space-y-3">
            <MiniStat
              icon="trending_up"
              label="Maior gasto/dia"
              value={dailyData.length > 0 ? formatCurrency(Math.max(...dailyData.map(d => d.spend))) : "—"}
            />
            <MiniStat
              icon="trending_down"
              label="Menor gasto/dia"
              value={dailyData.length > 0 ? formatCurrency(Math.min(...dailyData.map(d => d.spend))) : "—"}
            />
            <MiniStat
              icon="calculate"
              label="Média diária"
              value={dailyData.length > 0 ? formatCurrency(metrics.totalSpend / dailyData.length) : "—"}
            />
            <MiniStat
              icon="calendar_today"
              label="Dias ativos"
              value={dailyData.length.toString()}
            />
          </div>
        </div>
      </div>

      {/* ROW 4: Campaign Distribution */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-[#19069E] mb-1">🎯 Performance por Campanha</h3>
        <p className="text-sm text-gray-500 mb-4">Distribuição de investimento e resultados</p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : campaignSummary.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaignSummary.map((campaign, idx) => {
              const shortName = campaign.campaignName.match(/\[([^\]]+)\]/g)?.[1]?.replace(/[\[\]]/g, "") || campaign.campaignName.slice(0, 25);
              const maxSpend = Math.max(...campaignSummary.map(c => c.spend));
              const percentage = maxSpend > 0 ? (campaign.spend / maxSpend) * 100 : 0;

              return (
                <div
                  key={campaign.campaignName}
                  className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${idx === 0 ? "border-[#C2DF0C] bg-[#C2DF0C]/5" : "border-gray-100 bg-gray-50"
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-gray-900 truncate max-w-[180px]" title={campaign.campaignName}>
                      {idx === 0 && "🏆 "}{shortName}
                    </span>
                    <span className="text-sm font-extrabold text-[#19069E]">
                      {formatCurrency(campaign.spend)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-[#19069E] to-[#C2DF0C] rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex gap-4 text-xs text-gray-500">
                    <span><strong className="text-gray-700">{formatNumber(campaign.impressions)}</strong> imp</span>
                    <span><strong className="text-gray-700">{formatNumber(campaign.clicks)}</strong> cliques</span>
                    <span><strong className="text-gray-700">{formatPercent(campaign.ctr)}</strong> CTR</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-[120px] flex items-center justify-center text-gray-400">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl">pie_chart</span>
              <p className="text-sm mt-2">Sem dados de campanhas</p>
            </div>
          </div>
        )}
      </div>

      {/* Campaign Detail Table */}
      {
        campaignSummary.length > 0 && (
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#19069E] to-[#2B1BB8]">
              <h3 className="text-lg font-bold text-white">📊 Detalhamento Completo</h3>
              <p className="text-sm text-blue-200">Todas as métricas por campanha</p>
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
                      <td className="px-6 py-4 text-right font-bold text-[#19069E]">{formatCurrency(campaign.spend)}</td>
                      <td className="px-6 py-4 text-right">{formatNumber(campaign.impressions)}</td>
                      <td className="px-6 py-4 text-right">{formatNumber(campaign.clicks)}</td>
                      <td className="px-6 py-4 text-right">{formatPercent(campaign.ctr)}</td>
                      <td className="px-6 py-4 text-right">{formatCurrency(campaign.cpc)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#19069E]/5 font-bold">
                  <tr>
                    <td className="px-6 py-4 text-[#19069E]">Total</td>
                    <td className="px-6 py-4 text-right text-[#19069E]">{formatCurrency(metrics.totalSpend)}</td>
                    <td className="px-6 py-4 text-right text-[#19069E]">{formatNumber(metrics.totalImpressions)}</td>
                    <td className="px-6 py-4 text-right text-[#19069E]">{formatNumber(metrics.totalClicks)}</td>
                    <td className="px-6 py-4 text-right text-[#19069E]">{formatPercent(metrics.avgCtr)}</td>
                    <td className="px-6 py-4 text-right text-[#19069E]">{formatCurrency(metrics.avgCpc)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )
      }
    </div >
  );
}
