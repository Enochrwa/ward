// Move all imports to the top
import { UserProfile, UserProfileUpdate } from '@/types/userTypes';
import { PersonalizedWardrobeSuggestions } from '@/types/recommendationTypes';
import { Feedback, FeedbackCreate } from '@/types/outfitTypes';

// Base URL from environment or fallback
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://wardrobe-system-backend.onrender.com';

// Helper: get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

// Generic API client
interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

const apiClient = async (endpoint: string, options: RequestOptions = {}) => {
  const { method = 'GET', body } = options;
  const token = getAuthToken();

  const headers: Record<string, string> = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  // JSON content-type when needed
  if (body && typeof body === 'object' && !(body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    method,
    headers,
    body: headers['Content-Type'] === 'application/json' && body ? JSON.stringify(body) : body,
  };

  const url = `${BASE_URL}/api${endpoint}`;

  try {
    const res = await fetch(url, config);
    if (res.status === 204) return null;
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = data?.detail || data?.message || data?.error || res.statusText;
      throw new Error(msg);
    }
    return data;
  } catch (err: any) {
    console.error('API Client Error:', err.message);
    throw err;
  }
};

export default apiClient;

// Types
export interface WardrobeItemData {
  name?: string;
  brand?: string;
  category?: string;
  size?: string;
  price?: number;
  material?: string;
  season?: string;
  image_url?: string | null;
  tags?: string[];
  color?: string;
  notes?: string;
  favorite?: boolean;
}

// CRUD for wardrobe items
export const addItem = (itemData: WardrobeItemData, imageFile?: File) => {
  const form = new FormData();
  form.append('item', new Blob([JSON.stringify(itemData)], { type: 'application/json' }));
  if (imageFile) form.append('image', imageFile);
  return apiClient('/wardrobe/items/', { method: 'POST', body: form });
};

export const updateItem = (itemId: string, itemData: WardrobeItemData, imageFile?: File) => {
  const form = new FormData();
  form.append('item_update', new Blob([JSON.stringify(itemData)], { type: 'application/json' }));
  if (imageFile) form.append('image', imageFile);
  return apiClient(`/wardrobe/items/${itemId}`, { method: 'PUT', body: form });
};

// User profile
export const getUserProfile = (): Promise<UserProfile> => apiClient('/profile/me');
export const updateUserProfile = (profileData: UserProfileUpdate): Promise<UserProfile> =>
  apiClient('/profile/me', { method: 'PUT', body: profileData });

// Recommendations
export const getWardrobeSuggestions = (
  latitude?: number,
  longitude?: number
): Promise<PersonalizedWardrobeSuggestions> => {
  const params = new URLSearchParams();
  if (latitude != null) params.append('lat', latitude.toString());
  if (longitude != null) params.append('lon', longitude.toString());
  const query = params.toString();
  return apiClient(`/recommendations/wardrobe/${query ? `?${query}` : ''}`);
};

// Feedback
export const getFeedbackForOutfit = (id: string | number): Promise<Feedback[]> =>
  apiClient(`/community/outfits/${id}/feedback`);

export const addFeedbackToOutfit = (
  id: string | number,
  feedbackData: FeedbackCreate
): Promise<Feedback> => apiClient(`/community/outfits/${id}/feedback`, { method: 'POST', body: feedbackData });

export const deleteFeedback = (feedbackId: number) =>
  apiClient(`/community/feedback/${feedbackId}`, { method: 'DELETE' });
