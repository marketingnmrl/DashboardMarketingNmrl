const { getSupabaseClient } = require('./supabase');
const { getPeriodTimestamps } = require('./hotmart');


function extractProductName(compra = {}) {
  const raw = compra.raw_data || {};

  return (
    raw?.product?.name ||
    raw?.produto?.nome ||
    raw?.offer?.name ||
    raw?.oferta?.nome ||
    raw?.checkout?.product_name ||
    raw?.product_name ||
    raw?.nome_produto ||
    (compra.produto_id ? `Produto ${compra.produto_id}` : 'Zouti')
  );
}

function mapCompraStatus(status) {
  const normalized = String(status || '').trim().toUpperCase();
  const normalizedKey = normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s-]+/g, '_');

  const statusMap = {
    PAID: 'COMPLETE',
    COMPLETO: 'COMPLETE',
    UNPAID: 'WAITING_PAYMENT',
    RECUSADO: 'CANCELLED',
    DECLINED: 'CANCELLED',
    DISPUTED: 'CHARGEBACK',
    CHARGEDBACK: 'CHARGEBACK',
    PAGO: 'APPROVED',
    PAGA: 'APPROVED',
    PAYMENT_APPROVED: 'APPROVED',
    PAGAMENTO_APROVADO: 'APPROVED',
    RECEIVED: 'APPROVED',
    RECEBIDO: 'APPROVED',
    CONFIRMED: 'APPROVED',
    CONFIRMADO: 'APPROVED',
    SUCCESS: 'APPROVED',
    SUCESSO: 'APPROVED',
    APPROVED: 'APPROVED',
    COMPLETE: 'COMPLETE',
    COMPLETED: 'COMPLETE',
    FINALIZED: 'COMPLETE',
    FINALIZADO: 'COMPLETE',
    FINALIZADA: 'COMPLETE',
    CONCLUIDO: 'COMPLETE',
    CONCLUIDA: 'COMPLETE',
    PENDING: 'WAITING_PAYMENT',
    PENDENTE: 'WAITING_PAYMENT',
    AWAITING_PAYMENT: 'WAITING_PAYMENT',
    AGUARDANDO_PAGAMENTO: 'WAITING_PAYMENT',
    BOLETO: 'PRINTED_BILLET',
    BILLET: 'PRINTED_BILLET',
    WAITING_PAYMENT: 'WAITING_PAYMENT',
    PROCESSING: 'UNDER_ANALYSIS',
    EM_ANALISE: 'UNDER_ANALYSIS',
    ANALISE: 'UNDER_ANALYSIS',
    UNDER_ANALYSIS: 'UNDER_ANALYSIS',
    CANCELLED: 'CANCELLED',
    CANCELED: 'CANCELLED',
    CANCELADO: 'CANCELLED',
    CANCELADA: 'CANCELLED',
    REFUNDED: 'REFUNDED',
    REFUND: 'REFUNDED',
    REEMBOLSADO: 'REFUNDED',
    REEMBOLSADA: 'REFUNDED',
    ESTORNADO: 'REFUNDED',
    ESTORNADA: 'REFUNDED',
    CHARGEBACK: 'CHARGEBACK',
    CHARGED_BACK: 'CHARGEBACK',
    EXPIRED: 'EXPIRED',
    EXPIRADO: 'EXPIRED',
    EXPIRADA: 'EXPIRED',
    OVERDUE: 'OVERDUE',
    ATRASADO: 'OVERDUE',
    ATRASADA: 'OVERDUE',
    STARTED: 'STARTED'
  };

  return statusMap[normalizedKey] || statusMap[normalized] || normalizedKey || 'STARTED';
}

function mapPaymentType(value) {
  const normalized = String(value || '').trim();
  return normalized ? normalized.toUpperCase().replace(/\s+/g, '_') : 'UNKNOWN';
}

function mapZoutiTransaction(row) {
  const compra = row.compras || {};
  const lead = compra.leads || {};
  const rawStatus = row.status || compra.status || '';
  let status = mapCompraStatus(rawStatus);
  const orderDate = row.data_transacao || compra.data_compra || row.criado_em || compra.criado_em || null;
  const buyerName = compra.nome_comprador || lead.nome || '—';
  const buyerEmail = compra.email_comprador || lead.email || '—';

  if (
    status === 'STARTED' &&
    row.confirmacao_pagamento &&
    Number(row.valor ?? compra.valor_brl ?? compra.valor_original ?? 0) > 0
  ) {
    status = 'COMPLETE';
  }

  const amount = Number(
    status === 'COMPLETE'
      ? (row.valor ?? compra.valor_brl ?? compra.valor_original ?? 0)
      : (compra.valor_brl ?? row.valor ?? compra.valor_original ?? 0)
  );

  return {
    canal: 'Zouti',
    buyer: {
      name: buyerName,
      email: buyerEmail
    },
    product: {
      name: extractProductName(compra)
    },
    purchase: {
      status,
      order_date: orderDate,
      approved_date: row.confirmacao_pagamento || null,
      price: {
        value: Number.isFinite(amount) ? amount : 0
      },
      payment: {
        type: mapPaymentType(compra.forma_pagamento)
      },
      hotmart_fee: {
        total: 0
      }
    },
    zouti: {
      compra_id: compra.id || row.compra_id || null,
      codigo_assinante: compra.codigo_assinante || null,
      codigo_transacao: row.codigo_transacao
    }
  };
}

async function fetchAllSales(periodo = 'Últimos 7 dias') {
  const supabase = getSupabaseClient();
  const { startMs, endMs } = getPeriodTimestamps(periodo);
  const startIso = new Date(startMs).toISOString();
  const endIso = new Date(endMs).toISOString();

  const { data, error } = await supabase
    .from('compra_transacoes')
    .select(`
      id,
      compra_id,
      codigo_transacao,
      status,
      data_transacao,
      confirmacao_pagamento,
      valor,
      criado_em,
      compras!inner (
        id,
        lead_id,
        produto_id,
        codigo_assinante,
        email_comprador,
        nome_comprador,
        valor_original,
        moeda_original,
        valor_brl,
        forma_pagamento,
        total_parcelas,
        status,
        sck,
        data_compra,
        raw_data,
        criado_em,
        leads (
          id,
          email,
          nome
        )
      )
    `)
    .ilike('codigo_transacao', 'ord\\_%')
    .gte('data_transacao', startIso)
    .lte('data_transacao', endIso)
    .order('data_transacao', { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar dados Zouti no Supabase: ${error.message}`);
  }

  const sales = (data || []).map(mapZoutiTransaction);
  return sales;
}

async function fetchDebugSummary(periodo = 'Últimos 7 dias') {
  const supabase = getSupabaseClient();
  const { startMs, endMs } = getPeriodTimestamps(periodo);
  const startIso = new Date(startMs).toISOString();
  const endIso = new Date(endMs).toISOString();

  const { data, error } = await supabase
    .from('compra_transacoes')
    .select(`
      id,
      compra_id,
      codigo_transacao,
      status,
      data_transacao,
      confirmacao_pagamento,
      valor,
      criado_em,
      compras!inner (
        id,
        status,
        valor_brl,
        valor_original
      )
    `)
    .ilike('codigo_transacao', 'ord\\_%')
    .gte('data_transacao', startIso)
    .lte('data_transacao', endIso)
    .order('data_transacao', { ascending: false });

  if (error) {
    throw new Error(`Erro ao gerar debug Zouti no Supabase: ${error.message}`);
  }

  const rawStatusCounts = {};
  const mappedStatusCounts = {};
  const mappedStatusTotals = {};

  for (const row of data || []) {
    const rawStatus = String(row.status || row.compras?.status || 'SEM_STATUS');
    rawStatusCounts[rawStatus] = (rawStatusCounts[rawStatus] || 0) + 1;

    const mapped = mapZoutiTransaction(row);
    const mappedStatus = mapped.purchase?.status || 'SEM_STATUS';
    const valor = Number(mapped.purchase?.price?.value || 0);

    mappedStatusCounts[mappedStatus] = (mappedStatusCounts[mappedStatus] || 0) + 1;
    mappedStatusTotals[mappedStatus] = Number(
      ((mappedStatusTotals[mappedStatus] || 0) + valor).toFixed(2)
    );
  }

  return {
    ok: true,
    periodo,
    intervalo: {
      startIso,
      endIso
    },
    totalRegistros: (data || []).length,
    rawStatusCounts,
    mappedStatusCounts,
    mappedStatusTotals
  };
}

module.exports = {
  fetchAllSales,
  fetchDebugSummary
};
