import { Request, Response, NextFunction } from 'express';
import { $Enums } from '@prisma/client';
import session from 'express-session';

export interface AuthPayload {
  id: number;
  role: $Enums.Role;
  clienteId?: number | null;
}

declare module 'express-session' {
  interface SessionData {
    user?: AuthPayload;
  }
}

export interface AuthRequest extends Request {
  session: session.Session & Partial<session.SessionData>;
  user?: AuthPayload;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  req.user = req.session.user;
  next();
};
