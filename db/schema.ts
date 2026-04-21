import { pgTable, serial, varchar, boolean, timestamp, decimal, json, integer } from "drizzle-orm/pg-core";

// Tabela de Usuários
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, blocked, analysis
  role: varchar("role", { length: 50 }).notNull().default("user"), // user, master
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  loginNotifications: boolean("login_notifications").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Saldos
export const balances = pgTable("balances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  currency: varchar("currency", { length: 10 }).notNull(), // BTC, USDT, TRX
  balance: decimal("balance", { precision: 18, scale: 8 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Endereços de Carteira
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  currency: varchar("currency", { length: 10 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  network: varchar("network", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de Transações/Histórico
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // deposit, withdraw, transfer
  currency: varchar("currency", { length: 10 }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  fee: decimal("fee", { precision: 18, scale: 8 }).default("0"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, confirmed, rejected
  fromAddress: varchar("from_address", { length: 255 }),
  toAddress: varchar("to_address", { length: 255 }),
  txHash: varchar("tx_hash", { length: 255 }),
  network: varchar("network", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Configurações do Usuário
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  theme: varchar("theme", { length: 20 }).default("dark"),
  language: varchar("language", { length: 10 }).default("pt-BR"),
  currency: varchar("currency", { length: 10 }).default("BRL"),
  animationsEnabled: boolean("animations_enabled").default(true),
  dailyLimit: decimal("daily_limit", { precision: 18, scale: 2 }).default("50000"),
  monthlyLimit: decimal("monthly_limit", { precision: 18, scale: 2 }).default("500000"),
  accountLevel: integer("account_level").default(1),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de Documentos de Verificação
export const verificationDocuments = pgTable("verification_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  documentType: varchar("document_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});
