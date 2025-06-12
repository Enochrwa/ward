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

  try {
    // Assuming all backend API routes are prefixed with /api
    const response = await fetch(`/api${endpoint}`, config);

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
