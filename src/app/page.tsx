"use client";

import { useEffect, useMemo } from "react";
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
  return `${value.toFixed(2)}%`;
}

// KPI Card with variation indicator
function KPICard({
  label,
  value,
  variation,
  icon,
  isLoading,
}: {
  label: string;
  value: string;
  variation?: { value: number; isPositive: boolean };
  icon: string;
  isLoading?: boolean;
}) {
  return (
    <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        {isLoading ? (
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
        ) : (
          <>
            <span className="text-2xl font-extrabold text-[#19069E]">{value}</span>
            {variation && (
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded ${variation.isPositive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                  }`}
              >
                {variation.isPositive ? "▲" : "▼"} {Math.abs(variation.value).toFixed(1)}%
              </span>
            )}
          </>
        )}
        <span className="material-symbols-outlined text-[#C2DF0C] text-xl ml-auto">
          {icon}
        </span>
      </div>
    </div>
  );
}

// Daily Chart Component
function DailyChart({
  dailyData,
  isLoading,
}: {
  dailyData: Array<{
    date: string;
    spend: number;
    leads: number;
    impressions: number;
  }>;
  isLoading: boolean;
}) {
  // Find max values for scaling
  const maxSpend = Math.max(...dailyData.map((d) => d.spend), 1);
  const maxLeads = Math.max(...dailyData.map((d) => d.leads), 1);
  const maxImpressions = Math.max(...dailyData.map((d) => d.impressions), 1);

  // Build SVG path for line charts
  const buildPath = (
    data: number[],
    max: number,
    height: number = 180
  ) => {
    const width = 100 / data.length;
    return data
      .map((value, i) => {
        const x = i * width + width / 2;
        const y = height - (value / max) * (height - 20);
        return `${i === 0 ? "M" : "L"} ${x}% ${y}`;
      })
      .join(" ");
  };

  const spendPath = buildPath(
    dailyData.map((d) => d.spend),
    maxSpend
  );

  const leadsPath = buildPath(
    dailyData.map((d) => d.leads),
    maxLeads
  );

  return (
    <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-[#19069E]">bar_chart</span>
        <h3 className="font-bold text-[#19069E]">Dados Diários</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4">Performance diária de vendas e investimentos</p>

      {isLoading ? (
        <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />
      ) : dailyData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-400">
          Sem dados para o período
        </div>
      ) : (
        <div className="relative h-48">
          {/* Bar Chart - Impressions (as proxy for volume) */}
          <div className="absolute inset-0 flex items-end justify-between gap-1 px-2">
            {dailyData.map((day, i) => {
              const barHeight = (day.impressions / maxImpressions) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 bg-[#19069E] rounded-t-sm opacity-30"
                  style={{ height: `${Math.max(barHeight, 2)}%` }}
                  title={`${day.date}: ${day.impressions.toLocaleString("pt-BR")} impressões`}
                />
              );
            })}
          </div>

          {/* Line Charts */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            {/* Spend Line (green) */}
            <path
              d={spendPath}
              fill="none"
              stroke="#C2DF0C"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Leads Line (light blue dashed) */}
            <path
              d={leadsPath}
              fill="none"
              stroke="#93C5FD"
              strokeWidth="2"
              strokeDasharray="6 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#19069E] opacity-50" />
          <span className="text-gray-600">Impressões</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#C2DF0C]" />
          <span className="text-gray-600">Investimento</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#93C5FD]" />
          <span className="text-gray-600">Leads</span>
        </div>
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
    isLoading: dataLoading,
    error,
  } = useStractData(settings?.visaoGeralSheetUrl, {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // Update available dates in context when data loads
  useEffect(() => {
    if (dailyData.length > 0) {
      const dates = dailyData.map((d) => d.date);
      setAvailableDates(dates);
    }
  }, [dailyData, setAvailableDates]);

  const isLoading = settingsLoading || dataLoading;
  const hasData = !error && metrics.totalImpressions > 0;

  // Calculate derived metrics for KPIs
  const kpiData = useMemo(() => {
    const faturamento = metrics.totalPurchaseValue || 0;
    const investimento = metrics.totalSpend || 0;
    const vendas = metrics.totalPurchases || 0;
    const leads = metrics.totalLeads || 0;
    const leadsTotal = leads;
    const taxaConversao = leads > 0 ? (vendas / leads) * 100 : 0;

    return {
      faturamentoInvestimento: faturamento - investimento,
      vendasLeads: vendas,
      leadsTotal,
      taxaConversao,
    };
  }, [metrics]);

  // Provide metrics for AI Assistant
  usePageMetrics({
    pagina: "Visão Geral do Projeto",
    descricao: "Dashboard principal com métricas consolidadas do projeto",
    periodo: `${dateRange.startDate} a ${dateRange.endDate}`,
    filtros: {
      campanha: "Todas",
      plataforma: "Todas",
    },
    kpis: {
      faturamento_investimento: kpiData.faturamentoInvestimento,
      vendas_leads: kpiData.vendasLeads,
      leads_total: kpiData.leadsTotal,
      taxa_conversao: kpiData.taxaConversao,
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#19069E]">Visão Geral do Projeto</h1>
        <p className="text-sm text-gray-500">Acompanhamento em tempo real dos principais ativos</p>
      </div>

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

      {/* ============ 4 KPI CARDS ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Faturamento / Investimento */}
        <KPICard
          label="Faturamento / Investimento"
          value={hasData ? formatCurrency(kpiData.faturamentoInvestimento) : "—"}
          icon="monitoring"
          isLoading={isLoading}
        />

        {/* Vendas / Leads */}
        <KPICard
          label="Vendas / Leads"
          value={hasData ? formatNumber(kpiData.vendasLeads) : "—"}
          icon="shopping_cart"
          isLoading={isLoading}
        />

        {/* Leads Totais */}
        <KPICard
          label="Leads Totais"
          value={hasData ? formatNumber(kpiData.leadsTotal) : "—"}
          icon="group"
          isLoading={isLoading}
        />

        {/* Taxa de Conversão */}
        <KPICard
          label="Taxa de Conversão"
          value={hasData ? formatPercent(kpiData.taxaConversao) : "—"}
          icon="percent"
          isLoading={isLoading}
        />
      </div>

      {/* ============ DAILY CHART ============ */}
      <DailyChart dailyData={dailyData} isLoading={isLoading} />
    </div>
  );
}
