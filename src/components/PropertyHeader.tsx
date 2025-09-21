import { Link } from 'react-router-dom';
import { PropertyStatus, getAllStatuses } from '../types/PropertyStatus';
import { StatusBadge } from './StatusFilter';

interface PropertyHeaderProps {
  property: {
    id: number;
    address: {
      street: string;
      house_number: number;
      city: string;
    };
    price: {
      asking_price_eur: number;
    };
    status: PropertyStatus;
  };
  onStatusChange: (status: PropertyStatus) => void;
  onDelete: () => void;
}

/**
 * Property header component with title, price, status, and actions
 * Single Responsibility: Property header display and status management
 */
export function PropertyHeader({ property, onStatusChange, onDelete }: PropertyHeaderProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-8 border-b border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {property.address.street} {property.address.house_number}, {property.address.city}
        </h1>
        <div className="flex items-center gap-6">
          <span className="text-4xl font-bold text-green-600">
            {formatPrice(property.price.asking_price_eur)}
          </span>
          <select
            value={property.status}
            onChange={(e) => onStatusChange(e.target.value as PropertyStatus)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-soft-blue focus:border-transparent bg-white shadow-soft"
          >
            {getAllStatuses().map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
