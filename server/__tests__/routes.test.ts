import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('API Routes', () => {
  let app: express.Application;
  let server: any;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    server = await registerRoutes(app);
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
  });

  describe('GET /api/customers', () => {
    it('should return list of customers', async () => {
      const response = await request(app)
        .get('/api/customers')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const customer = response.body[0];
      expect(customer).toHaveProperty('id');
      expect(customer).toHaveProperty('name');
      expect(customer).toHaveProperty('email');
      expect(customer).toHaveProperty('status');
      expect(customer).toHaveProperty('value');
    });
  });

  describe('GET /api/customers/:id', () => {
    it('should return a specific customer', async () => {
      const response = await request(app)
        .get('/api/customers/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get('/api/customers/999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Customer not found');
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const customerData = {
        name: 'New Test Company',
        email: 'newtest@company.com',
        status: 'prospect',
        value: '25000'
      };

      const response = await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(201);

      expect(response.body).toMatchObject(customerData);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 400 for invalid customer data', async () => {
      const invalidData = {
        name: 'Test Company'
        // Missing required fields
      };

      await request(app)
        .post('/api/customers')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('PUT /api/customers/:id', () => {
    it('should update an existing customer', async () => {
      const updateData = {
        status: 'active',
        value: '30000'
      };

      const response = await request(app)
        .put('/api/customers/1')
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('active');
      expect(response.body.value).toBe('30000');
    });

    it('should return 404 for non-existent customer', async () => {
      const updateData = { status: 'active' };

      await request(app)
        .put('/api/customers/999')
        .send(updateData)
        .expect(404);
    });
  });

  describe('GET /api/sales-data', () => {
    it('should return sales data', async () => {
      const response = await request(app)
        .get('/api/sales-data')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const salesItem = response.body[0];
      expect(salesItem).toHaveProperty('id');
      expect(salesItem).toHaveProperty('month');
      expect(salesItem).toHaveProperty('revenue');
      expect(salesItem).toHaveProperty('deals');
    });
  });

  describe('POST /api/sales-data', () => {
    it('should create new sales data', async () => {
      const salesData = {
        month: 'Aug',
        revenue: '35000',
        deals: 50
      };

      const response = await request(app)
        .post('/api/sales-data')
        .send(salesData)
        .expect(201);

      expect(response.body).toMatchObject(salesData);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 400 for invalid sales data', async () => {
      const invalidData = {
        month: 'Aug'
        // Missing required fields
      };

      await request(app)
        .post('/api/sales-data')
        .send(invalidData)
        .expect(400);
    });
  });
});