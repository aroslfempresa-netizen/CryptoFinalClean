import type { NextApiRequest, NextApiResponse } from "next";
import { db, users, balances, transactions } from "@/db";
import { eq, and } from "drizzle-orm";
import { verifyToken, generateTxHash } from "@/lib/auth";

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
      return res.status(403).json({ error: "Conta bloqueada para saques" });
    }

    const { currency, amount, address, network } = req.body;

    if (!currency || !amount || !address || !network) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
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

    const balanceNum = parseFloat(currentBalance.balance);
    if (balanceNum < numAmount) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    // Calculate fee (1%)
    const fee = numAmount * 0.01;
    const totalAmount = numAmount + fee;

    if (balanceNum < totalAmount) {
      return res.status(400).json({ error: "Saldo insuficiente (incluindo taxa)" });
    }

    // Update balance
    const newBalance = balanceNum - totalAmount;
    await db
      .update(balances)
      .set({ balance: newBalance.toString(), updatedAt: new Date() })
      .where(and(eq(balances.userId, user.id), eq(balances.currency, currency)));

    // Create transaction record (pending)
    const [transaction] = await db
      .insert(transactions)
      .values({
        userId: user.id,
        type: "withdraw",
        currency,
        amount: numAmount.toString(),
        fee: fee.toString(),
        status: "pending",
        toAddress: address,
        network,
        txHash: generateTxHash(),
      })
      .returning();

    // Schedule status update to confirmed after 2 minutes
    setTimeout(async () => {
      try {
        await db
          .update(transactions)
          .set({ status: "confirmed", updatedAt: new Date() })
          .where(eq(transactions.id, transaction.id));
      } catch (err) {
        console.error("Error updating transaction status:", err);
      }
    }, 2 * 60 * 1000); // 2 minutes

    return res.status(200).json({
      success: true,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        currency: transaction.currency,
        amount: transaction.amount,
        fee: transaction.fee,
        status: transaction.status,
        toAddress: transaction.toAddress,
        txHash: transaction.txHash,
        createdAt: transaction.createdAt,
      },
      newBalance: newBalance.toString(),
    });
  } catch (error) {
    console.error("Withdraw error:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
