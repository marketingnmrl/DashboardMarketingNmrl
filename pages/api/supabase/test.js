const supabase = require('../../../services/supabase');
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
    const result = await supabase.testSupabaseConnection();
    if (!result.ok) {
      return res.status(500).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Supabase test error:', error.message);
    return res.status(500).json({
      ok: false,
      error: 'Erro ao testar conexao com Supabase'
    });
  }
}
