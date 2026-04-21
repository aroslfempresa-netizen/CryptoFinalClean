import type { NextApiRequest, NextApiResponse } from "next";
import { db, users, balances, wallets } from "@/db";
import { eq } from "drizzle-orm";
import { comparePassword, generateToken, hashPassword } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    // Check if master account
    const masterEmail = process.env.MASTER_EMAIL;
    const masterPassword = process.env.MASTER_PASSWORD;

    if (email === masterEmail && password === masterPassword) {
      // Check if master exists in DB
      let [masterUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!masterUser) {
        // Create master user
        const hashedPassword = await hashPassword(password);
        [masterUser] = await db
          .insert(users)
          .values({
            email,
            password: hashedPassword,
            name: "Master Admin",
            status: "active",
            role: "master",
          })
          .returning();

        // Create balances for master
        await db.insert(balances).values([
          { userId: masterUser.id, currency: "USDT", balance: "1000000" },
          { userId: masterUser.id, currency: "TRX", balance: "500000" },
          { userId: masterUser.id, currency: "BTC", balance: "10" },
        ]);

        // Create wallets for master
        await db.insert(wallets).values([
          { userId: masterUser.id, currency: "USDT", address: "TLawgrKkiT3z4Z6993KLoLCQRhrxMvyNrP", network: "TRC20" },
          { userId: masterUser.id, currency: "TRX", address: "TLawgrKkiT3z4Z6993KLoLCQRhrxMvyNrP", network: "TRON" },
          { userId: masterUser.id, currency: "BTC", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", network: "Bitcoin" },
        ]);
      }

      const token = generateToken({
        id: masterUser.id,
        email: masterUser.email,
        name: masterUser.name,
        status: masterUser.status,
        role: masterUser.role,
      });

      res.setHeader("Set-Cookie", `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`);

      return res.status(200).json({
        success: true,
        user: {
          id: masterUser.id,
          email: masterUser.email,
          name: masterUser.name,
          status: masterUser.status,
          role: masterUser.role,
        },
      });
    }

    // Regular user login
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      role: user.role,
    });

    res.setHeader("Set-Cookie", `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`);

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
