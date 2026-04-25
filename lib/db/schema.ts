import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("CLIENT"),
  taxId: varchar("tax_id", { length: 20 }),
  sistelId: integer("sistel_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("PENDING"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  sistelDealId: varchar("sistel_deal_id", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  sku: varchar("sku", { length: 100 }).notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  finalPrice: numeric("final_price", { precision: 12, scale: 2 }).notNull(),
});

export const productImages = pgTable("product_images", {
  sku: varchar("sku", { length: 100 }).primaryKey(),
  firebaseUrl: text("firebase_url").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

