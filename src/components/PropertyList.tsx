import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePropertyStore } from '../store/propertyStore';
import { PropertyStatus, getAllStatuses } from '../types/PropertyStatus';
import StatusFilter, { StatusBadge } from './StatusFilter';
import JsonImporter from './JsonImporter';
import { getScoreColorClass, getScoreEmoji } from '../services/scoringService';

export default function PropertyList() {
  const { 
    properties, 
    loading, 
    error, 
    statusFilter, 
    fetchProperties, 
    updateProperty,
    clearError 
  } = usePropertyStore();

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filteredProperties = properties.filter(property => 
    statusFilter === 'All' || property.status === statusFilter
  );

  const handleStatusChange = async (id: number, newStatus: PropertyStatus) => {
    await updateProperty(id, { status: newStatus });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading && properties.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading properties...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <div className="flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Property Listings</h1>
            <p className="text-gray-600">
              {filteredProperties.length} of {properties.length} properties
            </p>
          </div>
          <JsonImporter />
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <StatusFilter />
        </div>
      </div>

      {/* Properties Table */}
      {filteredProperties.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <div className="text-gray-500 text-lg mb-4">
            {properties.length === 0 ? 'No properties yet' : 'No properties match the current filter'}
          </div>
          {properties.length === 0 && (
            <p className="text-gray-400">
              Click "Import from ChatGPT" to add your first property
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProperties.map((property) => (
            <div key={property.id} className="card p-6 hover:shadow-soft-lg transition-all duration-200">
              <Link to={`/property/${property.id}`} className="block">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">
                        {property.address.street} {property.address.house_number}, {property.address.city}
                      </h3>
                      <div className="ml-4 flex-shrink-0">
                        <StatusBadge status={property.status} />
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 space-x-6">
                      <span className="font-bold text-xl text-green-600">
                        {formatPrice(property.price.asking_price_eur)}
                      </span>
                      {property.scoring?.total_score !== undefined && (
                        <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-semibold ${getScoreColorClass(property.scoring.total_score)}`}>
                          <span>{getScoreEmoji(property.scoring.total_score)}</span>
                          <span>{property.scoring.total_score}/10</span>
                        </span>
                      )}
                      {property.details.area_sqm && (
                        <span className="flex items-center space-x-1">
                          <span>📐</span>
                          <span>{property.details.area_sqm} m²</span>
                        </span>
                      )}
                      {property.details.energy_label && (
                        <span className="flex items-center space-x-1">
                          <span>⚡</span>
                          <span>{property.details.energy_label}</span>
                        </span>
                      )}
                      {property.details.year_built && (
                        <span className="flex items-center space-x-1">
                          <span>🏗️</span>
                          <span>{property.details.year_built}</span>
                        </span>
                      )}
                    </div>
                    {property.comments && (
                      <div className="mt-3 p-3 bg-pastel-blue rounded-lg">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {property.comments}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="ml-6 flex-shrink-0">
                    <select
                      value={property.status}
                      onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleStatusChange(property.id, e.target.value as PropertyStatus);
                      }}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-soft-blue focus:border-transparent bg-white shadow-soft"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {getAllStatuses().map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
