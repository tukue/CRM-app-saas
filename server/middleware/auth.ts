import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    // In a real app, you'd verify JWT token here
    // For now, we'll use a simple user lookup
    const userId = parseInt(token);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(403).json({ error: "Invalid token" });
    }

    req.user = { id: user.id, username: user.username };
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};