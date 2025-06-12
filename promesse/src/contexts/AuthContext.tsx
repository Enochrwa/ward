import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Interfaces
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

// Default values for context
const defaultAuthState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const AuthContext = createContext<AuthContextType>({
  ...defaultAuthState,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserData(storedToken);
    }
  }, []);

  const fetchUserData = async (currentToken: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData: User = await response.json();
      setUser(userData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      const { access_token: newToken } = await response.json();
      localStorage.setItem('token', newToken);
      setToken(newToken);
      await fetchUserData(newToken);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      // Assuming registration returns token and user or just a success message
      // If it returns token, we can auto-login:
      const responseData = await response.json();
      if (responseData.access_token) {
        localStorage.setItem('token', responseData.access_token);
        setToken(responseData.access_token);
        await fetchUserData(responseData.access_token);
      } else {
        // If no token, perhaps redirect to login or show a message
        // For now, we'll just clear loading and let user login manually
        // Or if it returns user data directly:
        // setUser(responseData.user);
        // setToken(null); // Or handle token separately if provided
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setError(null);
    // Optionally, call backend logout if it exists
    // fetch('/api/logout', { method: 'POST' });
  };

  const authState: AuthState = { user, token, isLoading, error };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
