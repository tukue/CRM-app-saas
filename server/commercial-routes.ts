import { Router } from "express";
import { commercialStorage } from "./commercial-storage";
import { 
  insertOrganizationSchema, insertUserSchema, insertLeadSchema, 
  insertCustomerSchema, insertDealSchema, insertActivitySchema,
  insertSalesDataSchema
} from "@shared/schema";
import { validateRequestBody } from "./middleware/validation";
import { requireAuth, type AuthenticatedRequest } from "./middleware/auth";
import bcrypt from "bcrypt";

const router = Router();

// Organization Management
router.post("/organizations", validateRequestBody(insertOrganizationSchema), async (req, res) => {
  try {
    const organization = await commercialStorage.createOrganization(req.body);
    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: "Failed to create organization" });
  }
});

router.get("/organizations/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const organization = await commercialStorage.getOrganization(parseInt(req.params.id));
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch organization" });
  }
});

// User Management
router.post("/users", validateRequestBody(insertUserSchema), async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const userData = { ...req.body, password: hashedPassword };
    const user = await commercialStorage.createUser(userData);
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.get("/users/organization/:orgId", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await commercialStorage.getUsersByOrganization(parseInt(req.params.orgId));
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.patch("/users/:id/role", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { role } = req.body;
    if (!role || !['admin', 'manager', 'sales_rep', 'user'].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    await commercialStorage.updateUserRole(parseInt(req.params.id), role);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user role" });
  }
});

// Lead Management
router.get("/leads", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.user?.organizationId || 1; // Default for demo
    const leads = await commercialStorage.getLeads(orgId);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

router.post("/leads", requireAuth, validateRequestBody(insertLeadSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.user?.organizationId || 1; // Default for demo
    const leadData = { ...req.body, organizationId: orgId };
    const lead = await commercialStorage.createLead(leadData);
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: "Failed to create lead" });
  }
});

router.patch("/leads/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const lead = await commercialStorage.updateLead(parseInt(req.params.id), req.body);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: "Failed to update lead" });
  }
});

router.post("/leads/:id/convert", requireAuth, validateRequestBody(insertCustomerSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.user?.organizationId || 1; // Default for demo
    const customerData = { ...req.body, organizationId: orgId };
    const customer = await commercialStorage.convertLeadToCustomer(parseInt(req.params.id), customerData);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: "Failed to convert lead" });
  }
});

// Enhanced Customer Management
router.get("/customers", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.user?.organizationId || 1; // Default for demo
    const customers = await commercialStorage.getCustomers(orgId);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

router.get("/customers/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.user?.organizationId || 1; // Default for demo
    const customer = await commercialStorage.getCustomer(parseInt(req.params.id), orgId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

router.post("/customers", requireAuth, validateRequestBody(insertCustomerSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.user?.organizationId || 1; // Default for demo
    const customerData = { ...req.body, organizationId: orgId };
    const customer = await commercialStorage.createCustomer(customerData);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: "Failed to create customer" });
  }
});

// Deal/Opportunity Management
router.get("/deals", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.user?.organizationId || 1; // Default for demo
    const { stage } = req.query;
    
    let deals;
    if (stage && typeof stage === 'string') {
      deals = await commercialStorage.getDealsByStage(orgId, stage);
    } else {
      deals = await commercialStorage.getDeals(orgId);
    }
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch deals" });
  }
});

router.post("/deals", requireAuth, validateRequestBody(insertDealSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.user?.organizationId || 1; // Default for demo
    const dealData = { ...req.body, organizationId: orgId };
    const deal = await commercialStorage.createDeal(dealData);
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: "Failed to create deal" });
  }
});

router.patch("/deals/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const deal = await commercialStorage.updateDeal(parseInt(req.params.id), req.body);
    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: "Failed to update deal" });
  }
});

// Activity Management
router.get("/activities", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.user?.organizationId || 1; // Default for demo
    const { entityType, entityId } = req.query;
    
    let activities;
    if (entityType && entityId) {
      activities = await commercialStorage.getActivitiesByEntity(
        entityType as 'customer' | 'lead' | 'deal', 
        parseInt(entityId as string)
      );
    } else {
      activities = await commercialStorage.getActivities(orgId);
    }
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

router.post("/activities", requireAuth, validateRequestBody(insertActivitySchema), async (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.user?.organizationId || 1; // Default for demo
    const userId = req.user?.id || 1; // Default for demo
    const activityData = { 
      ...req.body, 
      organizationId: orgId,
      createdBy: userId
    };
    const activity = await commercialStorage.createActivity(activityData);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: "Failed to create activity" });
  }
});

// Analytics and Dashboard
router.get("/dashboard/metrics", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.user?.organizationId || 1; // Default for demo
    const metrics = await commercialStorage.getDashboardMetrics(orgId);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard metrics" });
  }
});

router.get("/sales-data", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.user?.organizationId || 1; // Default for demo
    const salesData = await commercialStorage.getSalesData(orgId);
    res.json(salesData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sales data" });
  }
});

// Subscription Management (Stripe integration placeholder)
router.post("/subscription/create", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { plan } = req.body;
    const orgId = req.user?.organizationId || 1; // Default for demo
    
    // In a real implementation, this would integrate with Stripe
    // For now, we'll update the organization subscription status
    await commercialStorage.updateOrganizationSubscription(orgId, plan, "active");
    
    res.json({ 
      success: true, 
      message: "Subscription created successfully",
      plan: plan
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create subscription" });
  }
});

router.post("/subscription/cancel", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.user?.organizationId || 1; // Default for demo
    
    // Update subscription status to cancelled
    await commercialStorage.updateOrganizationSubscription(orgId, "starter", "cancelled");
    
    res.json({ 
      success: true, 
      message: "Subscription cancelled successfully"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

export default router;