import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertSalesDataSchema } from "@shared/schema";
import { validateRequestBody, validateRequestParams } from "./middleware/validation";
import { asyncHandler, CustomError } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";
import { z } from "zod";
import client from "prom-client";

// Business metrics
const customerCounter = new client.Gauge({
  name: 'crm_customers_total',
  help: 'Total number of customers'
});

const revenueGauge = new client.Gauge({
  name: 'crm_revenue_total',
  help: 'Total revenue amount'
});

const requestDuration = new client.Histogram({
  name: 'crm_request_duration_seconds',
  help: 'Duration of CRM API requests',
  labelNames: ['method', 'route', 'status_code']
});

// Validation schemas
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number)
});

const updateBusinessMetrics = async () => {
  const customers = await storage.getCustomers();
  const salesData = await storage.getSalesData();
  
  customerCounter.set(customers.length);
  
  const totalRevenue = salesData.reduce((sum, item) => sum + parseFloat(item.revenue), 0);
  revenueGauge.set(totalRevenue);
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply rate limiting to all API routes
  app.use("/api", apiLimiter);

  // Health check endpoint
  app.get("/health", asyncHandler(async (req, res) => {
    const startTime = Date.now();
    
    try {
      // Check database connectivity
      await storage.getCustomers();
      
      const responseTime = Date.now() - startTime;
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    } catch (error) {
      throw new CustomError("Database connection failed", 503);
    }
  }));

  // Customer routes
  app.get("/api/customers", asyncHandler(async (req, res) => {
    const end = requestDuration.startTimer({ method: 'GET', route: '/api/customers' });
    
    const customers = await storage.getCustomers();
    await updateBusinessMetrics();
    
    end({ status_code: '200' });
    res.json(customers);
  }));

  app.get("/api/customers/:id", 
    validateRequestParams(idParamSchema),
    asyncHandler(async (req, res) => {
      const end = requestDuration.startTimer({ method: 'GET', route: '/api/customers/:id' });
      const id = req.params.id as unknown as number;
      
      const customer = await storage.getCustomer(id);
      if (!customer) {
        throw new CustomError("Customer not found", 404);
      }
      
      end({ status_code: '200' });
      res.json(customer);
    })
  );

  app.post("/api/customers",
    validateRequestBody(insertCustomerSchema),
    asyncHandler(async (req, res) => {
      const end = requestDuration.startTimer({ method: 'POST', route: '/api/customers' });
      
      const customer = await storage.createCustomer(req.body);
      await updateBusinessMetrics();
      
      end({ status_code: '201' });
      res.status(201).json(customer);
    })
  );

  app.put("/api/customers/:id",
    validateRequestParams(idParamSchema),
    validateRequestBody(insertCustomerSchema.partial()),
    asyncHandler(async (req, res) => {
      const end = requestDuration.startTimer({ method: 'PUT', route: '/api/customers/:id' });
      const id = req.params.id as unknown as number;
      
      const customer = await storage.updateCustomer(id, req.body);
      if (!customer) {
        throw new CustomError("Customer not found", 404);
      }
      
      await updateBusinessMetrics();
      end({ status_code: '200' });
      res.json(customer);
    })
  );

  // Sales data routes
  app.get("/api/sales-data", asyncHandler(async (req, res) => {
    const end = requestDuration.startTimer({ method: 'GET', route: '/api/sales-data' });
    
    const salesData = await storage.getSalesData();
    await updateBusinessMetrics();
    
    end({ status_code: '200' });
    res.json(salesData);
  }));

  app.post("/api/sales-data",
    validateRequestBody(insertSalesDataSchema),
    asyncHandler(async (req, res) => {
      const end = requestDuration.startTimer({ method: 'POST', route: '/api/sales-data' });
      
      const salesData = await storage.createSalesData(req.body);
      await updateBusinessMetrics();
      
      end({ status_code: '201' });
      res.status(201).json(salesData);
    })
  );

  const httpServer = createServer(app);

  return httpServer;
}
