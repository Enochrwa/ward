// Not using useAuth here as this is not a React component/hook.
// Directly accessing localStorage for the token.

const getAuthToken = () => {
  // Ensure this key matches what's used in AuthContext.tsx
  return localStorage.getItem('token');
};

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any; // Can be string, FormData, or an object to be stringified
}

const apiClient = async (endpoint: string, options: RequestOptions = {}) => {
  const { method = 'GET', body } = options;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set Content-Type to application/json if body is an object and not FormData
  if (body && typeof body !== 'string' && !(body instanceof FormData) && !(options.headers && options.headers['Content-Type'])) {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    method,
    headers,
    // Stringify body if it's an object and Content-Type is application/json
    body: (body && headers['Content-Type'] === 'application/json') ? JSON.stringify(body) : body,
  };

  // Determine the base URL
  const VITE_BASE_URL = 'http://localhost:8000' || '';
  const finalApiUrl = VITE_BASE_URL ? `${VITE_BASE_URL}/api${endpoint}` : `/api${endpoint}`;

  try {
    const response = await fetch(finalApiUrl, config);

    if (response.status === 204) { // Handle No Content responses
      return null;
    }

    const responseData = await response.json().catch(() => {
      // Handle cases where response.json() fails (e.g. non-JSON error response from server)
      // This might happen if server returns plain text for some errors
      if (!response.ok) { // Only throw if not ok and json parsing failed
          throw new Error(response.statusText || 'API request failed, no JSON error body');
      }
      return null; // If response is ok but no json body (e.g. a GET request that could return 200 with no body)
    });

    if (!response.ok) {
      // Prefer 'detail' from FastAPI errors, then 'message', then default
      const errorMessage = responseData?.detail || responseData?.message || responseData?.error || `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error: any) {
    console.error('API Client Error:', error.message);
    // Re-throw the error so it can be caught by the calling function
    throw error;
  }
};

export default apiClient;

// Specific types that might be used by the new functions.
// Ideally, these would be imported from a central types file.
// For now, mirroring based on WardrobeManager.tsx and backend expectations.
export interface WardrobeItemData { // Generic enough for create/update data part
  name?: string;
  brand?: string;
  category?: string;
  size?: string;
  price?: number;
  material?: string;
  season?: string;
  image_url?: string | null; // Allow null for removal
  tags?: string[];
  color?: string;
  notes?: string;
  favorite?: boolean; // For updates
}


export const addItem = async (itemData: WardrobeItemData, imageFile?: File) => {
  const formData = new FormData();
  // Backend expects the Pydantic model as 'item' for create
  formData.append('item', new Blob([JSON.stringify(itemData)], { type: 'application/json' }));

  if (imageFile) {
    formData.append('image', imageFile);
  }

  // The generic apiClient will handle token and base URL.
  // It should not set Content-Type to application/json for FormData.
  return apiClient('/wardrobe/items/', {
    method: 'POST',
    body: formData,
    // Content-Type header will be set automatically by browser for FormData
  });
};

export const updateItem = async (itemId: string, itemData: WardrobeItemData, imageFile?: File) => {
  const formData = new FormData();
  // Backend expects the Pydantic model as 'item_update' for update
  formData.append('item_update', new Blob([JSON.stringify(itemData)], { type: 'application/json' }));

  if (imageFile) {
    formData.append('image', imageFile);
  }
  // If image_url is explicitly null, it's handled by itemData.image_url = null being stringified.
  // The backend will interpret this.

  return apiClient(`/wardrobe/items/${itemId}`, {
    method: 'PUT',
    body: formData,
    // Content-Type header will be set automatically by browser for FormData
  });
};

// User Profile API functions
import { UserProfile, UserProfileUpdate } from '@/types/userTypes'; // Adjust path as necessary

export const getUserProfile = async (): Promise<UserProfile> => {
  return apiClient('/profile/me', {
    method: 'GET',
  });
};

export const updateUserProfile = async (profileData: UserProfileUpdate): Promise<UserProfile> => {
  return apiClient('/profile/me', {
    method: 'PUT',
    body: profileData, // apiClient handles JSON stringification
  });
};
// Note: The backend's PUT /profile/me handles creation if profile doesn't exist.

// Recommendation API functions
import { PersonalizedWardrobeSuggestions } from '@/types/recommendationTypes'; // Assuming this type exists or will be created

export const getWardrobeSuggestions = async (latitude?: number, longitude?: number): Promise<PersonalizedWardrobeSuggestions> => {
  let endpoint = '/recommendations/wardrobe/';
  const params = new URLSearchParams();
  if (latitude !== undefined) {
    params.append('lat', latitude.toString());
  }
  if (longitude !== undefined) {
    params.append('lon', longitude.toString());
  }
  const queryString = params.toString();
  if (queryString) {
    endpoint += `?${queryString}`;
  }

  return apiClient(endpoint, {
    method: 'GET',
  });
};


// Feedback API functions
import { Feedback, FeedbackCreate } from '@/types/outfitTypes'; // Adjust path as necessary

export const getFeedbackForOutfit = async (outfitId: string | number): Promise<Feedback[]> => {
  return apiClient(`/community/outfits/${outfitId}/feedback`, {
    method: 'GET',
  });
};

export const addFeedbackToOutfit = async (outfitId: string | number, feedbackData: FeedbackCreate): Promise<Feedback> => {
  return apiClient(`/community/outfits/${outfitId}/feedback`, {
    method: 'POST',
    body: feedbackData,
  });
};

export const deleteFeedback = async (feedbackId: number): Promise<void> => {
  return apiClient(`/community/feedback/${feedbackId}`, {
    method: 'DELETE',
  });
};
