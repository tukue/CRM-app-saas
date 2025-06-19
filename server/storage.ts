import { users, customers, salesData, type User, type InsertUser, type Customer, type InsertCustomer, type SalesData, type InsertSalesData } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  
  getSalesData(): Promise<SalesData[]>;
  createSalesData(data: InsertSalesData): Promise<SalesData>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private customers: Map<number, Customer>;
  private salesDataMap: Map<number, SalesData>;
  private currentUserId: number;
  private currentCustomerId: number;
  private currentSalesId: number;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.salesDataMap = new Map();
    this.currentUserId = 1;
    this.currentCustomerId = 1;
    this.currentSalesId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample customers
    const sampleCustomers = [
      { name: 'Acme Corp', email: 'contact@acme.com', status: 'active', value: '15000' },
      { name: 'TechStart Inc', email: 'hello@techstart.com', status: 'prospect', value: '8500' },
      { name: 'Global Solutions', email: 'info@global.com', status: 'active', value: '22000' },
      { name: 'Digital Agency', email: 'team@digital.com', status: 'negotiation', value: '12300' }
    ];

    sampleCustomers.forEach(customerData => {
      const id = this.currentCustomerId++;
      const customer: Customer = {
        id,
        name: customerData.name,
        email: customerData.email,
        status: customerData.status,
        value: customerData.value,
        lastContact: new Date(),
        createdAt: new Date()
      };
      this.customers.set(id, customer);
    });

    // Sample sales data
    const sampleSalesData = [
      { month: 'Jan', revenue: '12000', deals: 24 },
      { month: 'Feb', revenue: '15000', deals: 31 },
      { month: 'Mar', revenue: '18000', deals: 28 },
      { month: 'Apr', revenue: '22000', deals: 35 },
      { month: 'May', revenue: '25000', deals: 42 },
      { month: 'Jun', revenue: '28000', deals: 38 }
    ];

    sampleSalesData.forEach(salesItem => {
      const id = this.currentSalesId++;
      const sales: SalesData = {
        id,
        month: salesItem.month,
        revenue: salesItem.revenue,
        deals: salesItem.deals,
        createdAt: new Date()
      };
      this.salesDataMap.set(id, sales);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customer: Customer = {
      id,
      name: insertCustomer.name,
      email: insertCustomer.email,
      status: insertCustomer.status,
      value: insertCustomer.value,
      lastContact: new Date(),
      createdAt: new Date()
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer: Customer = {
      ...customer,
      ...updateData,
      lastContact: new Date()
    };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async getSalesData(): Promise<SalesData[]> {
    return Array.from(this.salesDataMap.values());
  }

  async createSalesData(insertSalesData: InsertSalesData): Promise<SalesData> {
    const id = this.currentSalesId++;
    const salesData: SalesData = {
      id,
      month: insertSalesData.month,
      revenue: insertSalesData.revenue,
      deals: insertSalesData.deals,
      createdAt: new Date()
    };
    this.salesDataMap.set(id, salesData);
    return salesData;
  }
}

export const storage = new MemStorage();
