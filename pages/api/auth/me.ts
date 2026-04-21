import type { NextApiRequest, NextApiResponse } from "next";
import { db, users, balances, wallets } from "@/db";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Token inválido" });
    }

    // Get user from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.id));

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    // Get balances
    const userBalances = await db
      .select()
      .from(balances)
      .where(eq(balances.userId, user.id));

    // Get wallets
    const userWallets = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, user.id));

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        emailNotifications: user.emailNotifications,
        smsNotifications: user.smsNotifications,
        loginNotifications: user.loginNotifications,
        createdAt: user.createdAt,
      },
      balances: userBalances.reduce((acc, b) => {
        acc[b.currency] = b.balance;
        return acc;
      }, {} as Record<string, string>),
      wallets: userWallets,
    });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
