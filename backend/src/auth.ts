import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { $Enums } from '@prisma/client';

const secret = process.env.JWT_SECRET || 'secret';

export interface AuthPayload {
  id: number;
  role: $Enums.Role;
  clienteId?: number | null;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const generateToken = (payload: AuthPayload) => {
  return jwt.sign(payload, secret, { expiresIn: '1d' });
};

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token required' });
  const [, token] = auth.split(' ');
  try {
    const decoded = jwt.verify(token, secret) as AuthPayload;
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
