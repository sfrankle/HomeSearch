import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3002/api';

interface ScoringConfig {
  [key: string]: {
    value: string;
    description: string;
  };
}

interface ScoringBand {
  id: number;
  min_sqm?: number;
  max_sqm?: number | null;
  min_price?: number;
  max_price?: number | null;
  points: number;
  weight: number;
}

interface KitchenPoint {
  id: number;
  kitchen_type: string;
  points: number;
  is_dealbreaker: boolean;
  weight: number;
}

export default function ConfigurationPage() {
  const [config, setConfig] = useState<ScoringConfig>({});
  const [totalAreaBands, setTotalAreaBands] = useState<ScoringBand[]>([]);
  const [budgetBands, setBudgetBands] = useState<ScoringBand[]>([]);
  const [kitchenPoints, setKitchenPoints] = useState<KitchenPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load all configuration data
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const [configRes, areaBandsRes, budgetBandsRes, kitchenRes] = await Promise.all([
        fetch(`${API_BASE_URL}/properties/scoring/config`),
        fetch(`${API_BASE_URL}/properties/scoring/bands/total-area`),
        fetch(`${API_BASE_URL}/properties/scoring/bands/budget`),
        fetch(`${API_BASE_URL}/properties/scoring/kitchen`)
      ]);

      if (configRes.ok) setConfig(await configRes.json());
      if (areaBandsRes.ok) setTotalAreaBands(await areaBandsRes.json());
      if (budgetBandsRes.ok) setBudgetBands(await budgetBandsRes.json());
      if (kitchenRes.ok) setKitchenPoints(await kitchenRes.json());
    } catch (error) {
      console.error('Error loading configuration:', error);
      setMessage({ type: 'error', text: 'Failed to load configuration' });
    } finally {
      setLoading(false);
    }
  };

  const updateConfigValue = async (key: string, value: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/scoring/config/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      });

      if (response.ok) {
        setConfig(prev => ({
          ...prev,
          [key]: { ...prev[key], value }
        }));
        setMessage({ type: 'success', text: 'Configuration updated successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update configuration' });
    }
  };

  const saveAllChanges = async () => {
    try {
      setSaving(true);
      setMessage(null);
      
      // Since individual changes are already saved immediately, 
      // this function mainly serves as a confirmation action
      setMessage({ type: 'success', text: 'All changes have been saved successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all configuration to defaults? This cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/properties/scoring/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configuration reset to defaults' });
        await loadConfiguration();
      } else {
        setMessage({ type: 'error', text: 'Failed to reset configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reset configuration' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soft-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-soft-purple to-soft-pink rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">⚙️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Scoring Configuration</h1>
              <p className="text-gray-600">Configure your property scoring rules and criteria</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={saveAllChanges}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
            <button
              onClick={resetToDefaults}
              disabled={saving}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              {saving ? 'Resetting...' : 'Reset to Defaults'}
            </button>
            <button
              onClick={loadConfiguration}
              className="px-4 py-2 bg-soft-blue text-white rounded-lg hover:bg-soft-blue/90"
            >
              Refresh
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Bedroom Size Configuration */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-2xl">🛏️</span>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Bedroom Size</h2>
            <p className="text-gray-600">Threshold rule - minimum bedroom size requirement</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Size (m²)
            </label>
            <input
              type="number"
              step="0.1"
              value={config.bedroom_min_sqm?.value || ''}
              onChange={(e) => updateConfigValue('bedroom_min_sqm', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-blue focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {config.bedroom_min_sqm?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points Awarded
            </label>
            <input
              type="number"
              value={config.bedroom_points?.value || ''}
              onChange={(e) => updateConfigValue('bedroom_points', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-blue focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {config.bedroom_points?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight Multiplier
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={config.weight_bedroom?.value || ''}
              onChange={(e) => updateConfigValue('weight_bedroom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-blue focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {config.weight_bedroom?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Total Living Area Configuration */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-2xl">📐</span>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Total Living Area</h2>
            <p className="text-gray-600">Threshold rule with configurable scoring bands</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Area (m²)
            </label>
            <input
              type="number"
              step="0.1"
              value={config.total_area_min_sqm?.value || ''}
              onChange={(e) => updateConfigValue('total_area_min_sqm', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-blue focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {config.total_area_min_sqm?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight Multiplier
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={config.weight_total_area?.value || ''}
              onChange={(e) => updateConfigValue('weight_total_area', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-blue focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {config.weight_total_area?.description}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Scoring Bands</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Min (m²)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Max (m²)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Points</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {totalAreaBands.map((band) => (
                  <tr key={band.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{band.min_sqm}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{band.max_sqm || '∞'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{band.points}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{band.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Floor Entrance Configuration */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-2xl">🏢</span>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Floor Entrance</h2>
            <p className="text-gray-600">Dealbreaker rule - maximum floor allowed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Floor
            </label>
            <input
              type="number"
              value={config.floor_max_entrance?.value || ''}
              onChange={(e) => updateConfigValue('floor_max_entrance', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-blue focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {config.floor_max_entrance?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight Multiplier
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={config.weight_floor_entrance?.value || ''}
              onChange={(e) => updateConfigValue('weight_floor_entrance', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-blue focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {config.weight_floor_entrance?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Budget Configuration */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-2xl">💰</span>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Budget</h2>
            <p className="text-gray-600">Weighted scoring based on asking price</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight Multiplier
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="2"
            value={config.weight_budget?.value || ''}
            onChange={(e) => updateConfigValue('weight_budget', e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-blue focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {config.weight_budget?.description}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Price Bands</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Min Price (€)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Max Price (€)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Points</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {budgetBands.map((band) => (
                  <tr key={band.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">€{band.min_price?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {band.max_price ? `€${band.max_price.toLocaleString()}` : '∞'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{band.points}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{band.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Kitchen Layout Configuration */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-2xl">🍳</span>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Kitchen Layout</h2>
            <p className="text-gray-600">Dealbreaker and weighted scoring for kitchen types</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight Multiplier
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="2"
            value={config.weight_kitchen_layout?.value || ''}
            onChange={(e) => updateConfigValue('weight_kitchen_layout', e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soft-blue focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {config.weight_kitchen_layout?.description}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Kitchen Types</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Points</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Dealbreaker</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {kitchenPoints.map((kitchen) => (
                  <tr key={kitchen.id}>
                    <td className="px-4 py-3 text-sm text-gray-900 capitalize">{kitchen.kitchen_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{kitchen.points}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        kitchen.is_dealbreaker 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {kitchen.is_dealbreaker ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{kitchen.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
