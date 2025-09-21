import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import ConfigurationPage from './pages/ConfigurationPage'


function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Properties', icon: '🏠' },
    { path: '/configuration', label: 'Configuration', icon: '⚙️' }
  ];

  return (
    <nav className="flex space-x-6">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-soft-blue/10 text-soft-blue'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <header className="bg-white/80 backdrop-blur-sm shadow-soft border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-soft-blue to-soft-purple rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🏠</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">HomeSearch</h1>
                  <p className="text-sm text-gray-500">Your Property Journey</p>
                </div>
              </div>
              <Navigation />
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
            <Route path="/configuration" element={<ConfigurationPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
