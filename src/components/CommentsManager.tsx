import { useState } from 'react';

interface CommentsManagerProps {
  property: {
    id: number;
    comments?: string;
    createdAt: string;
    updatedAt: string;
    link?: string;
  };
  onSave: (comments: string) => void;
}

/**
 * Comments manager component for editing and displaying property comments
 * Single Responsibility: Comments editing and display
 */
export function CommentsManager({ property, onSave }: CommentsManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComments, setEditedComments] = useState(property.comments || '');

  const handleSave = async () => {
    await onSave(editedComments);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedComments(property.comments || '');
  };

  return (
    <div className="space-y-8">
      {/* Comments */}
      <div className="bg-pastel-yellow p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <span>💭</span>
            <span>Comments</span>
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              ✏️ Edit
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editedComments}
              onChange={(e) => setEditedComments(e.target.value)}
              className="input-field"
              rows={4}
              placeholder="Add your comments about this property..."
            />
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="btn-primary"
              >
                💾 Save
              </button>
              <button
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white rounded-lg">
            {property.comments ? (
              <p className="text-gray-800 whitespace-pre-wrap">{property.comments}</p>
            ) : (
              <p className="text-gray-500 italic">No comments yet. Click "Edit" to add some.</p>
            )}
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="pt-6 border-t border-gray-200">
        <div className="bg-pastel-lavender p-4 rounded-lg">
          <div className="text-sm text-gray-600 space-y-1">
            <p>📅 Created: {new Date(property.createdAt).toLocaleDateString()}</p>
            <p>🔄 Last updated: {new Date(property.updatedAt).toLocaleDateString()}</p>
            {property.link && (
              <p>
                <a 
                  href={property.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-soft-blue hover:text-soft-purple font-medium"
                >
                  🔗 View on Funda →
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
