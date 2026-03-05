const express = require('express');
const router = express.Router();
const {
  clearAuthCookie,
  getMissingAuthEnv,
  setAuthCookie,
  signAuthToken,
  validateCredentials,
  verifyAuthToken
} = require('../services/auth');
const { requireApiAuth } = require('../middleware/auth');

router.get('/login', (req, res) => {
  const token = req.cookies?.dashboard_auth;
  if (token && verifyAuthToken(token)) {
    return res.redirect('/');
  }

  const error = req.query.error ? 'E-mail ou senha invalidos.' : null;
  const configError = req.query.config_error ? 'Configuracao de autenticacao ausente.' : null;
  res.render('login', { error, configError });
});

router.post('/auth/login', async (req, res) => {
  try {
    const missing = getMissingAuthEnv();
    if (missing.length > 0) {
      return res.redirect('/login?config_error=1');
    }

    const { email, password } = req.body || {};
    const user = await validateCredentials(email, password);
    if (!user) {
      return res.redirect('/login?error=1');
    }

    const token = signAuthToken(user);
    setAuthCookie(res, token);
    return res.redirect('/');
  } catch (error) {
    console.error('Login error:', error.message);
    return res.redirect('/login?error=1');
  }
});

router.post('/auth/logout', (req, res) => {
  clearAuthCookie(res);
  res.redirect('/login');
});

router.get('/auth/me', requireApiAuth, (req, res) => {
  res.json({
    ok: true,
    user: req.authUser
  });
});

router.get('/logout', (req, res) => {
  clearAuthCookie(res);
  res.redirect('/login');
});

module.exports = router;
