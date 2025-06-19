import { MemStorage } from '../storage';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('MemStorage', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('User operations', () => {
    it('should create a user', async () => {
      const userData = { username: 'testuser', password: 'password123' };
      const user = await storage.createUser(userData);

      expect(user).toMatchObject(userData);
      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe('number');
    });

    it('should get user by id', async () => {
      const userData = { username: 'testuser', password: 'password123' };
      const createdUser = await storage.createUser(userData);
      
      const retrievedUser = await storage.getUser(createdUser.id);
      
      expect(retrievedUser).toEqual(createdUser);
    });

    it('should get user by username', async () => {
      const userData = { username: 'testuser', password: 'password123' };
      const createdUser = await storage.createUser(userData);
      
      const retrievedUser = await storage.getUserByUsername('testuser');
      
      expect(retrievedUser).toEqual(createdUser);
    });

    it('should return undefined for non-existent user', async () => {
      const user = await storage.getUser(999);
      expect(user).toBeUndefined();
    });

    it('should return undefined for non-existent username', async () => {
      const user = await storage.getUserByUsername('nonexistent');
      expect(user).toBeUndefined();
    });
  });

  describe('Customer operations', () => {
    it('should get all customers', async () => {
      const customers = await storage.getCustomers();
      expect(Array.isArray(customers)).toBe(true);
      expect(customers.length).toBeGreaterThan(0);
    });

    it('should create a customer', async () => {
      const customerData = {
        name: 'Test Company',
        email: 'test@company.com',
        status: 'prospect',
        value: '10000'
      };
      
      const customer = await storage.createCustomer(customerData);
      
      expect(customer).toMatchObject(customerData);
      expect(customer.id).toBeDefined();
      expect(customer.createdAt).toBeDefined();
      expect(customer.lastContact).toBeDefined();
    });

    it('should get customer by id', async () => {
      const customerData = {
        name: 'Test Company',
        email: 'test@company.com',
        status: 'prospect',
        value: '10000'
      };
      
      const createdCustomer = await storage.createCustomer(customerData);
      const retrievedCustomer = await storage.getCustomer(createdCustomer.id);
      
      expect(retrievedCustomer).toEqual(createdCustomer);
    });

    it('should update a customer', async () => {
      const customerData = {
        name: 'Test Company',
        email: 'test@company.com',
        status: 'prospect',
        value: '10000'
      };
      
      const createdCustomer = await storage.createCustomer(customerData);
      const updateData = { status: 'active', value: '15000' };
      
      const updatedCustomer = await storage.updateCustomer(createdCustomer.id, updateData);
      
      expect(updatedCustomer).toBeDefined();
      expect(updatedCustomer!.status).toBe('active');
      expect(updatedCustomer!.value).toBe('15000');
      expect(updatedCustomer!.name).toBe('Test Company');
    });

    it('should return undefined when updating non-existent customer', async () => {
      const result = await storage.updateCustomer(999, { status: 'active' });
      expect(result).toBeUndefined();
    });
  });

  describe('Sales data operations', () => {
    it('should get all sales data', async () => {
      const salesData = await storage.getSalesData();
      expect(Array.isArray(salesData)).toBe(true);
      expect(salesData.length).toBeGreaterThan(0);
    });

    it('should create sales data', async () => {
      const salesDataInput = {
        month: 'Jul',
        revenue: '30000',
        deals: 45
      };
      
      const salesData = await storage.createSalesData(salesDataInput);
      
      expect(salesData).toMatchObject(salesDataInput);
      expect(salesData.id).toBeDefined();
      expect(salesData.createdAt).toBeDefined();
    });
  });
});