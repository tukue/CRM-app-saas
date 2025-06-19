# CRM Dashboard with Prometheus & Grafana Monitoring

A modern Customer Relationship Management (CRM) dashboard built with React, Node.js, and PostgreSQL, featuring comprehensive monitoring with Prometheus and Grafana.

## Architecture

### Frontend
- **React 18** with TypeScript
- **Wouter** for client-side routing
- **TanStack Query** for data fetching and caching
- **Tailwind CSS** + **shadcn/ui** for styling
- **Recharts** for data visualization

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database operations
- **PostgreSQL** database
- **Prometheus** metrics collection
- **Zod** for request validation

### Database Schema
```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Customers table
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'prospect',
  value DECIMAL(10,2) NOT NULL DEFAULT 0,
  last_contact TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sales data table
CREATE TABLE sales_data (
  id SERIAL PRIMARY KEY,
  month TEXT NOT NULL,
  revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  deals INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Customer Management
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer

### Sales Data
- `GET /api/sales-data` - Get all sales data
- `POST /api/sales-data` - Create sales data entry

### Monitoring
- `GET /metrics` - Prometheus metrics endpoint

## Features

### Dashboard
- **Real-time KPIs**: Total customers, revenue, deals, conversion rates
- **Interactive Charts**: Revenue trends, sales pipeline, performance analytics
- **Customer Management**: View, search, and manage customer data
- **Responsive Design**: Works on desktop and mobile devices

### Monitoring & Observability
- **Prometheus Integration**: Automatic metrics collection
- **Custom Metrics**: API response times, request counts, error rates
- **Health Checks**: Application and database monitoring
- **Grafana Ready**: Pre-configured dashboards for visualization

## Setup & Installation

### Prerequisites
- Node.js 20+
- PostgreSQL database
- (Optional) Grafana for visualization

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@host:port/database
PGHOST=localhost
PGPORT=5432
PGUSER=username
PGPASSWORD=password
PGDATABASE=crm_db
```

### Installation
```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

## Migration from Lovable to Replit

This project was successfully migrated from Lovable to ensure:

### Security Improvements
- **Client/Server Separation**: All database operations moved to server-side
- **API Validation**: Zod schemas for request validation
- **Environment Variables**: Secure handling of sensitive data
- **PostgreSQL Integration**: Direct database connection instead of external services

### Performance Enhancements
- **Prometheus Monitoring**: Real-time performance metrics
- **Query Optimization**: Efficient data fetching with TanStack Query
- **Caching**: Intelligent client-side caching
- **Resource Monitoring**: CPU, memory, and request metrics

### Replit Compatibility
- **Port Configuration**: Optimized for Replit's port 5000
- **Workflow Integration**: Seamless development experience
- **Database Setup**: Automated PostgreSQL provisioning
- **Build Process**: Vite-based development and production builds

## Monitoring Setup

### Prometheus Metrics
The application exposes the following metrics at `/metrics`:

- **HTTP Request Duration**: Response time histograms
- **HTTP Request Count**: Total requests by method and status
- **Node.js Metrics**: Memory usage, CPU, event loop lag
- **Custom Business Metrics**: Customer count, revenue tracking

### Grafana Dashboard
A pre-configured Grafana dashboard is available with:

- **Application Overview**: Request rates, response times, error rates
- **Business Metrics**: Customer growth, revenue trends
- **Infrastructure**: Memory usage, CPU utilization
- **Database Performance**: Query execution times

## Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express backend
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data access layer
│   └── db.ts               # Database connection
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and validation
└── monitoring/             # Monitoring configuration
```

### Adding New Features
1. Define database schema in `shared/schema.ts`
2. Add storage methods in `server/storage.ts`
3. Create API routes in `server/routes.ts`
4. Build frontend components in `client/src/`
5. Add monitoring for new endpoints

## Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Setup
- Configure PostgreSQL connection
- Set up Prometheus scraping
- Deploy Grafana dashboards
- Configure SSL/TLS certificates

### Scaling Considerations
- Database connection pooling
- Redis caching layer
- Load balancer configuration
- Container orchestration (Docker/Kubernetes)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

## License

This project is licensed under the MIT License.