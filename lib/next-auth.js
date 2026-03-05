const { AUTH_COOKIE_NAME, verifyAuthToken } = require('../services/auth');

const COOKIE_MAX_AGE_SECONDS = 12 * 60 * 60;

function getTokenFromRequest(req) {
  if (req?.cookies?.[AUTH_COOKIE_NAME]) {
    return req.cookies[AUTH_COOKIE_NAME];
  }

  const cookieHeader = req?.headers?.cookie || '';
  const cookies = cookieHeader.split(';').map(part => part.trim());
  const tokenCookie = cookies.find(part => part.startsWith(`${AUTH_COOKIE_NAME}=`));
  if (!tokenCookie) {
    return null;
  }

  return decodeURIComponent(tokenCookie.substring(AUTH_COOKIE_NAME.length + 1));
}

function getAuthUser(req) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

function setAuthCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE_SECONDS}${secure}`
  );
}

function clearAuthCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  );
}

module.exports = {
  clearAuthCookie,
  getAuthUser,
  setAuthCookie
};
