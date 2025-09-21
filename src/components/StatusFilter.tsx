import { PropertyStatus, getStatusOptions, getStatusConfig } from '../types/PropertyStatus';
import { usePropertyStore } from '../store/propertyStore';

export default function StatusFilter() {
  const { statusFilter, setStatusFilter } = usePropertyStore();

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">Filter by status:</label>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | 'All')}
        className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-soft-blue focus:border-transparent bg-white shadow-soft"
      >
        {getStatusOptions().map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}

export function StatusBadge({ status }: { status: PropertyStatus }) {
  const config = getStatusConfig(status);
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-soft ${config.bgColor} ${config.textColor} ${config.borderColor} border`}>
      <span className="mr-1">{config.emoji}</span>
      {config.label}
    </span>
  );
}
