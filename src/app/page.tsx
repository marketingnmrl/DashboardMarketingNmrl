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

// Daily Chart Component with Interactive Tooltip
function DailyChart({
  dailyData,
  isLoading,
}: {
  dailyData: Array<{
    date: string;
    leads: number;
    purchases: number;
    purchaseValue: number;
  }>;
  isLoading: boolean;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Find max values for scaling
  const maxFaturamento = Math.max(...dailyData.map((d) => d.purchaseValue), 1);
  const maxLeads = Math.max(...dailyData.map((d) => d.leads), 1);
  const maxPurchases = Math.max(...dailyData.map((d) => d.purchases), 1);

  // SVG chart dimensions
  const chartHeight = 180;
  const chartPadding = 20;

  // Calculate data points for lines
  const getPoints = (data: number[], max: number) => {
    if (data.length === 0 || max === 0) return [];
    const effectiveHeight = chartHeight - chartPadding * 2;
    const width = 100 / data.length;
    return data.map((value, i) => ({
      x: i * width + width / 2,
      y: chartPadding + effectiveHeight - (value / max) * effectiveHeight,
      value,
    }));
  };

  const leadsPoints = getPoints(dailyData.map((d) => d.leads), maxLeads);
  const purchasesPoints = getPoints(dailyData.map((d) => d.purchases), maxPurchases);

  // Build smooth curved SVG path using Catmull-Rom spline converted to Bezier
  const buildSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }

    // Catmull-Rom to Bezier conversion for smooth curves
    const tension = 0.3; // Lower = smoother curves
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      // Calculate control points
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return path;
  };

  const leadsPath = buildSmoothPath(leadsPoints);
  const purchasesPath = buildSmoothPath(purchasesPoints);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const [, month, day] = dateStr.split("-");
    return `${day}/${month}`;
  };

  const hoveredDay = hoveredIndex !== null ? dailyData[hoveredIndex] : null;

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
          {/* Bar Chart - Faturamento (purchaseValue) */}
          <div className="absolute inset-0 flex items-end justify-between gap-1 px-2">
            {dailyData.map((day, i) => {
              const barHeight = maxFaturamento > 0 ? (day.purchaseValue / maxFaturamento) * 100 : 2;
              const isHovered = hoveredIndex === i;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm transition-opacity duration-150 ${isHovered ? "bg-[#19069E]" : "bg-[#19069E] opacity-60"
                    }`}
                  style={{ height: `${Math.max(barHeight, 2)}%` }}
                />
              );
            })}
          </div>

          {/* Line Charts with Points */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 100 ${chartHeight}`}
            preserveAspectRatio="none"
          >
            {/* Leads Line (green) */}
            {maxLeads > 0 && (
              <>
                <path
                  d={leadsPath}
                  fill="none"
                  stroke="#C2DF0C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                {leadsPoints.map((point, i) => (
                  <circle
                    key={`lead-${i}`}
                    cx={point.x}
                    cy={point.y}
                    r={hoveredIndex === i ? 4 : 2}
                    fill="#C2DF0C"
                    stroke="#fff"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </>
            )}
            {/* Vendas/Purchases Line (light blue dashed) */}
            {maxPurchases > 0 && (
              <>
                <path
                  d={purchasesPath}
                  fill="none"
                  stroke="#93C5FD"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                {purchasesPoints.map((point, i) => (
                  <circle
                    key={`purchase-${i}`}
                    cx={point.x}
                    cy={point.y}
                    r={hoveredIndex === i ? 4 : 2}
                    fill="#93C5FD"
                    stroke="#fff"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </>
            )}
          </svg>

          {/* Hover zones */}
          <div className="absolute inset-0 flex">
            {dailyData.map((_, i) => (
              <div
                key={`zone-${i}`}
                className="flex-1 cursor-crosshair"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </div>

          {/* Tooltip */}
          {hoveredDay && hoveredIndex !== null && (
            <div
              className="absolute z-20 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none"
              style={{
                left: `${((hoveredIndex + 0.5) / dailyData.length) * 100}%`,
                top: "10px",
                transform: "translateX(-50%)",
              }}
            >
              <div className="font-bold mb-1 text-center border-b border-gray-700 pb-1">
                {formatDate(hoveredDay.date)}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#19069E]" />
                  <span>Faturamento:</span>
                  <span className="font-bold ml-auto">
                    {hoveredDay.purchaseValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C2DF0C]" />
                  <span>Leads:</span>
                  <span className="font-bold ml-auto">{hoveredDay.leads}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#93C5FD]" />
                  <span>Vendas:</span>
                  <span className="font-bold ml-auto">{hoveredDay.purchases}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#19069E]" />
          <span className="text-gray-600">Faturamento</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#C2DF0C]" />
          <span className="text-gray-600">Leads</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#93C5FD]" />
          <span className="text-gray-600">Vendas</span>
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
        {/* Investimento */}
        <KPICard
          label="Investimento"
          value={hasData ? formatCurrency(metrics.totalSpend) : "—"}
          icon="payments"
          isLoading={isLoading}
          tooltip={hasData ? `Faturamento: ${formatCurrency(metrics.totalPurchaseValue)}` : undefined}
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
