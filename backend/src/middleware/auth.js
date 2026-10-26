
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Please log in to access this resource.',
      },
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(503).json({
      error: {
        code: 'AUTHENTICATION_UNAVAILABLE',
        message: 'Authentication is not configured on the server.',
      },
    });
  }

  try {
    const payload = jwt.verify(token, secret, {
  algorithms: ['HS256'],
  issuer: 'campusdesk-api',
  audience: 'campusdesk-admin',
});

    if (payload.role !== 'admin' || typeof payload.sub !== 'string') {
      return res.status(403).json({
        error: {
          code: 'ACCESS_DENIED',
          message: 'You do not have permission to access this resource.',
        },
      });
    }

    req.user = {
      username: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({
      error: {
        code: 'INVALID_OR_EXPIRED_TOKEN',
        message: 'Your session is invalid or expired. Please log in again.',
      },
    });
  }
}
