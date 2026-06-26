import { getAuth } from 'firebase-admin/auth'
import type { NextFunction, Request, Response } from 'express'

export type AuthenticatedRequest = Request & { uid: string }

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.headers.authorization?.match(/^Bearer\s+(\S+)$/i)?.[1]

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const decoded = await getAuth().verifyIdToken(token)
    ;(req as AuthenticatedRequest).uid = decoded.uid
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
