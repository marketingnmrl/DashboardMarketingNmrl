const {
  getMissingAuthEnv,
  signAuthToken,
  validateCredentials
} = require('../../../services/auth');
const { setAuthCookie } = require('../../../lib/next-auth');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Metodo nao permitido' });
  }

  try {
    const missing = getMissingAuthEnv();
    if (missing.length > 0) {
      return res.redirect(302, '/login?config_error=1');
    }

    const { email, password } = req.body || {};
    const user = await validateCredentials(email, password);
    if (!user) {
      return res.redirect(302, '/login?error=1');
    }

    const token = signAuthToken(user);
    setAuthCookie(res, token);
    return res.redirect(302, '/');
  } catch (error) {
    console.error('Login error:', error.message);
    return res.redirect(302, '/login?error=1');
  }
}
