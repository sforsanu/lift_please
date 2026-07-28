import jwt from 'jsonwebtoken';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'lift_session';

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  return jwt.sign(
    {
      sub: user.id || user._id.toString(),
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

export function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  return jwt.verify(token, process.env.JWT_SECRET);
}

export function setSessionCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAgeDays = Number(process.env.SESSION_COOKIE_MAX_AGE_DAYS || 7);

  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: maxAgeDays * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
}
