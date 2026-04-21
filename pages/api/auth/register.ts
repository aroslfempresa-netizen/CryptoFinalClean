import type { NextApiRequest, NextApiResponse } from "next";
import { db, users, balances, wallets, userSettings } from "@/db";
import { eq } from "drizzle-orm";
import { hashPassword, generateToken, generateWalletAddress } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, name, token } = req.body;

    // Validate required fields
    if (!email || !password || !name || !token) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    // Validate registration token
    const validToken = process.env.REGISTRATION_TOKEN;
    if (token !== validToken) {
      return res.status(401).json({ error: "Token de registro inválido" });
    }

    // Check if email already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      return res.status(400).json({ error: "Este email já está cadastrado" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Formato de email inválido" });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
        status: "active",
        role: "user",
      })
      .returning();

    // Create balances (zero for new users)
    await db.insert(balances).values([
      { userId: newUser.id, currency: "USDT", balance: "0" },
      { userId: newUser.id, currency: "TRX", balance: "0" },
      { userId: newUser.id, currency: "BTC", balance: "0" },
    ]);

    // Generate and create wallets
    await db.insert(wallets).values([
      { userId: newUser.id, currency: "USDT", address: generateWalletAddress("USDT"), network: "TRC20" },
      { userId: newUser.id, currency: "TRX", address: generateWalletAddress("TRX"), network: "TRON" },
      { userId: newUser.id, currency: "BTC", address: generateWalletAddress("BTC"), network: "Bitcoin" },
    ]);

    // Create user settings
    await db.insert(userSettings).values({
      userId: newUser.id,
    });

    // Generate token
    const authToken = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      status: newUser.status,
      role: newUser.role,
    });

    res.setHeader("Set-Cookie", `token=${authToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`);

    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        status: newUser.status,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
