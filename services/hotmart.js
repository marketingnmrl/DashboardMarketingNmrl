const axios = require('axios');

const TOKEN_URL = 'https://api-sec-vlc.hotmart.com/security/oauth/token';
const SALES_URL = 'https://developers.hotmart.com/payments/api/v1/sales/history';
const SALES_SUMMARY_URL = 'https://developers.hotmart.com/payments/api/v1/sales/summary';

const ALL_STATUSES = [
  'COMPLETE', 'APPROVED', 'CANCELLED', 'REFUNDED', 'EXPIRED',
  'OVERDUE', 'STARTED', 'WAITING_PAYMENT', 'PRINTED_BILLET',
  'NO_FUNDS', 'CHARGEBACK', 'BLOCKED'
];

const STATUS_MAP = {
  STARTED: 'Novo Lead',
  WAITING_PAYMENT: 'Contato Feito',
  UNDER_ANALYSIS: 'Qualificado',
  PROTEST: 'Qualificado',
  PRINTED_BILLET: 'Contato Feito',
  APPROVED: 'Proposta',
  COMPLETE: 'Fechado',
  CANCELLED: 'Novo Lead',
  REFUNDED: 'Novo Lead',
  CHARGEBACK: 'Novo Lead',
  BLOCKED: 'Novo Lead',
  EXPIRED: 'Novo Lead',
  DELAYED: 'Contato Feito',
  OVERDUE: 'Contato Feito',
  PRE_ORDER: 'Novo Lead',
  NO_FUNDS: 'Contato Feito'
};

let cachedToken = null;
let tokenExpires = 0;

const dataCache = new Map();
const CACHE_TTL = 300000;

function checkCredentials() {
  const missing = [];
  for (const key of ['HOTMART_CLIENT_ID', 'HOTMART_CLIENT_SECRET', 'HOTMART_BASIC']) {
    if (!process.env[key]) missing.push(key);
  }
  return missing;
}

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpires) {
    return cachedToken;
  }

  const missing = checkCredentials();
  if (missing.length > 0) {
    console.error(`Credenciais Hotmart ausentes: ${missing.join(', ')}`);
    return null;
  }

  try {
    const resp = await axios.post(TOKEN_URL, null, {
      headers: {
        Authorization: process.env.HOTMART_BASIC,
        'Content-Type': 'application/json'
      },
      params: {
        grant_type: 'client_credentials',
        client_id: process.env.HOTMART_CLIENT_ID,
        client_secret: process.env.HOTMART_CLIENT_SECRET
      },
      timeout: 10000
    });

    cachedToken = resp.data.access_token;
    tokenExpires = Date.now() + ((resp.data.expires_in || 3600) - 60) * 1000;
    return cachedToken;
  } catch (err) {
    console.error('Erro ao obter token Hotmart:', err.message);
    return null;
  }
}

function getPeriodTimestamps(periodo) {
  const now = new Date();
  const today = new Date(now);
  today.setHours(23, 59, 59, 999);

  let start;
  let end = today;
  const periodLabel = String(periodo || '').toLowerCase();

  if (periodLabel.includes('15')) {
    start = new Date(now);
    start.setDate(start.getDate() - 15);
  } else if (periodLabel.includes('30')) {
    start = new Date(now);
    start.setDate(start.getDate() - 30);
  } else if (periodLabel.includes('passado')) {
    const firstThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(firstThisMonth.getTime() - 1);
    start = new Date(end.getFullYear(), end.getMonth(), 1);
  } else if (periodLabel.includes('este') && periodLabel.includes('mes')) {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    // Default para "Ultimos 7 dias" e variantes com acento/codificacao divergente.
    start = new Date(now);
    start.setDate(start.getDate() - 7);
  }
  start.setHours(0, 0, 0, 0);
  return { startMs: start.getTime(), endMs: end.getTime() };
}

async function fetchSalesByStatus(headers, startMs, endMs, status, maxPages = 10) {
  const items = [];
  let pageToken = null;

  for (let i = 0; i < maxPages; i++) {
    const params = {
      start_date: startMs,
      end_date: endMs,
      max_results: 50,
      transaction_status: status
    };
    if (pageToken) params.page_token = pageToken;

    try {
      const resp = await axios.get(SALES_URL, { headers, params, timeout: 15000 });
      if (resp.status !== 200) break;

      const pageItems = resp.data.items || [];
      items.push(...pageItems);

      pageToken = resp.data.page_info?.next_page_token;
      if (!pageToken || pageItems.length === 0) break;
    } catch {
      break;
    }
  }

  return items;
}

async function fetchAllSales(periodo = 'Últimos 7 dias', maxPages = 10) {
  const cacheKey = `sales_${periodo}`;
  const cached = dataCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const token = await getAccessToken();
  if (!token) return [];

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const { startMs, endMs } = getPeriodTimestamps(periodo);
  const allItems = [];

  for (const status of ALL_STATUSES) {
    const items = await fetchSalesByStatus(headers, startMs, endMs, status, maxPages);
    for (const item of items) {
      item.canal = 'Hotmart';
    }
    allItems.push(...items);
  }

  dataCache.set(cacheKey, { data: allItems, timestamp: Date.now() });
  return allItems;
}

function computeKpis(sales) {
  let totalInvestimento = 0;
  let totalFaturamento = 0;
  let totalVendas = 0;
  const statusesVenda = new Set(['COMPLETE', 'APPROVED']);

  const totalTransacoes = sales.length;
  const totalLeads = sales.filter(
    s => (s.purchase?.status || '') !== 'CANCELLED'
  ).length;

  for (const sale of sales) {
    const purchase = sale.purchase || {};
    const status = purchase.status || '';

    if (statusesVenda.has(status)) {
      const priceValue = purchase.price?.value || 0;
      totalFaturamento += priceValue;
      totalVendas++;

      const feeTotal = purchase.hotmart_fee?.total || 0;
      totalInvestimento += feeTotal;
    }
  }

  const roas = totalInvestimento > 0 ? totalFaturamento / totalInvestimento : 0;
  const taxaConversao = totalTransacoes > 0 ? (totalVendas / totalTransacoes) * 100 : 0;
  const ticketMedio = totalVendas > 0 ? totalFaturamento / totalVendas : 0;

  return {
    investimento: totalInvestimento,
    faturamento: totalFaturamento,
    roas,
    vendas: totalVendas,
    leads: totalLeads,
    conversao: taxaConversao,
    ticket_medio: ticketMedio,
    total_transacoes: totalTransacoes
  };
}

function computeDailyData(sales) {
  const daily = {};

  for (const sale of sales) {
    const purchase = sale.purchase || {};
    const orderTs = purchase.order_date;
    if (!orderTs) continue;

    const dt = new Date(orderTs);
    const dayKey = dt.toISOString().split('T')[0];

    if (!daily[dayKey]) {
      daily[dayKey] = { data: dayKey, faturamento: 0, vendas: 0, transacoes: 0 };
    }

    const status = purchase.status || '';
    daily[dayKey].transacoes++;

    if (status === 'COMPLETE' || status === 'APPROVED') {
      daily[dayKey].faturamento += purchase.price?.value || 0;
      daily[dayKey].vendas++;
    }
  }

  return Object.values(daily).sort((a, b) => a.data.localeCompare(b.data));
}

function computePipeline(sales) {
  const stages = {
    'Novo Lead': 0,
    'Contato Feito': 0,
    'Qualificado': 0,
    'Proposta': 0,
    'Fechado': 0
  };

  for (const sale of sales) {
    const status = sale.purchase?.status || 'STARTED';
    const stage = STATUS_MAP[status] || 'Novo Lead';
    stages[stage]++;
  }

  return stages;
}

function extractLeadsList(sales) {
  return sales.map(sale => {
    const buyer = sale.buyer || {};
    const purchase = sale.purchase || {};
    const product = sale.product || {};
    const orderTs = purchase.order_date;
    const payment = purchase.payment || {};
    const status = purchase.status || '—';
    const priceValue = purchase.price?.value || 0;
    const canal = sale.canal || '—';

    let dt = '—';
    if (orderTs) {
      const d = new Date(orderTs);
      dt = d.toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }

    return {
      Nome: buyer.name || '—',
      Email: buyer.email || '—',
      Produto: product.name || '—',
      Valor: priceValue,
      Pagamento: (payment.type || '—').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      Status: status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      Canal: canal,
      Data: dt
    };
  });
}

function formatBRL(value) {
  return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

module.exports = {
  fetchAllSales,
  computeKpis,
  computeDailyData,
  computePipeline,
  extractLeadsList,
  formatBRL,
  checkCredentials,
  getPeriodTimestamps
};

