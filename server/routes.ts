import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertSalesDataSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ error: "Invalid customer data" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, validatedData);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(400).json({ error: "Invalid customer data" });
    }
  });

  // Sales data routes
  app.get("/api/sales-data", async (req, res) => {
    try {
      const salesData = await storage.getSalesData();
      res.json(salesData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales data" });
    }
  });

  app.post("/api/sales-data", async (req, res) => {
    try {
      const validatedData = insertSalesDataSchema.parse(req.body);
      const salesData = await storage.createSalesData(validatedData);
      res.status(201).json(salesData);
    } catch (error) {
      res.status(400).json({ error: "Invalid sales data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
