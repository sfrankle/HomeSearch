import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../store/propertyStore';
import { PropertyStatus } from '../types/PropertyStatus';
import { StatusBadge } from '../components/StatusFilter';
import { PropertyHeader } from '../components/PropertyHeader';
import { PropertyDetails } from '../components/PropertyDetails';
import { ScoringEditor } from '../components/ScoringEditor';
import { CommentsManager } from '../components/CommentsManager';
import { apiService } from '../services/api';

/**
 * Refactored PropertyDetailPage using smaller, focused components
 * Single Responsibility: Page coordination and navigation
 */
export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { properties, updateProperty, deleteProperty, loading, fetchProperties } = usePropertyStore();

  const property = properties.find(p => p.id === parseInt(id || '0'));

  useEffect(() => {
    // If property is not in store (e.g., after refresh), fetch it
    if (!property && id) {
      fetchProperties();
    }
  }, [id, property]);

  const handleStatusChange = async (newStatus: PropertyStatus) => {
    if (!property) return;
    await updateProperty(property.id, { status: newStatus });
  };

  const handleScoringSave = async (scoring: any) => {
    if (!property) return;
    await updateProperty(property.id, { scoring });
    
    // Recalculate score after updating scoring data
    try {
      const updatedProperty = await apiService.calculatePropertyScore(property.id);
      updateProperty(property.id, updatedProperty);
    } catch (error) {
      console.error('Error recalculating score:', error);
    }
  };

  const handleCommentsSave = async (comments: string) => {
    if (!property) return;
    await updateProperty(property.id, { comments });
  };

  const handleDelete = async () => {
    if (!property) return;
    if (window.confirm('Are you sure you want to delete this property?')) {
      await deleteProperty(property.id);
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-8 text-center">
          <div className="text-lg text-gray-600">Loading property details...</div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-8 text-center">
          <div className="text-lg text-gray-600 mb-4">Property not found</div>
          <Link to="/" className="text-soft-blue hover:text-soft-purple font-medium">
            ← Back to Property List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-soft-blue hover:text-soft-purple flex items-center space-x-2 font-medium">
            <span>←</span>
            <span>Back to Property List</span>
          </Link>
          <div className="flex items-center gap-3">
            <StatusBadge status={property.status} />
            <button
              onClick={handleDelete}
              className="bg-pastel-pink text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-soft-pink transition-colors"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* Property Header */}
      <PropertyHeader
        property={property}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />

      {/* Property Details */}
      <div className="card">
        <div className="p-8">
          <PropertyDetails property={property} />
        </div>
      </div>

      {/* Scoring Editor */}
      <ScoringEditor
        property={property}
        onSave={handleScoringSave}
      />

      {/* Comments Manager */}
      <CommentsManager
        property={property}
        onSave={handleCommentsSave}
      />
    </div>
  );
}