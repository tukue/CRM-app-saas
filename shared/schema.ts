import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  status: text("status").notNull().default("prospect"),
  value: decimal("value", { precision: 10, scale: 2 }).notNull().default("0"),
  lastContact: timestamp("last_contact").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const salesData = pgTable("sales_data", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull().default("0"),
  deals: integer("deals").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  name: true,
  email: true,
  status: true,
  value: true,
}).required();

export const insertSalesDataSchema = createInsertSchema(salesData).pick({
  month: true,
  revenue: true,
  deals: true,
}).required();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertSalesData = z.infer<typeof insertSalesDataSchema>;
export type SalesData = typeof salesData.$inferSelect;
