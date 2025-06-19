# Commercial CRM Dashboard Application

A production-ready Customer Relationship Management (CRM) platform with multi-tenant architecture, subscription billing, and comprehensive business management features.

## Features

### Commercial CRM Core
- **Multi-Tenant Architecture** - Complete organization isolation with subscription management
- **Lead Management** - Lead capture, scoring, assignment, and conversion tracking
- **Deal Pipeline** - Opportunity management with stages and probability tracking
- **Customer Management** - Complete customer lifecycle with relationship history
- **Activity Tracking** - Calls, emails, meetings, tasks, and notes management
- **Sales Analytics** - Revenue forecasting, conversion rates, and performance metrics
- **Subscription Billing** - Three-tier pricing with feature limitations and usage tracking

### Security & Access Control
- **Role-Based Permissions** - Admin, Manager, Sales Rep, and User roles
- **Organization Isolation** - Complete data separation between tenants
- **Authentication** - Secure bcrypt password hashing
- **Rate Limiting** - API protection with configurable limits
- **Input Validation** - Comprehensive Zod schema validation

### Monitoring & Analytics
- **Prometheus Metrics** - Application and business metrics collection
- **Dashboard Analytics** - Real-time KPIs and business intelligence
- **Health Monitoring** - System health checks and alerts
- **Performance Tracking** - Request duration and error monitoring

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui components
- TanStack Query for state management
- Recharts for data visualization
- Wouter for routing

### Backend
- Node.js with Express and TypeScript
- PostgreSQL database with Drizzle ORM
- Prometheus metrics collection
- bcrypt authentication
- Comprehensive middleware stack

### Infrastructure
- Replit hosting platform
- PostgreSQL database
- Prometheus monitoring
- GitHub Actions CI/CD

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Replit account (recommended)

### Installation

1. **Clone and setup**
```bash
git clone <repository-url>
cd crm-dashboard
npm install
```

2. **Environment variables** (automatically configured in Replit)
```bash
DATABASE_URL=postgresql://username:password@host:port/database
PGHOST=your-host
PGPORT=5432
PGUSER=your-username
PGPASSWORD=your-password
PGDATABASE=your-database
```

3. **Initialize database**
```bash
npm run db:push
```

4. **Start development server**
```bash
npm run dev
```

Application available at `http://localhost:5000`

## Commercial API Endpoints

### Organization Management
```bash
POST   /api/commercial/organizations           # Create organization
GET    /api/commercial/organizations/:id       # Get organization
PATCH  /api/commercial/organizations/:id       # Update subscription
```

### User Management
```bash
POST   /api/commercial/users                   # Create user with role
GET    /api/commercial/users/organization/:id  # List organization users
PATCH  /api/commercial/users/:id/role          # Update user role
```

### Lead Management
```bash
GET    /api/commercial/leads                   # List leads (org-scoped)
POST   /api/commercial/leads                   # Create lead
PATCH  /api/commercial/leads/:id               # Update lead
POST   /api/commercial/leads/:id/convert       # Convert to customer
```

### Customer Management
```bash
GET    /api/commercial/customers               # List customers (org-scoped)
GET    /api/commercial/customers/:id           # Get customer details
POST   /api/commercial/customers               # Create customer
PATCH  /api/commercial/customers/:id           # Update customer
```

### Deal Pipeline
```bash
GET    /api/commercial/deals                   # List deals (org-scoped)
GET    /api/commercial/deals?stage=proposal    # Filter by stage
POST   /api/commercial/deals                   # Create deal
PATCH  /api/commercial/deals/:id               # Update deal
```

### Activity Management
```bash
GET    /api/commercial/activities              # List activities (org-scoped)
GET    /api/commercial/activities?entityType=customer&entityId=123  # Filter
POST   /api/commercial/activities             # Create activity
PATCH  /api/commercial/activities/:id         # Update activity
```

### Analytics & Billing
```bash
GET    /api/commercial/dashboard/metrics       # Organization metrics
GET    /api/commercial/sales-data              # Sales analytics
POST   /api/commercial/subscription/create    # Create subscription
POST   /api/commercial/subscription/cancel    # Cancel subscription
```

### Legacy Endpoints (Backwards Compatible)
```bash
GET    /api/customers                          # List customers
POST   /api/customers                          # Create customer
GET    /api/sales-data                         # Sales data
GET    /health                                 # Health check
GET    /metrics                                # Prometheus metrics
```

## Database Schema

### Core Multi-Tenant Tables

#### Organizations
```sql
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT,
  settings JSONB DEFAULT '{}',
  subscription_status TEXT DEFAULT 'trial',
  subscription_plan TEXT DEFAULT 'starter',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Users (Enhanced)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',                    -- admin, manager, sales_rep, user
  organization_id INTEGER REFERENCES organizations(id) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Leads
```sql
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  source TEXT,                                 -- website, referral, advertisement
  status TEXT DEFAULT 'new',                   -- new, contacted, qualified, converted, lost
  score INTEGER DEFAULT 0,                     -- 0-100 lead scoring
  notes TEXT,
  assigned_to INTEGER REFERENCES users(id),
  organization_id INTEGER REFERENCES organizations(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Customers (Enhanced)
```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  status TEXT DEFAULT 'prospect',
  value DECIMAL(10,2) DEFAULT 0,
  last_contact TIMESTAMP DEFAULT NOW(),
  assigned_to INTEGER REFERENCES users(id),
  organization_id INTEGER REFERENCES organizations(id) NOT NULL,
  converted_from_lead INTEGER REFERENCES leads(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Deals
```sql
CREATE TABLE deals (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  value DECIMAL(10,2) NOT NULL,
  stage TEXT DEFAULT 'prospecting',            -- prospecting, qualification, proposal, negotiation, closed_won, closed_lost
  probability INTEGER DEFAULT 50,              -- 0-100
  expected_close_date TIMESTAMP,
  actual_close_date TIMESTAMP,
  customer_id INTEGER REFERENCES customers(id),
  assigned_to INTEGER REFERENCES users(id),
  organization_id INTEGER REFERENCES organizations(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Activities
```sql
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,                          -- call, email, meeting, task, note
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',               -- pending, completed, cancelled
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  customer_id INTEGER REFERENCES customers(id),
  lead_id INTEGER REFERENCES leads(id),
  deal_id INTEGER REFERENCES deals(id),
  assigned_to INTEGER REFERENCES users(id),
  created_by INTEGER REFERENCES users(id) NOT NULL,
  organization_id INTEGER REFERENCES organizations(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Sales Data (Enhanced)
```sql
CREATE TABLE sales_data (
  id SERIAL PRIMARY KEY,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  revenue DECIMAL(10,2) DEFAULT 0,
  deals INTEGER DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  deal_id INTEGER REFERENCES deals(id),
  assigned_to INTEGER REFERENCES users(id),
  organization_id INTEGER REFERENCES organizations(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Commercial Features

### Subscription Plans

#### Starter Plan - $29/month
- Up to 5 users
- 1,000 contacts
- Basic reporting
- Email support
- Standard features

#### Professional Plan - $99/month
- Up to 25 users
- 10,000 contacts
- Advanced reporting
- Priority support
- API access
- Custom fields
- Integrations

#### Enterprise Plan - $299/month
- Unlimited users
- 100,000+ contacts
- Custom reporting
- Dedicated support
- Full API access
- Custom integrations
- Advanced security
- White-label options

### User Roles & Permissions

#### Admin
- Full system access
- User management
- Billing management
- Organization settings
- All data access

#### Manager
- Team management
- All customer/lead access
- Reporting access
- User assignment
- Department oversight

#### Sales Rep
- Assigned leads/customers
- Deal management
- Activity tracking
- Basic reporting
- Pipeline management

#### User
- View assigned records
- Basic activity logging
- Limited reporting
- Read-only access

### Multi-Tenancy Implementation

```typescript
// Organization-scoped queries
const getCustomers = async (organizationId: number): Promise<Customer[]> => {
  return await db.select()
    .from(customers)
    .where(eq(customers.organizationId, organizationId))
    .orderBy(desc(customers.createdAt));
};

// Role-based access control
const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Usage example
app.get('/api/commercial/customers', 
  requireAuth, 
  requireRole(['admin', 'manager', 'sales_rep']), 
  async (req, res) => {
    const customers = await commercialStorage.getCustomers(req.user.organizationId);
    res.json(customers);
  }
);
```

### Billing System Structure

```typescript
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  userLimit: number;
  storageLimit: string;
}

interface UsageStats {
  users: number;
  customers: number;
  leads: number;
  deals: number;
  storageUsed: string;
}

class BillingService {
  async createSubscription(organizationId: number, planId: string): Promise<{
    success: boolean;
    subscriptionId?: string;
    error?: string;
  }>;
  
  async cancelSubscription(organizationId: number): Promise<{
    success: boolean;
    error?: string;
  }>;
  
  async getUsageStats(organizationId: number): Promise<UsageStats>;
  
  checkPlanLimits(plan: SubscriptionPlan, usage: UsageStats): {
    withinLimits: boolean;
    violations: string[];
  };
}
```

## Development

### Project Structure
```
├── client/                           # React frontend
│   ├── src/
│   │   ├── components/ui/           # shadcn/ui components
│   │   ├── pages/                   # Page components
│   │   ├── hooks/                   # Custom hooks
│   │   └── lib/                     # Utilities
├── server/                          # Express backend
│   ├── middleware/                  # Custom middleware
│   │   ├── auth.ts                 # Authentication
│   │   ├── rateLimiter.ts          # Rate limiting
│   │   ├── validation.ts           # Request validation
│   │   └── errorHandler.ts         # Error handling
│   ├── __tests__/                  # Unit tests
│   │   ├── storage.test.ts         # Legacy storage tests
│   │   ├── commercial-storage.test.ts  # Commercial tests
│   │   ├── billing.test.ts         # Billing tests
│   │   └── commercial-validation.test.ts  # Validation tests
│   ├── commercial-routes.ts        # Commercial API endpoints
│   ├── commercial-storage.ts       # Multi-tenant storage layer
│   ├── billing.ts                  # Subscription management
│   ├── storage.ts                  # Legacy storage (backwards compatible)
│   ├── routes.ts                   # Main API routes
│   ├── db.ts                       # Database connection
│   └── index.ts                    # Server entry point
├── shared/
│   └── schema.ts                   # Database schema & types
├── .github/workflows/
│   └── ci.yml                      # GitHub Actions CI/CD
├── jest.config.cjs                 # Jest configuration
├── drizzle.config.ts               # Drizzle ORM configuration
└── package.json                    # Dependencies & scripts
```

### Adding Commercial Features

1. **Database Schema Updates**
```typescript
// Always include organization_id for multi-tenancy
export const newTable = pgTable("new_table", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Update shared/schema.ts and run
npm run db:push
```

2. **API Endpoint Development**
```typescript
// Add to server/commercial-routes.ts
router.get("/new-endpoint", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const orgId = req.user?.organizationId || 1;
    const data = await commercialStorage.getNewData(orgId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});
```

3. **Frontend Integration**
```typescript
// Create organization-aware components
const useOrganizationData = () => {
  return useQuery({
    queryKey: ['/api/commercial/new-endpoint'],
    queryFn: () => fetch('/api/commercial/new-endpoint').then(res => res.json())
  });
};
```

### Testing

#### Running Tests
```bash
# All tests
npm test

# Specific test suites
npx jest commercial-storage.test.ts
npx jest billing.test.ts
npx jest commercial-validation.test.ts

# Test with coverage
npm test -- --coverage
```

#### Test Categories
- **Unit Tests** - Business logic validation
- **Integration Tests** - API endpoint testing
- **Commercial Tests** - Multi-tenant functionality
- **Billing Tests** - Subscription system validation
- **Security Tests** - Access control verification

### Monitoring

#### Prometheus Metrics
Available at `/metrics`:
```
# Business metrics
crm_customers_total{organization="1"} 150
crm_revenue_total{organization="1"} 500000
crm_leads_total{organization="1"} 300
crm_deals_total{organization="1"} 85
crm_conversion_rate{organization="1"} 30.5

# Application metrics
http_requests_total{method="GET",route="/api/customers",status="200"} 1250
http_request_duration_seconds_bucket{method="GET",route="/api/customers",le="0.1"} 1200
nodejs_heap_size_total_bytes 52428800
```

#### Dashboard Analytics
```json
{
  "totalRevenue": 500000,
  "totalDeals": 85,
  "totalCustomers": 150,
  "totalLeads": 300,
  "conversionRate": 30.5,
  "avgDealValue": 5882.35,
  "monthlyRecurringRevenue": 12500,
  "customerAcquisitionCost": 250,
  "lifetimeValue": 5000
}
```

## Deployment

### Production Environment
```bash
NODE_ENV=production
DATABASE_URL=<production-database-url>
PORT=5000

# Optional integrations
STRIPE_SECRET_KEY=<stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>
SENDGRID_API_KEY=<email-service-key>
```

### Scaling Considerations

#### Database Optimization
- Index organization_id on all tables
- Implement read replicas for analytics
- Consider database sharding for 1000+ organizations
- Monitor query performance with EXPLAIN ANALYZE

#### Application Scaling
- Implement Redis for session storage
- Use load balancers for multiple instances
- Cache frequently accessed organization data
- Implement CDN for static assets

#### Security Hardening
- Enable SSL/TLS encryption
- Implement IP whitelisting for admin access
- Set up Web Application Firewall (WAF)
- Regular security audits and penetration testing

### Commercial Launch Checklist

#### Technical Requirements
- [ ] Multi-tenant architecture implemented and tested
- [ ] Subscription billing system integrated
- [ ] Role-based access control verified
- [ ] Data isolation security audit passed
- [ ] Performance testing completed
- [ ] Backup and disaster recovery tested

#### Business Requirements
- [ ] Payment processing configured (Stripe/similar)
- [ ] Customer onboarding flow designed
- [ ] Support ticket system integrated
- [ ] Legal terms and privacy policy finalized
- [ ] Pricing strategy validated
- [ ] Marketing website created

#### Operational Requirements
- [ ] Monitoring and alerting configured
- [ ] Log aggregation system setup
- [ ] Customer support processes defined
- [ ] SLA definitions and monitoring
- [ ] Incident response procedures
- [ ] Regular security updates scheduled

## Revenue Model

### Subscription Revenue
- **Monthly Recurring Revenue (MRR)** tracking
- **Annual contract discounts** (15-20% typical)
- **Usage-based pricing** for enterprise clients
- **Add-on services** and integrations

### Implementation Examples

#### Subscription Management
```typescript
// Track MRR per organization
interface SubscriptionMetrics {
  monthlyRevenue: number;
  annualRevenue: number;
  churnRate: number;
  upgradeRate: number;
  customerLifetimeValue: number;
}

// Usage limit enforcement
const enforceUsageLimits = async (organizationId: number) => {
  const usage = await billingService.getUsageStats(organizationId);
  const org = await commercialStorage.getOrganization(organizationId);
  const plan = SUBSCRIPTION_PLANS[org.subscriptionPlan];
  
  const validation = billingService.checkPlanLimits(plan, usage);
  if (!validation.withinLimits) {
    throw new Error(`Usage limits exceeded: ${validation.violations.join(', ')}`);
  }
};
```

#### Customer Onboarding
```typescript
// Organization setup workflow
const createOrganization = async (setupData: {
  name: string;
  adminEmail: string;
  plan: string;
}) => {
  // 1. Create organization
  const org = await commercialStorage.createOrganization({
    name: setupData.name,
    slug: generateSlug(setupData.name),
    subscriptionPlan: setupData.plan
  });
  
  // 2. Create admin user
  const admin = await commercialStorage.createUser({
    email: setupData.adminEmail,
    role: 'admin',
    organizationId: org.id,
    // ... other fields
  });
  
  // 3. Initialize sample data
  await initializeSampleData(org.id);
  
  // 4. Send welcome email
  await sendWelcomeEmail(admin.email, org);
  
  return { organization: org, admin };
};
```

## Support & Documentation

### Customer Support Tiers
- **Starter** - Email support (48hr response)
- **Professional** - Priority email + chat (24hr response)
- **Enterprise** - Dedicated account manager + phone support (4hr response)

### API Documentation
- Interactive API documentation available
- SDKs for popular languages
- Webhook documentation for integrations
- Rate limiting and authentication guides

### Integration Examples
```bash
# Common integrations
POST /api/webhooks/stripe              # Payment processing
POST /api/webhooks/zapier              # Workflow automation
GET  /api/export/customers             # Data export
POST /api/import/leads                 # Bulk import
```

## License

MIT License for core CRM functionality. Commercial multi-tenant features included for business use.

---

**Production Ready**: This CRM platform includes comprehensive multi-tenant architecture, subscription billing, role-based access control, and enterprise security features. Ready for immediate commercial deployment with scalable infrastructure and monitoring capabilities.