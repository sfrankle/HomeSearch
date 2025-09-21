# HomeSearch - Property Tracking App

A web application for tracking and scoring property listings from funda.nl with a database-driven configurable scoring system.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev:full    # Start both frontend and backend
npm test            # Run test suite
npm run test:ui     # Run tests with UI
```

## 📋 Current Status
**✅ v1.2 Scoring System Complete** - Database-driven configurable scoring fully implemented
**✅ UI Improvements Complete** - Enhanced navigation, dealbreaker styling, and text readability

**Next Priority:** Update tests to work with new configurable scoring system

## 🎯 Key Features
- **Database-driven configurable scoring system** (v1.2)
- **Property management** with nested JSON data structure
- **ChatGPT integration** for property import
- **Real-time score calculation** with dealbreakers and weighted rules
- **API endpoints** for scoring configuration management

## 📁 Project Structure
```
HomeSearch/
├── docs/                          # Documentation
├── src/                          # Frontend (React + TypeScript)
├── server/                       # Backend (Node.js + Express)
├── .cursor-instructions.md       # Development workflow
└── package.json                  # Dependencies and scripts
```

## 📚 Documentation
- **[Project Overview](docs/01_PROJECT_OVERVIEW.md)** - Comprehensive project documentation
- **[Scoring System](docs/02_HomeScoringSystem.md)** - Scoring system specification
- **[Technical Spec](docs/04_TECH_SPEC.md)** - Technical architecture details
- **[Development Changelog](docs/05_TODO.md)** - Current status and active tasks

## 🤖 For Cursor AI
**IMPORTANT**: See [.cursor-instructions.md](.cursor-instructions.md) for development workflow and best practices. **Always read this file first** when starting a new conversation.

## 🛠️ Available Scripts
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

## 🚀 Getting Started
1. Clone the repository
2. Run `npm install`
3. Run `npm run dev:full`
4. Open http://localhost:3000
5. Import property data from ChatGPT or add manually

## 📖 User Guide
1. **Import Properties**: Paste ChatGPT analysis of Funda listings
2. **Add Scoring Data**: Enter bedroom dimensions, kitchen type, etc.
3. **Calculate Scores**: Get objective scores based on your criteria
4. **Track Progress**: Update viewing status as you visit properties
5. **Make Decisions**: Use scores and notes to compare properties

For detailed documentation, see the [docs/](docs/) folder.