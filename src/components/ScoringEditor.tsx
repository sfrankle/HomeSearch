import { useState } from 'react';
import { getScoreColorClass, getScoreEmoji } from '../services/scoringService';

interface ScoringEditorProps {
  property: {
    id: number;
    scoring?: {
      total_score?: number;
      score_breakdown?: Record<string, { score: number; reason: string }>;
      main_bedroom_sqm?: number;
      kitchen_type?: string;
      foundation_status?: string;
      street_noise?: string;
      smelly_business_below?: boolean;
      commute_time_central_min?: number;
      commute_time_mark_min?: number;
      commute_time_sarah_min?: number;
      workspace_count?: number;
      viewing_status?: string;
    };
  };
  onSave: (scoring: any) => void;
}

/**
 * Scoring editor component for editing property scoring data
 * Single Responsibility: Scoring data editing and display
 */
export function ScoringEditor({ property, onSave }: ScoringEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedScoring, setEditedScoring] = useState({
    main_bedroom_sqm: property.scoring?.main_bedroom_sqm?.toString() || '',
    main_bedroom_length: '',
    main_bedroom_width: '',
    kitchen_type: property.scoring?.kitchen_type || '',
    foundation_status: property.scoring?.foundation_status || '',
    street_noise: property.scoring?.street_noise || '',
    smelly_business_below: property.scoring?.smelly_business_below || false,
    commute_time_central_min: property.scoring?.commute_time_central_min?.toString() || '',
    commute_time_mark_min: property.scoring?.commute_time_mark_min?.toString() || '',
    commute_time_sarah_min: property.scoring?.commute_time_sarah_min?.toString() || '',
    workspace_count: property.scoring?.workspace_count?.toString() || '',
    viewing_status: property.scoring?.viewing_status || '',
  });

  const handleSave = async () => {
    // Calculate main bedroom m² from length and width if provided
    let mainBedroomSqm = undefined;
    if (editedScoring.main_bedroom_length && editedScoring.main_bedroom_width) {
      const length = parseFloat(editedScoring.main_bedroom_length);
      const width = parseFloat(editedScoring.main_bedroom_width);
      if (!isNaN(length) && !isNaN(width)) {
        mainBedroomSqm = length * width;
      }
    } else if (editedScoring.main_bedroom_sqm) {
      mainBedroomSqm = parseFloat(editedScoring.main_bedroom_sqm);
    }

    const scoring = {
      main_bedroom_sqm: mainBedroomSqm,
      kitchen_type: editedScoring.kitchen_type as 'open' | 'relocatable' | 'closed' | undefined,
      foundation_status: editedScoring.foundation_status as 'ok' | 'unknown' | 'concern' | undefined,
      street_noise: editedScoring.street_noise as 'quiet' | 'medium' | 'noisy' | undefined,
      smelly_business_below: editedScoring.smelly_business_below,
      commute_time_central_min: editedScoring.commute_time_central_min ? parseInt(editedScoring.commute_time_central_min) : undefined,
      commute_time_mark_min: editedScoring.commute_time_mark_min ? parseInt(editedScoring.commute_time_mark_min) : undefined,
      commute_time_sarah_min: editedScoring.commute_time_sarah_min ? parseInt(editedScoring.commute_time_sarah_min) : undefined,
      workspace_count: editedScoring.workspace_count ? parseInt(editedScoring.workspace_count) : undefined,
      viewing_status: editedScoring.viewing_status as 'wishlist' | 'scheduled' | 'viewed' | 'offer_made' | undefined,
    };

    await onSave(scoring);
    setIsEditing(false);
  };

  return (
    <div className="card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <span>📊</span>
            <span>Scoring System</span>
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-soft-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              ✏️ Edit Scoring Data
            </button>
          )}
        </div>

        {/* Score Display */}
        {property.scoring && (property.scoring.total_score !== undefined || property.scoring.score_normalized !== undefined) ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-gray-700">Overall Score</span>
              <div className={`px-4 py-2 rounded-lg text-lg font-bold flex items-center space-x-2 ${
                (property.scoring.score_normalized || property.scoring.total_score) === 0 
                  ? 'text-red-600 bg-red-100 border-2 border-red-300' 
                  : getScoreColorClass(property.scoring.score_normalized || property.scoring.total_score)
              }`}>
                <span>{getScoreEmoji(property.scoring.score_normalized || property.scoring.total_score)}</span>
                <span>{property.scoring.score_normalized || property.scoring.total_score}/10</span>
              </div>
            </div>

            {/* Score Breakdown */}
            {property.scoring.score_breakdown && (
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Score Breakdown</h4>
                <div className="space-y-2">
                  {Object.entries(property.scoring.score_breakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 capitalize">
                        {key.replace('_', ' ')}: {value.reason}
                      </span>
                      <span className={`font-semibold px-2 py-1 rounded ${
                        value.score === 0 
                          ? 'text-red-600 bg-red-100 border border-red-300' 
                          : value.score > 0 
                            ? 'text-green-600 bg-green-100' 
                            : 'text-red-600 bg-red-100'
                      }`}>
                        {value.score > 0 ? '+' : ''}{value.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg text-center mb-6">
            <p className="text-gray-500 italic mb-3">No score calculated yet.</p>
            <p className="text-sm text-gray-400">Click "Edit Scoring Data" to add data and calculate the score.</p>
          </div>
        )}

        {/* Scoring Data Form */}
        {isEditing && (
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-4">📝 Scoring Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main Bedroom Dimensions */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-2">Main Bedroom Dimensions</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Length (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editedScoring.main_bedroom_length}
                      onChange={(e) => setEditedScoring(prev => ({ ...prev, main_bedroom_length: e.target.value }))}
                      className="input-field"
                      placeholder="e.g. 4.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Width (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editedScoring.main_bedroom_width}
                      onChange={(e) => setEditedScoring(prev => ({ ...prev, main_bedroom_width: e.target.value }))}
                      className="input-field"
                      placeholder="e.g. 3.2"
                    />
                  </div>
                </div>
                {editedScoring.main_bedroom_length && editedScoring.main_bedroom_width && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">
                      Area: {(parseFloat(editedScoring.main_bedroom_length) * parseFloat(editedScoring.main_bedroom_width)).toFixed(1)} m²
                    </span>
                  </div>
                )}
              </div>

              {/* Kitchen Type */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Kitchen Type</label>
                <select
                  value={editedScoring.kitchen_type}
                  onChange={(e) => setEditedScoring(prev => ({ ...prev, kitchen_type: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Select kitchen type</option>
                  <option value="open">Open</option>
                  <option value="relocatable">Relocatable</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Foundation Status */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Foundation Status</label>
                <select
                  value={editedScoring.foundation_status}
                  onChange={(e) => setEditedScoring(prev => ({ ...prev, foundation_status: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Select foundation status</option>
                  <option value="ok">OK</option>
                  <option value="unknown">Unknown</option>
                  <option value="concern">Concern</option>
                </select>
              </div>

              {/* Street Noise */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Street Noise</label>
                <select
                  value={editedScoring.street_noise}
                  onChange={(e) => setEditedScoring(prev => ({ ...prev, street_noise: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Select noise level</option>
                  <option value="quiet">Quiet</option>
                  <option value="medium">Medium</option>
                  <option value="noisy">Noisy</option>
                </select>
              </div>

              {/* Smelly Business Below */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Smelly Business Below</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editedScoring.smelly_business_below}
                    onChange={(e) => setEditedScoring(prev => ({ ...prev, smelly_business_below: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">Yes</span>
                </div>
              </div>

              {/* Commute Time */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Commute Time to Central (min)</label>
                <input
                  type="number"
                  value={editedScoring.commute_time_central_min}
                  onChange={(e) => setEditedScoring(prev => ({ ...prev, commute_time_central_min: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. 25"
                />
              </div>

              {/* Workspace Count */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Workspace Count</label>
                <input
                  type="number"
                  value={editedScoring.workspace_count}
                  onChange={(e) => setEditedScoring(prev => ({ ...prev, workspace_count: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. 2"
                />
              </div>

              {/* Viewing Status */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Viewing Status</label>
                <select
                  value={editedScoring.viewing_status}
                  onChange={(e) => setEditedScoring(prev => ({ ...prev, viewing_status: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Select viewing status</option>
                  <option value="wishlist">Wishlist</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="viewed">Viewed</option>
                  <option value="offer_made">Offer Made</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-soft-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Save Scoring Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
