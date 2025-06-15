
# CRM SaaS Application for Small Businesses

A modern, full-stack Customer Relationship Management (CRM) application built specifically for small businesses. Features real-time analytics, automated workflows, and seamless customer management.

## 🚀 Project Overview

This CRM application provides small businesses with enterprise-grade customer management capabilities at an affordable scale. Built with modern web technologies and designed for easy deployment and maintenance.

### Key Features

- **Customer Management**: Complete customer lifecycle tracking
- **Sales Pipeline**: Visual deal tracking and opportunity management  
- **Analytics Dashboard**: Real-time business insights and reporting
- **Activity Tracking**: Log calls, meetings, emails, and tasks
- **User Authentication**: Secure multi-tenant architecture
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Beautiful, accessible components
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Robust relational database
- **Row Level Security (RLS)** - Data isolation between tenants
- **Real-time subscriptions** - Live data updates

### Deployment & CI/CD
- **Vercel/Netlify** - Frontend hosting
- **GitHub Actions** - Automated deployment pipeline
- **Environment variables** - Secure configuration management

## 📊 Database Schema

### Core Tables

#### `customers`
- Customer information and contact details
- Status tracking (prospect, active, inactive, negotiation)
- Revenue potential and notes

#### `deals`
- Sales opportunities and pipeline management
- Deal stages, probability, and expected close dates
- Revenue tracking and forecasting

#### `activities`
- Customer interaction logging
- Task management and follow-ups
- Communication history

#### `profiles`
- Business profile information
- User settings and preferences

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL migration (see Database Setup section)
   - Configure authentication settings

4. **Environment variables**
   Create a `.env.local` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄 Database Setup

The application requires a PostgreSQL database with the following structure. Run this SQL in your Supabase SQL editor:

**Important**: The database schema includes:
- Customer management tables
- Sales pipeline tracking
- Activity logging system
- User profiles and business information
- Row Level Security for multi-tenant data isolation

Contact the development team or check the project documentation for the complete SQL migration script.

## 🔐 Authentication & Security

### Multi-Tenant Architecture
- Each user's data is completely isolated using Supabase RLS
- Automatic user profile creation on signup
- Secure session management

### Data Protection
- All sensitive data encrypted at rest
- HTTPS enforced in production
- Environment variables for sensitive configuration

## 🎨 UI/UX Design

### Design System
- **Shadcn/UI** components for consistency
- **Tailwind CSS** for responsive design
- **Lucide React** icons for modern iconography
- **Dark/Light mode** support ready

### Responsive Breakpoints
- Mobile: 320px - 768px
- Tablet: 768px - 1024px  
- Desktop: 1024px+

## 📈 Business Model & Commercialization

### Target Market
- Small businesses (1-50 employees)
- Service-based companies
- Sales teams needing pipeline management
- Businesses outgrowing spreadsheets

### Pricing Strategy
- **Freemium**: Basic features for small teams
- **Professional**: Advanced analytics and integrations
- **Enterprise**: Custom features and support

### Revenue Streams
- Monthly/Annual subscriptions
- Premium feature add-ons
- Professional services and setup

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to hosting platform**
   - Vercel: Connect GitHub repo for automatic deployments
   - Netlify: Drag and drop dist folder or connect repo
   - Custom: Serve the `dist` folder from any web server

3. **Configure environment variables**
   Set production Supabase credentials in your hosting platform

### CI/CD Pipeline

The project is configured for automated deployment:
- **GitHub Actions** for testing and building
- **Automatic deployment** on main branch push
- **Environment-specific** configurations

## 🧪 Testing

### Test Coverage
- Unit tests for utility functions
- Component testing with React Testing Library
- Integration tests for database operations

### Running Tests
```bash
npm run test        # Run test suite
npm run test:watch  # Watch mode for development
npm run test:coverage # Generate coverage report
```

## 📦 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn UI components
│   └── custom/         # Custom business components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
├── types/              # TypeScript type definitions
└── assets/             # Static assets
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### Code Standards
- **TypeScript strict mode** enabled
- **ESLint** for code quality
- **Prettier** for consistent formatting
- **Conventional commits** for clear history

### Before Submitting PRs
- Run `npm run lint` and fix any issues
- Ensure all tests pass (`npm run test`)
- Update documentation if needed
- Test on multiple screen sizes

## 🎯 Roadmap & Future Features

### Phase 1 (Current)
- ✅ Core CRM functionality
- ✅ Customer management
- ✅ Basic analytics dashboard
- ✅ User authentication

### Phase 2 (Next 3 months)
- [ ] Email integration and templates
- [ ] Advanced reporting and exports
- [ ] Mobile app (React Native)
- [ ] API integrations (Google Calendar, etc.)

### Phase 3 (6-12 months)
- [ ] Advanced automation workflows
- [ ] Team collaboration features
- [ ] Custom fields and forms
- [ ] WhatsApp/SMS integration

## 📞 Support & Contact

### Documentation
- **API Documentation**: [Link to API docs]
- **User Guide**: [Link to user documentation]
- **Video Tutorials**: [Link to tutorial playlist]

### Getting Help
- **GitHub Issues**: Bug reports and feature requests
- **Discord Community**: [Link to Discord server]
- **Email Support**: support@yourcrm.com

### Business Inquiries
- **Partnerships**: partnerships@yourcrm.com
- **Enterprise Sales**: enterprise@yourcrm.com

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the incredible backend platform
- **Shadcn** for the beautiful UI components
- **Vercel** for seamless deployment
- **Open source community** for the amazing tools

---

**Built with ❤️ for small businesses everywhere**

*This project is actively maintained and ready for commercial deployment. For business inquiries or custom development, please contact the development team.*
