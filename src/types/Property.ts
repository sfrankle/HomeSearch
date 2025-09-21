// Import centralized PropertyStatus from dedicated file
import { PropertyStatus } from './PropertyStatus';

export interface Property {
  id: number;
  link?: string;
  address: {
    street: string;
    house_number: number;
    postal_code: string;
    city: string;
  };
  price: {
    asking_price_eur: number;
  };
  details: {
    area_sqm?: number;
    floor_info?: string;
    year_built?: number;
    energy_label?: string;
  };
  ownership: {
    type?: string;
    lease_details?: string;
    perceel?: string | null;
  };
  vve: {
    monthly_fee_eur?: number;
  };
  metadata: {
    source: string;
    date_added: string;
  };
  roomDimensions?: {
    mainBedroom?: {
      longEdge?: number;
      shortEdge?: number;
    };
    guestRoom?: {
      longEdge?: number;
      shortEdge?: number;
    };
  };
  status: PropertyStatus;
  comments?: string;
  scoring?: {
    main_bedroom_sqm?: number;
    kitchen_type?: 'open' | 'relocatable' | 'closed';
    foundation_status?: 'ok' | 'unknown' | 'concern';
    street_noise?: 'quiet' | 'medium' | 'noisy';
    smelly_business_below?: boolean;
    commute_time_central_min?: number;
    commute_time_mark_min?: number;
    commute_time_sarah_min?: number;
    workspace_count?: number;
    viewing_status?: 'wishlist' | 'scheduled' | 'viewed' | 'offer_made';
    notes?: string;
    // v1.2 scoring fields
    score_raw?: number;
    score_max_possible?: number;
    score_normalized?: number;
    dealbreakers?: string[];
    // Legacy field for backward compatibility
    total_score?: number;
    score_breakdown?: {
      bedroom_size?: { score: number; reason: string };
      total_area?: { score: number; reason: string };
      floor_entrance?: { score: number; reason: string };
      budget?: { score: number; reason: string };
      kitchen_layout?: { score: number; reason: string };
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyRequest {
  link?: string;
  address: {
    street: string;
    house_number: number;
    postal_code: string;
    city: string;
  };
  price: {
    asking_price_eur: number;
  };
  details: {
    area_sqm?: number;
    floor_info?: string;
    year_built?: number;
    energy_label?: string;
  };
  ownership: {
    type?: string;
    lease_details?: string;
    perceel?: string | null;
  };
  vve: {
    monthly_fee_eur?: number;
  };
  metadata: {
    source: string;
    date_added: string;
  };
  roomDimensions?: {
    mainBedroom?: {
      longEdge?: number;
      shortEdge?: number;
    };
    guestRoom?: {
      longEdge?: number;
      shortEdge?: number;
    };
  };
  status?: PropertyStatus;
  comments?: string;
  scoring?: {
    main_bedroom_sqm?: number;
    kitchen_type?: 'open' | 'relocatable' | 'closed';
    foundation_status?: 'ok' | 'unknown' | 'concern';
    street_noise?: 'quiet' | 'medium' | 'noisy';
    smelly_business_below?: boolean;
    commute_time_central_min?: number;
    commute_time_mark_min?: number;
    commute_time_sarah_min?: number;
    workspace_count?: number;
    viewing_status?: 'wishlist' | 'scheduled' | 'viewed' | 'offer_made';
    notes?: string;
    // v1.2 scoring fields
    score_raw?: number;
    score_max_possible?: number;
    score_normalized?: number;
    dealbreakers?: string[];
    // Legacy field for backward compatibility
    total_score?: number;
    score_breakdown?: {
      bedroom_size?: { score: number; reason: string };
      total_area?: { score: number; reason: string };
      floor_entrance?: { score: number; reason: string };
      budget?: { score: number; reason: string };
      kitchen_layout?: { score: number; reason: string };
    };
  };
}

export interface ChatGPTPropertyData {
  id: number;
  link: string;
  address: {
    street: string;
    house_number: number;
    postal_code: string;
    city: string;
  };
  price: {
    asking_price_eur: number;
  };
  details: {
    area_sqm?: number;
    floor_info?: string;
    year_built?: number;
    energy_label?: string;
  };
  ownership: {
    type?: string;
    lease_details?: string;
    perceel?: string | null;
  };
  vve: {
    monthly_fee_eur?: number;
  };
  metadata: {
    source: string;
    date_added: string;
  };
}

export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {
  id: number;
}
