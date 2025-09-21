import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../store/propertyStore';
import { ChatGPTPropertyData } from '../types/Property';

export default function JsonImporter() {
  const [jsonInput, setJsonInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { importFromChatGPT, loading, error } = usePropertyStore();
  const navigate = useNavigate();

  const handleImport = async () => {
    try {
      const chatGPTData: ChatGPTPropertyData = JSON.parse(jsonInput);
      const newProperty = await importFromChatGPT(chatGPTData);
      setJsonInput('');
      setIsOpen(false);
      // Navigate to the detail page of the newly created property
      navigate(`/property/${newProperty.id}`);
    } catch (err) {
      console.error('Invalid JSON:', err);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setJsonInput('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center space-x-2"
      >
        <span>✨</span>
        <span>Import from ChatGPT</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-soft-blue to-soft-purple rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">✨</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Import Property from ChatGPT</h2>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Paste ChatGPT JSON output:
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="input-field h-64 font-mono text-sm resize-none"
            placeholder="Paste the JSON output from ChatGPT here..."
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-pastel-pink border border-soft-pink text-red-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleImport}
            disabled={loading || !jsonInput.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? '⏳ Importing...' : '🚀 Import Property'}
          </button>
          <button
            onClick={handleClose}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
