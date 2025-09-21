# Technical Specification - HomeSearch App

> **📝 AI-MAINTAINED DOCUMENT**  
> This document is maintained by AI assistants. For user-maintained docs, see files without this header.

## Architecture Overview

Full-stack web application with React frontend and Node.js backend, featuring a comprehensive Home Scoring System for evaluating property listings with dealbreaker rules, thresholds, and weighted scoring.

## Frontend (React + TypeScript)

### Technology Stack
- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** for form management
- **Zustand** for state management (lightweight alternative to Redux)
- **Vitest** for testing framework
- **React Testing Library** for component testing

### Key Components
```
src/
├── components/
│   ├── PropertyList.tsx          # Property list with scoring display
│   ├── StatusFilter.tsx          # Status filtering component
│   └── JsonImporter.tsx          # ChatGPT JSON import
├── pages/
│   ├── HomePage.tsx              # Main property list page
│   └── PropertyDetailPage.tsx    # Detailed property view with scoring
├── services/
│   ├── api.ts                    # API service for backend communication
│   └── scoringService.ts         # Scoring calculation logic
├── types/
│   ├── Property.ts               # Property data model with scoring
│   └── PropertyStatus.ts         # Centralized status definitions
├── store/
│   └── propertyStore.ts          # Zustand state management
└── test/
    ├── setup.ts                  # Test configuration
    ├── scoringService.test.ts    # Scoring logic tests
    ├── api.test.ts               # API endpoint tests
    ├── PropertyList.test.tsx     # Component tests
    └── PropertyDetailPage.test.tsx
```

## Backend (Node.js + Express)

### Technology Stack
- **Node.js** with Express
- **SQLite** with better-sqlite3
- **CORS** for cross-origin requests
- **Helmet** for security headers
- **Database Migration System** for schema management

### API Endpoints
```
GET    /api/properties                    - Get all properties
GET    /api/properties/:id                - Get single property
POST   /api/properties                    - Create new property
PUT    /api/properties/:id                - Update property
DELETE /api/properties/:id                - Delete property
POST   /api/properties/:id/calculate-score - Calculate property score
```

### Backend Structure
```
server/
├── index.js                    # Express server setup
├── routes/
│   └── properties.js           # Property API routes
├── database/
│   ├── database.js             # Database manager
│   └── migrations.js           # Migration system
└── services/
    └── scoringService.js       # Backend scoring logic
```

### Database Schema
The database uses a nested JSON structure with automatic migrations:

```sql
CREATE TABLE properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Nested JSON structure for property data
  address_street TEXT,
  address_house_number INTEGER,
  address_postal_code TEXT,
  address_city TEXT,
  
  price_asking_price_eur INTEGER,
  
  details_area_sqm INTEGER,
  details_floor_info TEXT,
  details_year_built INTEGER,
  details_energy_label TEXT,
  
  ownership_type TEXT,
  ownership_lease_details TEXT,
  ownership_perceel TEXT,
  
  vve_monthly_fee_eur REAL,
  
  metadata_source TEXT,
  metadata_date_added TEXT,
  
  -- Room dimensions
  main_bedroom_long_edge REAL,
  main_bedroom_short_edge REAL,
  guest_room_long_edge REAL,
  guest_room_short_edge REAL,
  
  -- Scoring system fields
  main_bedroom_sqm REAL,
  kitchen_type TEXT,
  foundation_status TEXT,
  street_noise TEXT,
  smelly_business_below BOOLEAN,
  commute_time_central_min INTEGER,
  workspace_count INTEGER,
  viewing_status TEXT,
  notes TEXT,
  total_score INTEGER DEFAULT 0,
  score_breakdown TEXT, -- JSON string
  
  status TEXT DEFAULT 'Interested',
  comments TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Migration System
- **001_initial_schema.sql**: Creates base table structure
- **002_add_scoring_fields.sql**: Adds scoring system columns
- Automatic migration tracking and execution
- Data integrity preservation during schema changes

## Home Scoring System v1.2

### Overview
The system implements a **database-driven configurable scoring algorithm** with dealbreaker rules, thresholds, and weighted scoring. All scoring rules are stored in the database and can be modified through API endpoints. **Scores are calculated dynamically on-demand** using the current configuration, ensuring they are always up-to-date.

### Database Configuration Tables
- **`scoring_config`**: Main configuration values (thresholds, weights, points)
- **`scoring_bands_total_area`**: Configurable bands for total area scoring
- **`scoring_bands_budget`**: Configurable bands for budget scoring  
- **`scoring_kitchen_points`**: Kitchen layout scoring with dealbreaker flags

### Scoring Algorithm (v1.2)
The system returns three score values:
- **`score_raw`**: Dynamic raw score based on current configuration
- **`score_max_possible`**: Maximum possible score with current config
- **`score_normalized`**: Normalized score (0-10 with 1 decimal) = round(10 * score_raw / score_max_possible * 10) / 10

### Default Scoring Rules
All scoring rules are configurable via database. See `docs/02_HomeScoringSystem.md` for complete specification including default values, dealbreaker rules, and weighted scoring bands.

### API Endpoints for Configuration
- `GET/PUT /api/scoring/config/:key` - Manage configuration values
- `GET/POST/PUT/DELETE /api/scoring/bands/total-area` - Manage area bands
- `GET/POST/PUT/DELETE /api/scoring/bands/budget` - Manage budget bands
- `GET/PUT /api/scoring/kitchen` - Manage kitchen layout points

### Scoring Features
- **Database-Driven**: All rules configurable via database
- **Dynamic Calculation**: Scores calculated on-demand using current configuration
- **Real-time Updates**: Configuration changes immediately affect all property scores
- **Computed Properties**: Scores are derived properties, not stored data
- **Visual Indicators**: Color-coded badges with emojis (🏆⭐👍👌❌) on 0-10 scale
- **Score Breakdown**: Detailed explanation of each scoring component
- **Manual Data Entry**: Length/width input with automatic m² calculation
- **No Manual Recalculation**: Scores update automatically when data or config changes

## Data Flow

1. **Property Creation**: User pastes JSON → Frontend validates → API creates record → Database stores → Auto-redirect to detail page
2. **Property Updates**: User edits → Frontend sends PUT → API updates → Database persists → UI reflects change
3. **Status Changes**: User selects status → Frontend updates → API persists → UI reflects change
4. **Room Dimensions**: User enters dimensions → Frontend validates → API updates nested object → Database stores individual fields
5. **Scoring Data Entry**: User enters scoring data → Frontend calculates bedroom area → API updates → Scores calculated dynamically on next fetch
6. **Score Calculation**: Scores calculated automatically on property fetch using current configuration
7. **Filtering**: User selects filter → Frontend filters local state → API query if needed
8. **Page Refresh**: User refreshes → Frontend fetches all properties → Store repopulates → UI displays data

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development Commands
```bash
npm run dev          # Start frontend dev server (port 3000)
npm run server       # Start backend server (port 3002)
npm run dev:full     # Start both frontend and backend concurrently
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run test suite
npm run test:ui      # Run tests with UI
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage report
```

## Deployment Considerations

### Local Development
- SQLite database file in project root
- Hot reload for both frontend and backend
- CORS enabled for local development

### Production Options
- **Simple**: Deploy to Vercel/Netlify (frontend) + Railway/Render (backend)
- **Self-hosted**: Docker containers with SQLite volume
- **Database**: Upgrade to PostgreSQL for production scale

## Security Considerations

- Input validation on both frontend and backend
- SQL injection prevention with parameterized queries
- CORS configuration for production
- Rate limiting for API endpoints
- Input sanitization for comments

## Performance Considerations

- Frontend: React.memo for list items, virtual scrolling for large lists
- Backend: Database indexing on frequently queried fields
- Caching: Simple in-memory cache for property list
- Bundle size: Code splitting for different pages

## Testing Framework

### Test Coverage
- **Unit Tests**: Scoring service logic, dealbreaker rules, edge cases
- **API Tests**: All CRUD operations, error handling, score calculation endpoint
- **Component Tests**: PropertyList, PropertyDetailPage with user interactions
- **Migration Tests**: Database schema changes, data integrity
- **Integration Tests**: Complete scoring workflow from data entry to calculation

### Test Structure
```
src/test/
├── setup.ts                    # Test configuration and mocks
├── scoringService.test.ts      # Scoring logic unit tests
├── api.test.ts                 # API endpoint tests
├── migrations.test.ts          # Database migration tests
├── PropertyList.test.tsx       # Component tests
└── PropertyDetailPage.test.tsx # Page component tests
```

### Testing Commands
- `npm test` - Run all tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Generate coverage report
- `npm run test:ui` - Run tests with Vitest UI

## Future Enhancements

- User authentication (if multi-user needed)
- Image uploads for property photos
- Advanced filtering (price range, location, etc.)
- Email notifications for status changes
- Integration with actual funda.nl API (if available)
- Mobile app with React Native
- Advanced scoring rules (location-based, commute optimization)
- Property comparison features
- Export/import functionality for scoring data
