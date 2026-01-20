"use client";

import { useEffect, useMemo, useState } from "react";
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

// KPI Card with tooltip support
function KPICard({
  label,
  value,
  variation,
  icon,
  isLoading,
  tooltip,
}: {
  label: string;
  value: string;
  variation?: { value: number; isPositive: boolean };
  icon: string;
  isLoading?: boolean;
  tooltip?: string;
}) {
  return (
    <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm relative group" title={tooltip}>
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
      {/* Tooltip on hover */}
      {tooltip && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-10 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          {tooltip}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  );
}

// Daily Chart Component using Recharts
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DailyChartProps {
  dailyData: Array<{
    date: string;
    leads: number;
    purchases: number;
    purchaseValue: number;
  }>;
  isLoading: boolean;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-gray-900 text-white text-xs rounded-xl px-4 py-3 shadow-2xl border border-gray-700">
      <div className="font-bold mb-2 text-center text-sm">{label || ""}</div>
      <div className="space-y-1.5">
        {payload.map((entry, index) => {
          const labels: Record<string, string> = {
            purchaseValue: "Faturamento",
            leads: "Leads",
            purchases: "Vendas",
          };
          const formatValue = (key: string, val: number) => {
            if (key === "purchaseValue") {
              return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
            }
            return val.toLocaleString("pt-BR");
          };
          return (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-300">{labels[entry.dataKey] || entry.dataKey}</span>
              </div>
              <span className="font-bold">{formatValue(entry.dataKey, entry.value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function DailyChart({ dailyData, isLoading }: DailyChartProps) {
  // Format data with short date for XAxis
  const chartData = dailyData.map((d) => ({
    ...d,
    shortDate: d.date.split("-").slice(1).reverse().join("/"),
  }));

  return (
    <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-[#19069E]">bar_chart</span>
        <h3 className="font-bold text-[#19069E]">Dados Diários</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4">Performance diária de vendas e investimentos</p>

      {isLoading ? (
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
      ) : dailyData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          Sem dados para o período
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                {/* Gradient for Faturamento bars */}
                <linearGradient id="faturamentoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#19069E" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3B28B8" stopOpacity={0.8} />
                </linearGradient>
                {/* Gradient for Leads area */}
                <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C2DF0C" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#C2DF0C" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

              <XAxis
                dataKey="shortDate"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                dy={10}
              />

              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()
                }
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f4f6" }} />

              {/* Faturamento as Bars */}
              <Bar
                yAxisId="left"
                dataKey="purchaseValue"
                fill="url(#faturamentoGradient)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />

              {/* Leads as smooth Area */}
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="leads"
                stroke="#C2DF0C"
                strokeWidth={3}
                fill="url(#leadsGradient)"
                dot={{ fill: "#C2DF0C", strokeWidth: 2, r: 4, stroke: "#fff" }}
                activeDot={{ fill: "#C2DF0C", strokeWidth: 2, r: 6, stroke: "#fff" }}
              />

              {/* Vendas as smooth Line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="purchases"
                stroke="#93C5FD"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#93C5FD", strokeWidth: 2, r: 3, stroke: "#fff" }}
                activeDot={{ fill: "#93C5FD", strokeWidth: 2, r: 5, stroke: "#fff" }}
              />

              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    purchaseValue: "Faturamento",
                    leads: "Leads",
                    purchases: "Vendas",
                  };
                  return <span className="text-gray-600 text-xs">{labels[value] || value}</span>;
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
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

      {/* ============ 6 KPI CARDS (Main Metrics) ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Investimento */}
        <KPICard
          label="Investimento"
          value={hasData ? formatCurrency(metrics.totalSpend) : "—"}
          icon="payments"
          isLoading={isLoading}
        />

        {/* Faturamento */}
        <KPICard
          label="Faturamento"
          value={hasData ? formatCurrency(metrics.totalPurchaseValue) : "—"}
          icon="attach_money"
          isLoading={isLoading}
        />

        {/* ROAS */}
        <KPICard
          label="ROAS"
          value={hasData ? `${metrics.avgRoas.toFixed(2)}x` : "—"}
          icon="trending_up"
          isLoading={isLoading}
          tooltip={hasData ? `Retorno: ${formatCurrency(metrics.totalPurchaseValue - metrics.totalSpend)}` : undefined}
        />

        {/* Vendas */}
        <KPICard
          label="Vendas"
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

      {/* ============ TRAFFIC METRICS ============ */}
      <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#19069E]">analytics</span>
          <h3 className="font-bold text-gray-800">Métricas de Tráfego</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Impressões */}
          <div className="text-center py-3 px-2 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Impressões</p>
            {isLoading ? (
              <div className="h-6 w-16 bg-gray-200 animate-pulse rounded mx-auto" />
            ) : (
              <p className="text-lg font-bold text-gray-800">
                {hasData ? formatNumber(metrics.totalImpressions) : "—"}
              </p>
            )}
          </div>

          {/* Cliques */}
          <div className="text-center py-3 px-2 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cliques</p>
            {isLoading ? (
              <div className="h-6 w-16 bg-gray-200 animate-pulse rounded mx-auto" />
            ) : (
              <p className="text-lg font-bold text-gray-800">
                {hasData ? formatNumber(metrics.totalLinkClicks) : "—"}
              </p>
            )}
          </div>

          {/* CTR */}
          <div className="text-center py-3 px-2 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">CTR</p>
            {isLoading ? (
              <div className="h-6 w-16 bg-gray-200 animate-pulse rounded mx-auto" />
            ) : (
              <p className="text-lg font-bold text-gray-800">
                {hasData ? `${metrics.avgCtr.toFixed(2)}%` : "—"}
              </p>
            )}
          </div>

          {/* CPM */}
          <div className="text-center py-3 px-2 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">CPM</p>
            {isLoading ? (
              <div className="h-6 w-16 bg-gray-200 animate-pulse rounded mx-auto" />
            ) : (
              <p className="text-lg font-bold text-gray-800">
                {hasData ? formatCurrency(metrics.avgCpm) : "—"}
              </p>
            )}
          </div>

          {/* CPC */}
          <div className="text-center py-3 px-2 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">CPC</p>
            {isLoading ? (
              <div className="h-6 w-16 bg-gray-200 animate-pulse rounded mx-auto" />
            ) : (
              <p className="text-lg font-bold text-gray-800">
                {hasData ? formatCurrency(metrics.avgCpc) : "—"}
              </p>
            )}
          </div>

          {/* CPL */}
          <div className="text-center py-3 px-2 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">CPL</p>
            {isLoading ? (
              <div className="h-6 w-16 bg-gray-200 animate-pulse rounded mx-auto" />
            ) : (
              <p className="text-lg font-bold text-gray-800">
                {hasData ? formatCurrency(metrics.avgCpl) : "—"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ============ DAILY CHART ============ */}
      <DailyChart dailyData={dailyData} isLoading={isLoading} />
    </div>
  );
}
