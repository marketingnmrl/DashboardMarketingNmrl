const { clearAuthCookie } = require('../../../lib/next-auth');

export default function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Metodo nao permitido' });
  }

  clearAuthCookie(res);
  return res.redirect(302, '/login');
}
