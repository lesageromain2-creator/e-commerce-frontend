/**
 * Échange session Better Auth (Google, etc.) → JWT backend
 * Appelé par le frontend quand l'utilisateur a une session Better Auth mais pas de token backend
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "../../lib/auth";

// Base URL backend - BACKEND_URL en priorité (server-side, pas exposé)
const BACKEND_BASE =
  (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
    /\/api\/?$/,
    ""
  ) || "http://localhost:5000";
const BETTER_AUTH_BACKEND_SECRET =
  process.env.BETTER_AUTH_BACKEND_SECRET || process.env.JWT_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Better Auth getSession requiert des headers (cookies) - API Better Auth
    const session = await auth.api.getSession({
      headers: req.headers as HeadersInit,
    });

    if (!session?.user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const { email, name } = session.user;
    if (!email) {
      return res.status(400).json({ error: "Email manquant" });
    }

    if (!BETTER_AUTH_BACKEND_SECRET) {
      console.error("BETTER_AUTH_BACKEND_SECRET ou JWT_SECRET manquant");
      return res.status(500).json({ error: "Configuration serveur manquante" });
    }

    const response = await fetch(`${BACKEND_BASE}/auth/issue-token-for-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: BETTER_AUTH_BACKEND_SECRET,
        email,
        name: name ?? undefined,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json(err);
    }

    const data = await response.json();
    return res.status(200).json({ token: data.token, user: data.user });
  } catch (error) {
    console.error("backend-token error:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
