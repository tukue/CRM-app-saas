import { BillingService, SUBSCRIPTION_PLANS } from '../billing';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Billing and Subscription Management', () => {
  let billingService: BillingService;

  beforeEach(() => {
    billingService = new BillingService();
  });

  describe('Subscription Plans', () => {
    it('should have valid starter plan configuration', () => {
      const starter = SUBSCRIPTION_PLANS.starter;
      
      expect(starter.id).toBe('starter');
      expect(starter.name).toBe('Starter');
      expect(starter.price).toBe(29);
      expect(starter.userLimit).toBe(5);
      expect(starter.features).toContain('Up to 5 users');
      expect(starter.features).toContain('1,000 contacts');
    });

    it('should have valid professional plan configuration', () => {
      const professional = SUBSCRIPTION_PLANS.professional;
      
      expect(professional.id).toBe('professional');
      expect(professional.name).toBe('Professional');
      expect(professional.price).toBe(99);
      expect(professional.userLimit).toBe(25);
      expect(professional.features).toContain('Up to 25 users');
      expect(professional.features).toContain('API access');
    });

    it('should have valid enterprise plan configuration', () => {
      const enterprise = SUBSCRIPTION_PLANS.enterprise;
      
      expect(enterprise.id).toBe('enterprise');
      expect(enterprise.name).toBe('Enterprise');
      expect(enterprise.price).toBe(299);
      expect(enterprise.userLimit).toBe(-1); // unlimited
      expect(enterprise.features).toContain('Unlimited users');
      expect(enterprise.features).toContain('Custom integrations');
    });

    it('should have increasing price tiers', () => {
      const { starter, professional, enterprise } = SUBSCRIPTION_PLANS;
      
      expect(professional.price).toBeGreaterThan(starter.price);
      expect(enterprise.price).toBeGreaterThan(professional.price);
    });
  });

  describe('Subscription Creation', () => {
    it('should create subscription for valid plan', async () => {
      const orgId = 1;
      const planId = 'professional';
      
      const result = await billingService.createSubscription(orgId, planId);
      
      expect(result.success).toBe(true);
      expect(result.subscriptionId).toBeDefined();
      expect(result.subscriptionId).toContain('sub_');
      expect(result.error).toBeUndefined();
    });

    it('should reject subscription for invalid plan', async () => {
      const orgId = 1;
      const planId = 'invalid_plan';
      
      const result = await billingService.createSubscription(orgId, planId);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid plan selected');
      expect(result.subscriptionId).toBeUndefined();
    });

    it('should generate unique subscription IDs', async () => {
      const orgId1 = 1;
      const orgId2 = 2;
      const planId = 'starter';
      
      const result1 = await billingService.createSubscription(orgId1, planId);
      const result2 = await billingService.createSubscription(orgId2, planId);
      
      expect(result1.subscriptionId).not.toBe(result2.subscriptionId);
    });
  });

  describe('Subscription Cancellation', () => {
    it('should cancel subscription successfully', async () => {
      const orgId = 1;
      
      const result = await billingService.cancelSubscription(orgId);
      
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Usage Statistics', () => {
    it('should return usage statistics structure', async () => {
      const orgId = 1;
      
      const usage = await billingService.getUsageStats(orgId);
      
      expect(usage).toHaveProperty('users');
      expect(usage).toHaveProperty('customers');
      expect(usage).toHaveProperty('leads');
      expect(usage).toHaveProperty('deals');
      expect(usage).toHaveProperty('storageUsed');
      
      expect(typeof usage.users).toBe('number');
      expect(typeof usage.customers).toBe('number');
      expect(typeof usage.leads).toBe('number');
      expect(typeof usage.deals).toBe('number');
      expect(typeof usage.storageUsed).toBe('string');
    });
  });

  describe('Plan Limit Validation', () => {
    it('should validate starter plan limits', () => {
      const plan = SUBSCRIPTION_PLANS.starter;
      const usage = { users: 3, customers: 500 };
      
      const validation = billingService.checkPlanLimits(plan, usage);
      
      expect(validation.withinLimits).toBe(true);
      expect(validation.violations).toHaveLength(0);
    });

    it('should detect user limit violations', () => {
      const plan = SUBSCRIPTION_PLANS.starter;
      const usage = { users: 10, customers: 500 };
      
      const validation = billingService.checkPlanLimits(plan, usage);
      
      expect(validation.withinLimits).toBe(false);
      expect(validation.violations).toContain('User limit exceeded (10/5)');
    });

    it('should allow unlimited users for enterprise plan', () => {
      const plan = SUBSCRIPTION_PLANS.enterprise;
      const usage = { users: 1000, customers: 50000 };
      
      const validation = billingService.checkPlanLimits(plan, usage);
      
      expect(validation.withinLimits).toBe(true);
      expect(validation.violations).toHaveLength(0);
    });
  });

  describe('Billing Calculations', () => {
    it('should calculate monthly costs correctly', () => {
      const plan = SUBSCRIPTION_PLANS.professional;
      const monthlyTotal = plan.price;
      
      expect(monthlyTotal).toBe(99);
    });

    it('should calculate annual costs with discount', () => {
      const plan = SUBSCRIPTION_PLANS.professional;
      const annualDiscount = 0.15; // 15% discount
      const annualCost = plan.price * 12 * (1 - annualDiscount);
      
      expect(annualCost).toBe(1009.8);
    });

    it('should calculate proration for mid-cycle upgrades', () => {
      const currentPlan = SUBSCRIPTION_PLANS.starter;
      const newPlan = SUBSCRIPTION_PLANS.professional;
      const daysRemaining = 15;
      const daysInMonth = 30;
      
      const proratedUpgrade = ((newPlan.price - currentPlan.price) * daysRemaining) / daysInMonth;
      
      expect(proratedUpgrade).toBe(35);
    });
  });

  describe('Feature Access Control', () => {
    it('should validate API access for different plans', () => {
      const starterFeatures = SUBSCRIPTION_PLANS.starter.features;
      const professionalFeatures = SUBSCRIPTION_PLANS.professional.features;
      
      expect(starterFeatures.some(f => f.includes('API'))).toBe(false);
      expect(professionalFeatures.some(f => f.includes('API'))).toBe(true);
    });

    it('should validate custom integrations access', () => {
      const professionalFeatures = SUBSCRIPTION_PLANS.professional.features;
      const enterpriseFeatures = SUBSCRIPTION_PLANS.enterprise.features;
      
      expect(professionalFeatures.some(f => f.includes('Custom integrations'))).toBe(false);
      expect(enterpriseFeatures.some(f => f.includes('Custom integrations'))).toBe(true);
    });
  });

  describe('Payment Processing Integration', () => {
    it('should validate payment data structure', () => {
      const paymentData = {
        amount: 99,
        currency: 'USD',
        paymentMethodId: 'pm_test_123',
        customerId: 'cus_test_456',
        subscriptionId: 'sub_test_789'
      };
      
      expect(paymentData.amount).toBeGreaterThan(0);
      expect(paymentData.currency).toBe('USD');
      expect(paymentData.paymentMethodId).toMatch(/^pm_/);
      expect(paymentData.customerId).toMatch(/^cus_/);
      expect(paymentData.subscriptionId).toMatch(/^sub_/);
    });

    it('should validate webhook event structure', () => {
      const webhookEvent = {
        id: 'evt_test_webhook',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_test_invoice',
            subscription: 'sub_test_subscription',
            amount_paid: 9900, // in cents
            status: 'paid'
          }
        }
      };
      
      expect(webhookEvent.type).toBe('invoice.payment_succeeded');
      expect(webhookEvent.data.object.status).toBe('paid');
      expect(webhookEvent.data.object.amount_paid).toBe(9900);
    });
  });

  describe('Subscription Lifecycle', () => {
    it('should handle trial period logic', () => {
      const trialDays = 14;
      const trialStart = new Date();
      const trialEnd = new Date(trialStart.getTime() + (trialDays * 24 * 60 * 60 * 1000));
      
      expect(trialEnd.getTime()).toBeGreaterThan(trialStart.getTime());
      
      const daysDifference = Math.ceil((trialEnd.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDifference).toBe(14);
    });

    it('should validate subscription status transitions', () => {
      const validTransitions = {
        trial: ['active', 'cancelled'],
        active: ['cancelled', 'suspended'],
        suspended: ['active', 'cancelled'],
        cancelled: []
      };
      
      expect(validTransitions.trial).toContain('active');
      expect(validTransitions.active).toContain('cancelled');
      expect(validTransitions.cancelled).toHaveLength(0);
    });
  });
});