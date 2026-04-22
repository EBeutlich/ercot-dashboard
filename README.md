# ERCOT Dashboard

A React-based single-page application for monitoring ERCOT (Electric Reliability Council of Texas) market data and grid conditions.

## Features

- **25 Dashboard Pages** covering all aspects of the ERCOT grid:
  - Real-time system demand and generation
  - Settlement point prices (real-time and day-ahead)
  - Generation by fuel type (wind, solar, gas, etc.)
  - Load forecasts and weather zones
  - Grid operations (outages, reserves, frequency)
  - Emergency alerts and market notices
  - Historical data access and reports

- **Real-time Updates**: Data automatically refreshes at appropriate intervals
- **Interactive Charts**: Built with Recharts for visualizing time-series and categorical data
- **Responsive Design**: Works on desktop and mobile devices
- **Modern Stack**: React 18, Vite, TailwindCSS, React Query

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### AWS Amplify Deployment

This project is configured for AWS Amplify hosting:

1. Connect your GitHub repository to AWS Amplify Console
2. Amplify will automatically detect the `amplify.yml` build configuration
3. Deploy on every push to main branch

**Free Tier Coverage:**
- AWS Amplify provides 1000 build minutes/month free
- 5 GB storage and 15 GB data transfer/month free
- Custom domain with free SSL certificate

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Card.jsx
│   ├── Header.jsx
│   ├── Layout.jsx
│   ├── LoadingSpinner.jsx
│   ├── Sidebar.jsx
│   └── StatCard.jsx
├── pages/           # Dashboard pages (25 total)
│   ├── Home.jsx
│   ├── SystemDemand.jsx
│   ├── RealTimePrices.jsx
│   └── ... (22 more)
├── services/        # API integration
│   └── ercotApi.js
├── App.jsx          # Main app with routing
├── main.jsx         # Entry point
└── index.css        # Global styles
```

## ERCOT API Integration

The application connects to ERCOT's public Market Information System (MIS) API. 

**Note:** ERCOT's public API may have CORS restrictions. For production use:
1. Use AWS Lambda as a proxy
2. Or configure Amplify Functions to fetch data server-side

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router v6** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Recharts** - Charting library
- **TailwindCSS** - Utility-first CSS
- **Axios** - HTTP client

## License

MIT
