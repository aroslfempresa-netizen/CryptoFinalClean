import type { NextApiRequest, NextApiResponse } from "next";
import { db, users, balances, transactions } from "@/db";
import { eq, and } from "drizzle-orm";
import { verifyToken, generateTxHash, generateTransactionId } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
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

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.id));

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    // Check if account is blocked
    if (user.status === "blocked" || user.status === "analysis") {
      return res.status(403).json({ error: "Conta bloqueada para depósitos" });
    }

    const { currency, amount } = req.body;

    if (!currency || !amount) {
      return res.status(400).json({ error: "Moeda e valor são obrigatórios" });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: "Valor inválido" });
    }

    // Get current balance
    const [currentBalance] = await db
      .select()
      .from(balances)
      .where(and(eq(balances.userId, user.id), eq(balances.currency, currency)));

    if (!currentBalance) {
      return res.status(400).json({ error: "Moeda não suportada" });
    }

    // Update balance
    const newBalance = parseFloat(currentBalance.balance) + numAmount;
    await db
      .update(balances)
      .set({ balance: newBalance.toString(), updatedAt: new Date() })
      .where(and(eq(balances.userId, user.id), eq(balances.currency, currency)));

    // Create transaction record
    const [transaction] = await db
      .insert(transactions)
      .values({
        userId: user.id,
        type: "deposit",
        currency,
        amount: numAmount.toString(),
        status: "confirmed",
        txHash: generateTxHash(),
        toAddress: "wallet_address",
      })
      .returning();

    return res.status(200).json({
      success: true,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        currency: transaction.currency,
        amount: transaction.amount,
        status: transaction.status,
        txHash: transaction.txHash,
        createdAt: transaction.createdAt,
      },
      newBalance: newBalance.toString(),
    });
  } catch (error) {
    console.error("Deposit error:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
