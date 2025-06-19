import { 
  insertUserSchema, 
  insertCustomerSchema, 
  insertSalesDataSchema 
} from '@shared/schema';
import { describe, it, expect } from '@jest/globals';

describe('Schema Validation', () => {
  describe('insertUserSchema', () => {
    it('should validate valid user data', () => {
      const validUser = {
        username: 'testuser',
        password: 'password123'
      };

      const result = insertUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject missing username', () => {
      const invalidUser = {
        password: 'password123'
      };

      const result = insertUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidUser = {
        username: 'testuser'
      };

      const result = insertUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should reject empty username', () => {
      const invalidUser = {
        username: '',
        password: 'password123'
      };

      const result = insertUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });
  });

  describe('insertCustomerSchema', () => {
    it('should validate valid customer data', () => {
      const validCustomer = {
        name: 'Test Company',
        email: 'test@company.com',
        status: 'prospect',
        value: '10000'
      };

      const result = insertCustomerSchema.safeParse(validCustomer);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidCustomer = {
        name: 'Test Company'
      };

      const result = insertCustomerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const invalidCustomer = {
        name: 'Test Company',
        email: 'invalid-email',
        status: 'prospect',
        value: '10000'
      };

      const result = insertCustomerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const invalidCustomer = {
        name: '',
        email: 'test@company.com',
        status: 'prospect',
        value: '10000'
      };

      const result = insertCustomerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
    });
  });

  describe('insertSalesDataSchema', () => {
    it('should validate valid sales data', () => {
      const validSalesData = {
        month: 'January',
        revenue: '25000',
        deals: 40
      };

      const result = insertSalesDataSchema.safeParse(validSalesData);
      expect(result.success).toBe(true);
    });

    it('should reject missing month', () => {
      const invalidSalesData = {
        revenue: '25000',
        deals: 40
      };

      const result = insertSalesDataSchema.safeParse(invalidSalesData);
      expect(result.success).toBe(false);
    });

    it('should reject missing revenue', () => {
      const invalidSalesData = {
        month: 'January',
        deals: 40
      };

      const result = insertSalesDataSchema.safeParse(invalidSalesData);
      expect(result.success).toBe(false);
    });

    it('should reject negative deals', () => {
      const invalidSalesData = {
        month: 'January',
        revenue: '25000',
        deals: -5
      };

      const result = insertSalesDataSchema.safeParse(invalidSalesData);
      expect(result.success).toBe(false);
    });

    it('should reject non-numeric deals', () => {
      const invalidSalesData = {
        month: 'January',
        revenue: '25000',
        deals: 'invalid'
      };

      const result = insertSalesDataSchema.safeParse(invalidSalesData);
      expect(result.success).toBe(false);
    });
  });
});