# User Stories - HomeSearch App

## Epic 1: Property Data Management

### Story 1.1: Import Property Data
**As a** home buyer  
**I want to** import property data from funda.nl via ChatGPT  
**So that** I can quickly add properties to my tracking list

**Acceptance Criteria:**
- ChatGPT returns structured JSON with all required fields
- JSON includes: price, address, square meters, energy label, ground lease info, VvE costs, floor, year built
- User can paste JSON directly into the app
- App validates and creates property listing from JSON

### Story 1.2: Manual Property Entry
**As a** home buyer  
**I want to** manually enter property information  
**So that** I can add properties even without ChatGPT assistance

**Acceptance Criteria:**
- Form with all required property fields
- Validation for required fields
- Save functionality creates new property listing

## Epic 2: Property Viewing

### Story 2.1: Property List View
**As a** home buyer  
**I want to** see all my tracked properties in a list  
**So that** I can quickly overview my options

**Acceptance Criteria:**
- Table/list view showing key property information
- Sortable columns (price, date added, status)
- Pagination for large lists
- Quick status indicators

### Story 2.2: Property Detail View
**As a** home buyer  
**I want to** see detailed information about a specific property  
**So that** I can make informed decisions

**Acceptance Criteria:**
- Detailed view with all property information
- Editable fields for updates
- Comments section
- Status management
- Navigation back to list

## Epic 3: Status Management

### Story 3.1: Property Status Tracking
**As a** home buyer  
**I want to** track the status of each property  
**So that** I can organize my search process

**Acceptance Criteria:**
- Status field with predefined options
- Editable status from both list and detail views
- Status change history/timestamps
- Visual status indicators

### Story 3.2: Status Filtering
**As a** home buyer  
**I want to** filter properties by status  
**So that** I can focus on relevant properties

**Acceptance Criteria:**
- Filter dropdown with all status options
- "All" option to show all properties
- Filter persists during session
- Clear filter option

## Epic 4: Comments & Notes

### Story 4.1: Property Comments
**As a** home buyer  
**I want to** add comments to properties  
**So that** I can remember important details

**Acceptance Criteria:**
- Comments field in detail view
- Rich text or simple text input
- Comments saved with timestamps
- Comments visible in list view (truncated)

## Epic 5: Data Management

### Story 5.1: Data Persistence
**As a** home buyer  
**I want to** have my data saved automatically  
**So that** I don't lose my property information

**Acceptance Criteria:**
- All data persisted to database
- Auto-save on changes
- Data survives browser refresh
- Backup/export functionality

### Story 5.2: Data Import/Export
**As a** home buyer  
**I want to** backup and restore my data  
**So that** I can protect my property research

**Acceptance Criteria:**
- Export all data to JSON
- Import data from JSON
- Data validation on import
- Clear confirmation messages
