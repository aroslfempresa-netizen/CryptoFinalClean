import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "brazacripto_super_secret_key_2026";

export interface UserPayload {
  id: number;
  email: string;
  name: string;
  status: string;
  role: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

// Verify JWT token
export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

// Get user from token string (Pages Router compatible)
export function getUserFromCookie(token?: string): UserPayload | null {
  if (!token) return null;
  return verifyToken(token);
}

// Generate random wallet address
export function generateWalletAddress(currency: string): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let address = "";
  
  if (currency === "BTC") {
    address = "bc1";
    for (let i = 0; i < 42; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } else if (currency === "USDT" || currency === "TRX") {
    address = "T";
    for (let i = 0; i < 33; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return address;
}

// Generate transaction hash
export function generateTxHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

// Generate unique transaction ID
export function generateTransactionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}