const hotmart = require('../../services/hotmart');
const zouti = require('../../services/zouti');
const { getAuthUser } = require('../../lib/next-auth');

function buildDashboardResponse(sales) {
  const kpis = hotmart.computeKpis(sales);
  const daily = hotmart.computeDailyData(sales);
  const pipeline = hotmart.computePipeline(sales);
  const leads = hotmart.extractLeadsList(sales);

  const cancelled = sales.filter(s => ['CANCELLED', 'REFUNDED'].includes(s.purchase?.status)).length;
  const pending = sales.filter(s =>
    ['STARTED', 'WAITING_PAYMENT', 'PRINTED_BILLET', 'DELAYED', 'OVERDUE'].includes(s.purchase?.status)
  ).length;

  const products = {};
  for (const sale of sales) {
    const pname = sale.product?.name || 'Sem nome';
    const valor = sale.purchase?.price?.value || 0;
    const status = sale.purchase?.status || '';

    if (!products[pname]) {
      products[pname] = { transacoes: 0, vendas: 0, faturamento: 0 };
    }

    products[pname].transacoes++;
    if (status === 'COMPLETE' || status === 'APPROVED') {
      products[pname].vendas++;
      products[pname].faturamento += valor;
    }
  }

  const recoveryStatuses = new Set([
    'CANCELLED', 'REFUNDED', 'STARTED', 'WAITING_PAYMENT',
    'PRINTED_BILLET', 'DELAYED', 'OVERDUE', 'EXPIRED', 'NO_FUNDS', 'PROTEST'
  ]);

  const recoveryLeads = hotmart.extractLeadsList(
    sales.filter(s => recoveryStatuses.has(s.purchase?.status))
  );

  return {
    kpis,
    daily,
    pipeline,
    leads,
    products,
    cancelled,
    pending,
    recoveryLeads
  };
}

export default async function handler(req, res) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({
      ok: false,
      error: 'Nao autenticado'
    });
  }

  try {
    const periodo = req.query.periodo || 'Ultimos 7 dias';
    const canal = req.query.canal || 'Todos';

    let sales = [];

    if (canal === 'Hotmart') {
      sales = await hotmart.fetchAllSales(periodo);
    } else if (canal === 'Zouti') {
      sales = await zouti.fetchAllSales(periodo);
    } else {
      const [hotmartSales, zoutiSales] = await Promise.all([
        hotmart.fetchAllSales(periodo),
        zouti.fetchAllSales(periodo)
      ]);
      sales = [...hotmartSales, ...zoutiSales];
    }

    return res.json(buildDashboardResponse(sales));
  } catch (error) {
    console.error('API error:', error.message);
    return res.status(500).json({ error: 'Erro ao buscar dados' });
  }
}
