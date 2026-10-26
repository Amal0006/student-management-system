
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: {
      code: 'LOGIN_RATE_LIMITED',
      message: 'Too many login attempts. Please try again later.',
    },
  },
});

router.post('/login', loginLimiter, async (req, res) => {
  res.set('Cache-Control', 'no-store');

  const username =
    typeof req.body?.username === 'string'
      ? req.body.username.trim()
      : '';

  const password =
    typeof req.body?.password === 'string'
      ? req.body.password
      : '';

  const configuredUsername = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.JWT_SECRET;

  if (!configuredUsername || !passwordHash || !secret) {
    return res.status(503).json({
      error: {
        code: 'AUTHENTICATION_UNAVAILABLE',
        message: 'Admin authentication is not configured on the server.',
      },
    });
  }

  if (!username || !password) {
    return res.status(400).json({
      error: {
        code: 'MISSING_CREDENTIALS',
        message: 'Enter your username and password.',
      },
    });
  }

  try {
    const usernameMatches = username === configuredUsername;
    const passwordMatches = await bcrypt.compare(password, passwordHash);

    if (!usernameMatches || !passwordMatches) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'The username or password is incorrect.',
        },
      });
    }

    const token = jwt.sign(
      {
        role: 'admin',
      },
      secret,
      {
        algorithm: 'HS256',
        subject: configuredUsername,
        expiresIn: '8h',
        issuer: 'campusdesk-api',
        audience: 'campusdesk-admin',
      }
    );

    return res.json({
      token,
      user: {
        username: configuredUsername,
        role: 'admin',
      },
      expiresIn: 28800,
    });
  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      error: {
        code: 'LOGIN_FAILED',
        message: 'Unable to complete login. Please try again.',
      },
    });
  }
});

export default router;
