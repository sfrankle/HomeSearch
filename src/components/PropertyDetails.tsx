interface PropertyDetailsProps {
  property: {
    details: {
      area_sqm?: number;
      energy_label?: string;
      floor_info?: string;
      year_built?: number;
    };
    vve: {
      monthly_fee_eur?: number;
    };
    ownership: {
      type?: string;
      lease_details?: string;
      perceel?: string | null;
    };
  };
}

/**
 * Property details component showing basic property information
 * Single Responsibility: Property details display
 */
export function PropertyDetails({ property }: PropertyDetailsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Basic Info */}
      <div className="bg-pastel-blue p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <span>🏠</span>
          <span>Property Details</span>
        </h3>
        <dl className="space-y-3">
          {property.details.area_sqm && (
            <div className="flex justify-between items-center">
              <dt className="text-sm font-medium text-gray-600">Size</dt>
              <dd className="text-sm font-semibold text-gray-800">{property.details.area_sqm} m²</dd>
            </div>
          )}
          {property.details.energy_label && (
            <div className="flex justify-between items-center">
              <dt className="text-sm font-medium text-gray-600">Energy Label</dt>
              <dd className="text-sm font-semibold text-gray-800">{property.details.energy_label}</dd>
            </div>
          )}
          {property.details.floor_info && (
            <div className="flex justify-between items-center">
              <dt className="text-sm font-medium text-gray-600">Floor</dt>
              <dd className="text-sm font-semibold text-gray-800">{property.details.floor_info}</dd>
            </div>
          )}
          {property.details.year_built && (
            <div className="flex justify-between items-center">
              <dt className="text-sm font-medium text-gray-600">Year Built</dt>
              <dd className="text-sm font-semibold text-gray-800">{property.details.year_built}</dd>
            </div>
          )}
          {property.vve.monthly_fee_eur && (
            <div className="flex justify-between items-center">
              <dt className="text-sm font-medium text-gray-600">VvE Monthly Cost</dt>
              <dd className="text-sm font-semibold text-gray-800">
                {formatPrice(property.vve.monthly_fee_eur)}/month
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Ownership Information */}
      {(property.ownership.type || property.ownership.lease_details || property.ownership.perceel) && (
        <div className="bg-pastel-green p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <span>📋</span>
            <span>Ownership</span>
          </h3>
          <dl className="space-y-3">
            {property.ownership.type && (
              <div className="flex justify-between items-center">
                <dt className="text-sm font-medium text-gray-600">Type</dt>
                <dd className="text-sm font-semibold text-gray-800">{property.ownership.type}</dd>
              </div>
            )}
            {property.ownership.lease_details && (
              <div className="flex justify-between items-center">
                <dt className="text-sm font-medium text-gray-600">Lease Details</dt>
                <dd className="text-sm font-semibold text-gray-800">{property.ownership.lease_details}</dd>
              </div>
            )}
            {property.ownership.perceel && (
              <div className="flex justify-between items-center">
                <dt className="text-sm font-medium text-gray-600">Parcel</dt>
                <dd className="text-sm font-semibold text-gray-800">{property.ownership.perceel}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
