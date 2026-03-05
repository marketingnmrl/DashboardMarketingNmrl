const { getAuthUser } = require('../../../lib/next-auth');

export default function handler(req, res) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({
      ok: false,
      error: 'Nao autenticado'
    });
  }

  return res.json({
    ok: true,
    user
  });
}
