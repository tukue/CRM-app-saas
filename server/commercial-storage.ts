import { 
  users, customers, organizations, leads, deals, activities, salesData,
  type User, type InsertUser, type Customer, type InsertCustomer, 
  type Organization, type InsertOrganization, type Lead, type InsertLead,
  type Deal, type InsertDeal, type Activity, type InsertActivity,
  type SalesData, type InsertSalesData
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface ICommercialStorage {
  // Organization management
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getOrganization(id: number): Promise<Organization | undefined>;
  updateOrganizationSubscription(id: number, plan: string, status: string): Promise<void>;
  
  // Enhanced user management with roles
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByOrganization(orgId: number): Promise<User[]>;
  updateUserRole(userId: number, role: string): Promise<void>;
  
  // Lead management
  getLeads(orgId: number): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  convertLeadToCustomer(leadId: number, customerData: InsertCustomer): Promise<Customer>;
  
  // Enhanced customer management
  getCustomers(orgId: number): Promise<Customer[]>;
  getCustomer(id: number, orgId: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  
  // Deal/Opportunity management
  getDeals(orgId: number): Promise<Deal[]>;
  getDealsByStage(orgId: number, stage: string): Promise<Deal[]>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: number, deal: Partial<InsertDeal>): Promise<Deal | undefined>;
  
  // Activity management
  getActivities(orgId: number): Promise<Activity[]>;
  getActivitiesByEntity(entityType: 'customer' | 'lead' | 'deal', entityId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  
  // Analytics and reporting
  getSalesData(orgId: number): Promise<SalesData[]>;
  getDashboardMetrics(orgId: number): Promise<{
    totalRevenue: number;
    totalDeals: number;
    totalCustomers: number;
    totalLeads: number;
    conversionRate: number;
    avgDealValue: number;
  }>;
}

export class DatabaseCommercialStorage implements ICommercialStorage {
  // Organization management
  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    const [org] = await db.insert(organizations).values(insertOrg).returning();
    return org;
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org || undefined;
  }

  async updateOrganizationSubscription(id: number, plan: string, status: string): Promise<void> {
    await db.update(organizations)
      .set({ 
        subscriptionPlan: plan, 
        subscriptionStatus: status,
        updatedAt: new Date()
      })
      .where(eq(organizations.id, id));
  }

  // Enhanced user management
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUsersByOrganization(orgId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.organizationId, orgId));
  }

  async updateUserRole(userId: number, role: string): Promise<void> {
    await db.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Lead management
  async getLeads(orgId: number): Promise<Lead[]> {
    return await db.select().from(leads)
      .where(eq(leads.organizationId, orgId))
      .orderBy(desc(leads.createdAt));
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async updateLead(id: number, leadData: Partial<InsertLead>): Promise<Lead | undefined> {
    const [lead] = await db.update(leads)
      .set({ ...leadData, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead || undefined;
  }

  async convertLeadToCustomer(leadId: number, customerData: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers)
      .values({ ...customerData, convertedFromLead: leadId })
      .returning();
    
    // Update lead status to converted
    await this.updateLead(leadId, { status: 'converted' });
    
    return customer;
  }

  // Enhanced customer management
  async getCustomers(orgId: number): Promise<Customer[]> {
    return await db.select().from(customers)
      .where(eq(customers.organizationId, orgId))
      .orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number, orgId: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers)
      .where(and(eq(customers.id, id), eq(customers.organizationId, orgId)));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    return customer;
  }

  async updateCustomer(id: number, customerData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await db.update(customers)
      .set({ ...customerData, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return customer || undefined;
  }

  // Deal management
  async getDeals(orgId: number): Promise<Deal[]> {
    return await db.select().from(deals)
      .where(eq(deals.organizationId, orgId))
      .orderBy(desc(deals.createdAt));
  }

  async getDealsByStage(orgId: number, stage: string): Promise<Deal[]> {
    return await db.select().from(deals)
      .where(and(eq(deals.organizationId, orgId), eq(deals.stage, stage)))
      .orderBy(desc(deals.createdAt));
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const [deal] = await db.insert(deals).values(insertDeal).returning();
    return deal;
  }

  async updateDeal(id: number, dealData: Partial<InsertDeal>): Promise<Deal | undefined> {
    const [deal] = await db.update(deals)
      .set({ ...dealData, updatedAt: new Date() })
      .where(eq(deals.id, id))
      .returning();
    return deal || undefined;
  }

  // Activity management
  async getActivities(orgId: number): Promise<Activity[]> {
    return await db.select().from(activities)
      .where(eq(activities.organizationId, orgId))
      .orderBy(desc(activities.createdAt));
  }

  async getActivitiesByEntity(entityType: 'customer' | 'lead' | 'deal', entityId: number): Promise<Activity[]> {
    let condition;
    switch (entityType) {
      case 'customer':
        condition = eq(activities.customerId, entityId);
        break;
      case 'lead':
        condition = eq(activities.leadId, entityId);
        break;
      case 'deal':
        condition = eq(activities.dealId, entityId);
        break;
    }
    
    return await db.select().from(activities)
      .where(condition)
      .orderBy(desc(activities.createdAt));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  async updateActivity(id: number, activityData: Partial<InsertActivity>): Promise<Activity | undefined> {
    const [activity] = await db.update(activities)
      .set({ ...activityData, updatedAt: new Date() })
      .where(eq(activities.id, id))
      .returning();
    return activity || undefined;
  }

  // Analytics and reporting
  async getSalesData(orgId: number): Promise<SalesData[]> {
    return await db.select().from(salesData)
      .where(eq(salesData.organizationId, orgId))
      .orderBy(desc(salesData.createdAt));
  }

  async getDashboardMetrics(orgId: number): Promise<{
    totalRevenue: number;
    totalDeals: number;
    totalCustomers: number;
    totalLeads: number;
    conversionRate: number;
    avgDealValue: number;
  }> {
    // Get total revenue
    const revenueResult = await db.select({
      total: sql<number>`COALESCE(SUM(${salesData.revenue}), 0)`
    }).from(salesData).where(eq(salesData.organizationId, orgId));
    
    // Get total deals
    const dealsResult = await db.select({
      total: sql<number>`COUNT(*)`
    }).from(deals).where(eq(deals.organizationId, orgId));
    
    // Get total customers
    const customersResult = await db.select({
      total: sql<number>`COUNT(*)`
    }).from(customers).where(eq(customers.organizationId, orgId));
    
    // Get total leads
    const leadsResult = await db.select({
      total: sql<number>`COUNT(*)`
    }).from(leads).where(eq(leads.organizationId, orgId));
    
    // Get converted leads for conversion rate
    const convertedLeadsResult = await db.select({
      total: sql<number>`COUNT(*)`
    }).from(leads).where(and(eq(leads.organizationId, orgId), eq(leads.status, 'converted')));
    
    // Get average deal value
    const avgDealResult = await db.select({
      avg: sql<number>`COALESCE(AVG(${deals.value}), 0)`
    }).from(deals).where(eq(deals.organizationId, orgId));
    
    const totalRevenue = Number(revenueResult[0]?.total || 0);
    const totalDeals = Number(dealsResult[0]?.total || 0);
    const totalCustomers = Number(customersResult[0]?.total || 0);
    const totalLeads = Number(leadsResult[0]?.total || 0);
    const convertedLeads = Number(convertedLeadsResult[0]?.total || 0);
    const avgDealValue = Number(avgDealResult[0]?.avg || 0);
    
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    
    return {
      totalRevenue,
      totalDeals,
      totalCustomers,
      totalLeads,
      conversionRate,
      avgDealValue
    };
  }
}

export const commercialStorage = new DatabaseCommercialStorage();