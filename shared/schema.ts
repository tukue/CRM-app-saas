import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Organizations for multi-tenancy
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  domain: text("domain"),
  settings: jsonb("settings").default({}),
  subscriptionStatus: text("subscription_status").notNull().default("trial"),
  subscriptionPlan: text("subscription_plan").notNull().default("starter"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced users with organization and roles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("user"), // admin, manager, sales_rep, user
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leads (prospects before conversion)
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  jobTitle: text("job_title"),
  source: text("source"), // website, referral, advertisement
  status: text("status").notNull().default("new"), // new, contacted, qualified, converted, lost
  score: integer("score").default(0),
  notes: text("notes"),
  assignedTo: integer("assigned_to").references(() => users.id),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  company: text("company"),
  jobTitle: text("job_title"),
  status: text("status").notNull().default("prospect"),
  value: decimal("value", { precision: 10, scale: 2 }).notNull().default("0"),
  lastContact: timestamp("last_contact").defaultNow(),
  assignedTo: integer("assigned_to").references(() => users.id),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  convertedFromLead: integer("converted_from_lead").references(() => leads.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Deals/Opportunities
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  stage: text("stage").notNull().default("prospecting"), // prospecting, qualification, proposal, negotiation, closed_won, closed_lost
  probability: integer("probability").default(50), // 0-100
  expectedCloseDate: timestamp("expected_close_date"),
  actualCloseDate: timestamp("actual_close_date"),
  customerId: integer("customer_id").references(() => customers.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activities (calls, emails, meetings, tasks)
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // call, email, meeting, task, note
  subject: text("subject").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, completed, cancelled
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  customerId: integer("customer_id").references(() => customers.id),
  leadId: integer("lead_id").references(() => leads.id),
  dealId: integer("deal_id").references(() => deals.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced sales data
export const salesData = pgTable("sales_data", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull().default("0"),
  deals: integer("deals").notNull().default(0),
  newCustomers: integer("new_customers").default(0),
  dealId: integer("deal_id").references(() => deals.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  customers: many(customers),
  leads: many(leads),
  deals: many(deals),
  activities: many(activities),
  salesData: many(salesData),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  assignedLeads: many(leads),
  assignedCustomers: many(customers),
  assignedDeals: many(deals),
  assignedActivities: many(activities),
  createdActivities: many(activities),
  salesData: many(salesData),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [leads.organizationId],
    references: [organizations.id],
  }),
  assignedUser: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
  }),
  activities: many(activities),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [customers.organizationId],
    references: [organizations.id],
  }),
  assignedUser: one(users, {
    fields: [customers.assignedTo],
    references: [users.id],
  }),
  convertedFromLead: one(leads, {
    fields: [customers.convertedFromLead],
    references: [leads.id],
  }),
  deals: many(deals),
  activities: many(activities),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [deals.organizationId],
    references: [organizations.id],
  }),
  customer: one(customers, {
    fields: [deals.customerId],
    references: [customers.id],
  }),
  assignedUser: one(users, {
    fields: [deals.assignedTo],
    references: [users.id],
  }),
  activities: many(activities),
  salesData: many(salesData),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  organization: one(organizations, {
    fields: [activities.organizationId],
    references: [organizations.id],
  }),
  customer: one(customers, {
    fields: [activities.customerId],
    references: [customers.id],
  }),
  lead: one(leads, {
    fields: [activities.leadId],
    references: [leads.id],
  }),
  deal: one(deals, {
    fields: [activities.dealId],
    references: [deals.id],
  }),
  assignedUser: one(users, {
    fields: [activities.assignedTo],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [activities.createdBy],
    references: [users.id],
  }),
}));

export const salesDataRelations = relations(salesData, ({ one }) => ({
  organization: one(organizations, {
    fields: [salesData.organizationId],
    references: [organizations.id],
  }),
  deal: one(deals, {
    fields: [salesData.dealId],
    references: [deals.id],
  }),
  assignedUser: one(users, {
    fields: [salesData.assignedTo],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).pick({
  name: true,
  slug: true,
  domain: true,
  subscriptionPlan: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
  organizationId: true,
});

export const insertLeadSchema = createInsertSchema(leads).pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  company: true,
  jobTitle: true,
  source: true,
  status: true,
  score: true,
  notes: true,
  assignedTo: true,
  organizationId: true,
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  company: true,
  jobTitle: true,
  status: true,
  value: true,
  assignedTo: true,
  organizationId: true,
  convertedFromLead: true,
});

export const insertDealSchema = createInsertSchema(deals).pick({
  title: true,
  description: true,
  value: true,
  stage: true,
  probability: true,
  expectedCloseDate: true,
  customerId: true,
  assignedTo: true,
  organizationId: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  type: true,
  subject: true,
  description: true,
  status: true,
  dueDate: true,
  customerId: true,
  leadId: true,
  dealId: true,
  assignedTo: true,
  createdBy: true,
  organizationId: true,
});

export const insertSalesDataSchema = createInsertSchema(salesData).pick({
  month: true,
  year: true,
  revenue: true,
  deals: true,
  newCustomers: true,
  dealId: true,
  assignedTo: true,
  organizationId: true,
});

// Types
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertSalesData = z.infer<typeof insertSalesDataSchema>;
export type SalesData = typeof salesData.$inferSelect;
