const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getSupabaseClient } = require('./supabase');

const AUTH_COOKIE_NAME = 'dashboard_auth';

function getJwtSecret() {
  return process.env.AUTH_JWT_SECRET || process.env.SESSION_SECRET || '';
}

function getMissingAuthEnv() {
  const missing = [];
  if (!getJwtSecret()) missing.push('AUTH_JWT_SECRET');
  return missing;
}

async function findUserByEmail(email) {
  const supabase = getSupabaseClient();
  const normalizedEmail = String(email || '').trim().toLowerCase();

  const { data, error } = await supabase
    .from('app_users')
    .select('id, email, password_hash, full_name, role, is_active')
    .eq('email', normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao buscar usuario: ${error.message}`);
  }

  return data || null;
}

async function validateCredentials(email, password) {
  const user = await findUserByEmail(email);
  if (!user || !user.is_active) return null;

  const ok = await bcrypt.compare(String(password || ''), user.password_hash || '');
  if (!ok) return null;

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role || 'user'
  };
}

function signAuthToken(user) {
  const secret = getJwtSecret();
  if (!secret) {
    throw new Error('AUTH_JWT_SECRET nao configurado');
  }

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role
    },
    secret,
    {
      expiresIn: '12h'
    }
  );
}

function verifyAuthToken(token) {
  const secret = getJwtSecret();
  if (!secret) return null;

  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 12 * 60 * 60 * 1000,
    path: '/'
  });
}

function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
}

module.exports = {
  AUTH_COOKIE_NAME,
  clearAuthCookie,
  getMissingAuthEnv,
  setAuthCookie,
  signAuthToken,
  validateCredentials,
  verifyAuthToken
};
