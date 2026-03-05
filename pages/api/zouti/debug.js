const zouti = require('../../../services/zouti');
const { getAuthUser } = require('../../../lib/next-auth');

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
    const result = await zouti.fetchDebugSummary(periodo);
    return res.json(result);
  } catch (error) {
    console.error('Zouti debug error:', error.message);
    return res.status(500).json({
      ok: false,
      error: 'Erro ao gerar debug da Zouti'
    });
  }
}
