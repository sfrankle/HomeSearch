# HomeSearch - Project Overview

> **📝 AI-MAINTAINED DOCUMENT**  
> This document is maintained by AI assistants. For user-maintained docs, see files without this header.

## 🏠 What is HomeSearch?

HomeSearch is a **property evaluation and tracking application** designed to help home buyers systematically evaluate and score property listings from Funda.nl. It transforms the subjective process of house hunting into a data-driven, objective scoring system.

## 🎯 Core Purpose

**Problem**: House hunting is overwhelming with many properties to evaluate, and it's easy to lose track of what you've seen, what you liked, and why.

**Solution**: A systematic approach to property evaluation with:
- **Automated scoring** based on your specific criteria
- **Dealbreaker detection** to quickly eliminate unsuitable properties
- **Centralized tracking** of all properties and their scores
- **Visual indicators** for quick decision-making

## 🚀 Key Features

### 1. **Home Scoring System** ⭐
- **Dealbreaker Rules**: Automatically flags properties that don't meet minimum requirements
- **Dynamic Scoring**: Scores calculated on-demand using current configuration
- **Real-time Updates**: Configuration changes immediately affect all property scores
- **Weighted Scoring**: Configurable point system across 5 key criteria
- **Visual Indicators**: Color-coded badges with emojis (🏆⭐👍👌❌)
- **Score Breakdown**: Detailed explanation of why a property scored what it did

### 2. **Property Management** 📋
- **Import from ChatGPT**: Paste Funda listings directly from ChatGPT analysis
- **Manual Data Entry**: Add scoring data (bedroom dimensions, kitchen type, etc.)
- **Status Tracking**: Track viewing progress (Wishlist → Scheduled → Viewed → Offer Made)
- **Comments & Notes**: Add personal observations and notes

### 3. **Smart Data Entry** 📐
- **Length/Width Input**: Enter bedroom dimensions, app calculates m² automatically
- **Room Dimensions**: Track main bedroom and guest room sizes
- **Ownership Details**: Record property ownership type and lease information

### 4. **Visual Interface** 🎨
- **Property List**: Overview with scores, prices, and key details
- **Detail View**: Comprehensive property information with editing capabilities
- **Status Filtering**: Filter by viewing status
- **Responsive Design**: Works on desktop and mobile

## 📊 Scoring System Details

### Dealbreaker Rules (Score = 0 if violated)
- **Bedroom Size**: Main bedroom < 8 m²
- **Total Area**: Property < 77 m²  
- **Floor Height**: ≥ 3rd floor
- **Kitchen Layout**: Closed kitchen (non-relocatable)

### Scoring Criteria (0-10 points each, max 50 points, displayed as 0-10 scale)
1. **Bedroom Size**: 8-10m² (5pts), 10-12m² (7pts), 12-15m² (9pts), 15m²+ (10pts)
2. **Total Area**: 77-79m² (5pts), 80-85m² (7pts), 86-90m² (9pts), 90m²+ (10pts)
3. **Floor**: Parterre-2nd floor (10pts), 3rd+ floor (0pts - dealbreaker)
4. **Budget**: ≤€750k (10pts), €751-790k (5pts), €800k+ (-5pts)
5. **Kitchen**: Open (10pts), Relocatable (5pts), Closed (0pts - dealbreaker)

## 🛠️ Technical Architecture

### Frontend (React + TypeScript)
- **Modern React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for beautiful, responsive styling
- **Zustand** for lightweight state management
- **React Router** for navigation

### Backend (Node.js + Express)
- **Express.js** API server
- **SQLite** database with automatic migrations
- **CORS** enabled for development
- **Helmet** for security headers

### Testing
- **Vitest** testing framework
- **React Testing Library** for component tests
- **Comprehensive coverage**: Unit tests, API tests, component tests, migration tests

## 📁 Project Structure

```
HomeSearch/
├── docs/                          # Documentation
│   ├── PROJECT_OVERVIEW.md       # This file
│   ├── TODO.md                   # Development progress
│   ├── TECH_SPEC.md              # Technical specifications
│   ├── HomeScoringSystem.md      # Scoring system requirements
│   └── JsonDataModel.md          # Data structure documentation
├── src/                          # Frontend source code
│   ├── components/               # React components
│   ├── pages/                    # Page components
│   ├── services/                 # API and scoring services
│   ├── types/                    # TypeScript type definitions
│   ├── store/                    # Zustand state management
│   └── test/                     # Test files
├── server/                       # Backend source code
│   ├── routes/                   # API routes
│   ├── database/                 # Database management
│   └── services/                 # Backend services
└── package.json                  # Dependencies and scripts
```

## 🚀 Getting Started

For quick start instructions, see the [README.md](../README.md) in the project root.

## 📈 Current Status

✅ **COMPLETE & FULLY FUNCTIONAL WITH v1.2 SCORING SYSTEM**

### 🎯 Implementation Status (Jan 2025)
- ✅ **v1.2 Scoring System**: Database-driven configurable scoring fully implemented
- ✅ **API Endpoints**: Complete CRUD operations for scoring configuration
- ✅ **Database Schema**: All configuration tables created and seeded
- ✅ **Frontend Integration**: Updated to handle new scoring format
- ✅ **Backward Compatibility**: Legacy `total_score` field maintained
- ✅ **UI Improvements**: Enhanced navigation, dealbreaker styling, text readability
- ✅ **Configuration Page**: Full UI for editing all scoring rules and bands
- ✅ **Dynamic Scoring**: Scores calculated on-demand using current configuration
- ✅ **Test Coverage**: All tests updated and passing for v1.2 system

### 🤖 For Cursor AI
- **Workflow**: See `.cursor-instructions.md` for development guidelines
- **Current Status**: Check `docs/05_TODO.md` changelog for active tasks
- **Quick Start**: Read docs → Update changelog → Work → Update changelog

### ✅ Implemented Features
- **Home Scoring System v1.2**: Database-driven configurable scoring with dynamic rules
- **Property Management**: Full CRUD operations with nested data structure
- **ChatGPT Integration**: Import property data from ChatGPT analysis
- **Visual Interface**: Beautiful, responsive UI with scoring indicators
- **Database Migrations**: Automatic schema updates
- **Comprehensive Testing**: Full test coverage for all components
- **Room Dimensions**: Track bedroom sizes with automatic area calculation
- **Configurable Scoring**: API endpoints for editing scoring rules and bands
- **Configuration Page**: Full UI for editing all scoring rules, bands, and weights
- **Dynamic Scoring**: Real-time score calculation using current configuration
- **Test Suite**: Updated and comprehensive tests for v1.2 system

### 🔄 Ready for Use
The application is production-ready with:
- Robust error handling
- Data persistence
- Responsive design
- Comprehensive testing
- Clear documentation

## 🎯 Use Cases

### For Home Buyers
1. **Import Properties**: Paste ChatGPT analysis of Funda listings
2. **Add Scoring Data**: Enter bedroom dimensions, kitchen type, etc.
3. **Calculate Scores**: Get objective scores based on your criteria
4. **Track Progress**: Update viewing status as you visit properties
5. **Make Decisions**: Use scores and notes to compare properties

### For Developers
1. **Extend Scoring Rules**: Add new criteria or modify existing ones
2. **Add Features**: Implement new functionality (comparison, export, etc.)
3. **Customize UI**: Modify styling and layout
4. **Integrate APIs**: Connect to real estate APIs

## 🔮 Future Enhancements

### Short Term
- **Manual Property Entry**: Form for adding properties without ChatGPT
- **Property Comparison**: Side-by-side comparison view
- **Export Functionality**: Export data to CSV/Excel

### Long Term
- **Real-time Funda Integration**: Direct API connection
- **Advanced Scoring**: Location-based scoring, commute optimization
- **Mobile App**: React Native version
- **Multi-user Support**: User accounts and sharing

## 📚 Documentation

- **[TODO.md](TODO.md)**: Development progress and current status
- **[TECH_SPEC.md](TECH_SPEC.md)**: Technical architecture and implementation details
- **[HomeScoringSystem.md](HomeScoringSystem.md)**: Scoring system requirements and rules
- **[JsonDataModel.md](JsonDataModel.md)**: Data structure and API documentation

## 🤝 Contributing

The project is well-documented and tested, making it easy to:
- Add new features
- Modify scoring rules
- Improve the UI/UX
- Add integrations

All code follows modern best practices with comprehensive testing and clear documentation.

### For Developers
- **Quick Start**: See [README.md](../README.md) for installation and development setup
- **Development Workflow**: See [.cursor-instructions.md](../.cursor-instructions.md) for guidelines
- **Current Status**: Check [Development Changelog](05_TODO.md) for active tasks

---

**HomeSearch** - Making house hunting systematic, objective, and efficient. 🏠✨
