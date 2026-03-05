const { AUTH_COOKIE_NAME, verifyAuthToken } = require('../services/auth');

function getAuthenticatedUser(req) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) return null;
  return verifyAuthToken(token);
}

function requireWebAuth(req, res, next) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.redirect('/login');
  }

  req.authUser = user;
  next();
}

function requireApiAuth(req, res, next) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({
      ok: false,
      error: 'Nao autenticado'
    });
  }

  req.authUser = user;
  next();
}

module.exports = {
  requireApiAuth,
  requireWebAuth
};
