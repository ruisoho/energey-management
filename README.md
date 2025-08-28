# Building Energy Manager 🏢⚡

A comprehensive web application for monitoring, analyzing, and optimizing building energy consumption. Built with Next.js 14, TypeScript, and modern web technologies.

![Building Energy Manager Dashboard](https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop)

## ✨ Features

### 📊 Dashboard & Analytics
- **Real-time Energy Monitoring**: Live KPI cards showing current usage, costs, and efficiency
- **Interactive Charts**: Energy consumption trends, monthly breakdowns, and usage by category
- **Weather Normalization**: Adjust energy data based on weather conditions
- **Anomaly Detection**: Automatic identification of unusual energy patterns

### 📈 Data Management
- **CSV Upload**: Bulk import energy data with validation and preview
- **API Integration**: RESTful endpoints for energy and weather data
- **Data Export**: Export reports and data in CSV and PDF formats
- **Historical Analysis**: Track performance over time with detailed metrics

### 🔧 Configuration
- **Building Settings**: Configure building information, systems, and parameters
- **Alert Thresholds**: Customize notification settings for various metrics
- **Multi-building Support**: Manage multiple facilities from one dashboard
- **Localization**: Support for multiple currencies and timezones

### 📋 Reporting
- **Comprehensive Reports**: Detailed energy consumption analysis
- **PDF Export**: Professional reports with charts and recommendations
- **Executive Summaries**: Key metrics and performance indicators
- **Automated Insights**: AI-powered recommendations for optimization

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS, ShadCN UI, Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Charts**: Recharts for data visualization
- **File Processing**: Papa Parse for CSV handling
- **PDF Generation**: jsPDF with html2canvas
- **Weather Data**: Meteostat API integration

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd building-energy-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/building_energy_db"
   
   # Weather API (Optional)
   METEOSTAT_API_KEY="your_meteostat_api_key"
   
   # Next.js
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed with demo data
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
building-energy-manager/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── analytics/          # Analytics and weather normalization
│   │   ├── api/               # API routes
│   │   │   ├── energy-data/   # Energy data endpoints
│   │   │   └── weather/       # Weather data endpoints
│   │   ├── reports/           # Report generation and PDF export
│   │   ├── settings/          # Building configuration
│   │   ├── upload/            # CSV upload functionality
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Dashboard homepage
│   ├── components/            # Reusable React components
│   │   ├── ui/               # ShadCN UI components
│   │   ├── kpi-card.tsx      # KPI display component
│   │   └── navigation.tsx    # Main navigation
│   └── lib/                  # Utility functions
│       └── utils.ts          # Helper functions
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts              # Demo data seeding
│   └── migrations/          # Database migrations
├── public/                   # Static assets
└── package.json             # Dependencies and scripts
```

## 🗄️ Database Schema

### Core Entities

- **Building**: Facility information and configuration
- **EnergyReading**: Time-series energy consumption data
- **WeatherData**: Weather conditions for normalization
- **Alert**: System notifications and alerts

## 🔌 API Endpoints

### Energy Data
- `GET /api/energy-data` - Fetch energy readings with filtering
- `POST /api/energy-data` - Create new energy readings
- `DELETE /api/energy-data` - Remove energy readings

### Weather Data
- `GET /api/weather` - Fetch weather data for normalization
- `POST /api/weather` - Find nearby weather stations

### Query Parameters
- `buildingId`: Filter by building
- `startDate` / `endDate`: Date range filtering
- `limit`: Pagination limit
- `offset`: Pagination offset

## 📊 Usage Examples

### Uploading Energy Data

1. Navigate to `/upload`
2. Select a CSV file with columns: `timestamp`, `kWh`, `cost`
3. Preview and validate the data
4. Upload to the database

### Generating Reports

1. Go to `/reports`
2. Select date range and report type
3. Review the comprehensive analysis
4. Export as PDF or CSV

### Configuring Buildings

1. Access `/settings`
2. Update building information
3. Configure energy systems and tariffs
4. Set alert thresholds

## 🎨 Design System

The application follows modern design principles:

- **Dark Theme**: Professional dark UI optimized for energy monitoring
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Accessibility**: WCAG compliant with proper contrast and navigation
- **Typography**: Inter font for excellent readability
- **Color Palette**: Carefully selected colors for data visualization

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:seed      # Seed database with demo data
npm run db:reset     # Reset and reseed database

# Prisma
npx prisma studio    # Open Prisma Studio
npx prisma generate  # Generate Prisma client
npx prisma migrate   # Run database migrations
```

### Code Quality

- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code linting with Next.js recommended rules
- **Prettier**: Consistent code formatting
- **Prisma**: Type-safe database operations

## 🌍 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import project to Vercel
   - Configure environment variables

2. **Database Setup**
   - Use Vercel Postgres or external PostgreSQL
   - Run migrations in production

3. **Environment Variables**
   ```env
   DATABASE_URL=your_production_database_url
   METEOSTAT_API_KEY=your_api_key
   NEXTAUTH_SECRET=your_production_secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: [Awwwards Site of the Day](https://www.awwwards.com/websites/sites_of_the_day/)
- **Weather Data**: [Meteostat API](https://meteostat.net/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the demo data and examples

---

**Built with ❤️ for sustainable energy management**
