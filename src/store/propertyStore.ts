import { create } from 'zustand';
import { Property, CreatePropertyRequest, ChatGPTPropertyData } from '../types/Property';
import { PropertyStatus } from '../types/PropertyStatus';
import { apiService } from '../services/api';

interface PropertyStore {
  properties: Property[];
  loading: boolean;
  error: string | null;
  statusFilter: PropertyStatus | 'All';
  
  // Actions
  fetchProperties: () => Promise<void>;
  createProperty: (property: CreatePropertyRequest) => Promise<void>;
  updateProperty: (id: number, updates: Partial<CreatePropertyRequest>) => Promise<void>;
  deleteProperty: (id: number) => Promise<void>;
  importFromChatGPT: (chatGPTData: ChatGPTPropertyData) => Promise<void>;
  setStatusFilter: (status: PropertyStatus | 'All') => void;
  clearError: () => void;
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  properties: [],
  loading: false,
  error: null,
  statusFilter: 'All',

  fetchProperties: async () => {
    set({ loading: true, error: null });
    try {
      const properties = await apiService.getProperties();
      set({ properties, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch properties',
        loading: false 
      });
    }
  },

  createProperty: async (property: CreatePropertyRequest) => {
    set({ loading: true, error: null });
    try {
      const newProperty = await apiService.createProperty(property);
      set(state => ({ 
        properties: [newProperty, ...state.properties],
        loading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create property',
        loading: false 
      });
    }
  },

  updateProperty: async (id: number, updates: Partial<CreatePropertyRequest>) => {
    set({ loading: true, error: null });
    try {
      const updatedProperty = await apiService.updateProperty(id, updates);
      set(state => ({
        properties: state.properties.map(p => 
          p.id === id ? updatedProperty : p
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update property',
        loading: false 
      });
    }
  },

  deleteProperty: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await apiService.deleteProperty(id);
      set(state => ({
        properties: state.properties.filter(p => p.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete property',
        loading: false 
      });
    }
  },

  importFromChatGPT: async (chatGPTData: ChatGPTPropertyData) => {
    set({ loading: true, error: null });
    try {
      const propertyData = apiService.convertChatGPTData(chatGPTData);
      const newProperty = await apiService.createProperty(propertyData);
      set(state => ({ 
        properties: [newProperty, ...state.properties],
        loading: false 
      }));
      return newProperty; // Return the new property for navigation
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to import property',
        loading: false 
      });
      throw error;
    }
  },

  setStatusFilter: (status: PropertyStatus | 'All') => {
    set({ statusFilter: status });
  },

  clearError: () => {
    set({ error: null });
  },
}));
