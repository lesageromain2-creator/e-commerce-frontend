/**
 * Better Auth - Route API catch-all
 * DÉSACTIVÉ - Le projet utilise JWT pour l'authentification
 */
import type { NextApiRequest, NextApiResponse } from "next";

export default async function authHandler(req: NextApiRequest, res: NextApiResponse) {
  // Renvoyer une réponse vide pour les appels Better Auth (désactivé)
  return res.status(200).json({ 
    session: null,
    user: null 
  });
}
