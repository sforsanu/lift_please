import { User } from '../models/User.js';
import { getSessionCookieName, verifyToken } from '../utils/auth.js';
import { httpError } from '../utils/httpError.js';

function getBearerToken(req) {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

export async function authenticate(req, _res, next) {
  try {
    const token = req.cookies?.[getSessionCookieName()] || getBearerToken(req);

    if (!token) {
      throw httpError(401, 'Authentication required');
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      throw httpError(401, 'Invalid session');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : httpError(401, 'Invalid session'));
  }
}
