/**
 * Échange session Better Auth (Google, etc.) → JWT backend
 * DÉSACTIVÉ TEMPORAIREMENT - Better Auth non configuré
 * Le projet utilise directement l'authentification JWT backend
 */
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Better Auth désactivé - cette route n'est plus nécessaire avec JWT uniquement
  return res.status(501).json({ 
    error: "Better Auth not configured",
    message: "Cette route nécessite Better Auth. Le projet utilise actuellement l'authentification JWT backend."
  });
}
