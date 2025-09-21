import { Property, CreatePropertyRequest, UpdatePropertyRequest, ChatGPTPropertyData } from '../types/Property';

const API_BASE_URL = 'http://localhost:3002/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Properties
  async getProperties(): Promise<Property[]> {
    return this.request<Property[]>('/properties');
  }

  async getProperty(id: number): Promise<Property> {
    return this.request<Property>(`/properties/${id}`);
  }

  async createProperty(property: CreatePropertyRequest): Promise<Property> {
    return this.request<Property>('/properties', {
      method: 'POST',
      body: JSON.stringify(property),
    });
  }

  async updateProperty(id: number, updates: Partial<CreatePropertyRequest>): Promise<Property> {
    return this.request<Property>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProperty(id: number): Promise<void> {
    return this.request<void>(`/properties/${id}`, {
      method: 'DELETE',
    });
  }

  // Import/Export
  async importProperties(properties: CreatePropertyRequest[]): Promise<Property[]> {
    return this.request<Property[]>('/properties/import', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });
  }

  async exportProperties(): Promise<{ properties: Property[]; exportedAt: string }> {
    return this.request<{ properties: Property[]; exportedAt: string }>('/properties/export');
  }

  // Scoring
  async calculatePropertyScore(id: number): Promise<Property> {
    return this.request<Property>(`/properties/${id}/calculate-score`, {
      method: 'POST',
    });
  }

  // Utility function to convert ChatGPT data to our format
  convertChatGPTData(chatGPTData: ChatGPTPropertyData): CreatePropertyRequest {
    return {
      link: chatGPTData.link,
      address: chatGPTData.address,
      price: chatGPTData.price,
      details: chatGPTData.details,
      ownership: chatGPTData.ownership,
      vve: chatGPTData.vve,
      metadata: chatGPTData.metadata,
      status: 'Interested',
    };
  }
}

export const apiService = new ApiService();
