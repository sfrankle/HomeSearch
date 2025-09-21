// Centralized Property Status definitions with styling information
// This is the single source of truth for all property statuses

export type PropertyStatus = 
  | 'Interested'
  | 'Requested Viewing'
  | 'Viewing Scheduled'
  | 'Viewed'
  | 'Offer Made'
  | 'Rejected'
  | 'Pass';

// Status configuration with styling and metadata
export interface StatusConfig {
  label: string;
  emoji: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
}

export const PROPERTY_STATUS_CONFIG: Record<PropertyStatus, StatusConfig> = {
  'Interested': {
    label: 'Interested',
    emoji: '👀',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    description: 'Property caught your interest'
  },
  'Requested Viewing': {
    label: 'Requested Viewing',
    emoji: '📅',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    description: 'Viewing request sent'
  },
  'Viewing Scheduled': {
    label: 'Viewing Scheduled',
    emoji: '📋',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    description: 'Viewing appointment confirmed'
  },
  'Viewed': {
    label: 'Viewed',
    emoji: '👁️',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    description: 'Property has been viewed'
  },
  'Offer Made': {
    label: 'Offer Made',
    emoji: '💰',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    description: 'Offer submitted'
  },
  'Rejected': {
    label: 'Rejected',
    emoji: '❌',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    description: 'Property rejected'
  },
  'Pass': {
    label: 'Pass',
    emoji: '🚫',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    description: 'Decided to pass on this property'
  }
};

// Helper functions for status management
export const getStatusConfig = (status: PropertyStatus): StatusConfig => {
  return PROPERTY_STATUS_CONFIG[status];
};

export const getAllStatuses = (): PropertyStatus[] => {
  return Object.keys(PROPERTY_STATUS_CONFIG) as PropertyStatus[];
};

export const getStatusOptions = (): Array<PropertyStatus | 'All'> => {
  return ['All', ...getAllStatuses()];
};

// Status badge component props
export interface StatusBadgeProps {
  status: PropertyStatus;
  size?: 'sm' | 'md' | 'lg';
  showEmoji?: boolean;
}
