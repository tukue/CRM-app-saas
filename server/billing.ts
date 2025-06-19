import { commercialStorage } from "./commercial-storage";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  userLimit: number;
  storageLimit: string;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    features: [
      'Up to 5 users',
      '1,000 contacts',
      'Basic reporting',
      'Email support'
    ],
    userLimit: 5,
    storageLimit: '1GB'
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 99,
    features: [
      'Up to 25 users',
      '10,000 contacts',
      'Advanced reporting',
      'Priority support',
      'API access',
      'Custom fields'
    ],
    userLimit: 25,
    storageLimit: '10GB'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    features: [
      'Unlimited users',
      '100,000+ contacts',
      'Custom reporting',
      'Dedicated support',
      'API access',
      'Custom integrations',
      'Advanced security',
      'White-label options'
    ],
    userLimit: -1, // unlimited
    storageLimit: '100GB'
  }
};

export class BillingService {
  async createSubscription(organizationId: number, planId: string): Promise<{
    success: boolean;
    subscriptionId?: string;
    error?: string;
  }> {
    try {
      const plan = SUBSCRIPTION_PLANS[planId];
      if (!plan) {
        return { success: false, error: 'Invalid plan selected' };
      }

      // In a real implementation, this would integrate with Stripe or similar
      // For demo purposes, we'll simulate the subscription creation
      await commercialStorage.updateOrganizationSubscription(organizationId, planId, 'active');
      
      return {
        success: true,
        subscriptionId: `sub_${Date.now()}_${organizationId}`
      };
    } catch (error) {
      return { success: false, error: 'Failed to create subscription' };
    }
  }

  async cancelSubscription(organizationId: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await commercialStorage.updateOrganizationSubscription(organizationId, 'starter', 'cancelled');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to cancel subscription' };
    }
  }

  async getUsageStats(organizationId: number): Promise<{
    users: number;
    customers: number;
    leads: number;
    deals: number;
    storageUsed: string;
  }> {
    const metrics = await commercialStorage.getDashboardMetrics(organizationId);
    const users = await commercialStorage.getUsersByOrganization(organizationId);
    
    return {
      users: users.length,
      customers: metrics.totalCustomers,
      leads: metrics.totalLeads,
      deals: metrics.totalDeals,
      storageUsed: '0.5GB' // Placeholder for actual storage calculation
    };
  }

  checkPlanLimits(plan: SubscriptionPlan, usage: {
    users: number;
    customers: number;
  }): { 
    withinLimits: boolean; 
    violations: string[] 
  } {
    const violations: string[] = [];
    
    if (plan.userLimit > 0 && usage.users > plan.userLimit) {
      violations.push(`User limit exceeded (${usage.users}/${plan.userLimit})`);
    }
    
    // Add more limit checks as needed
    
    return {
      withinLimits: violations.length === 0,
      violations
    };
  }
}

export const billingService = new BillingService();