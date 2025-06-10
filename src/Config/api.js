const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const API_ENDPOINTS = {
  AUTH: {
    SIGN_UP: `${API_BASE_URL}/users`,
    SIGN_IN: `${API_BASE_URL}/users/sign_in`,
    SIGN_OUT: `${API_BASE_URL}/users/sign_out`,
  },
};

// Helper function for API calls
const apiCall = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };

  // Get auth token from storage if it exists
  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
  if (token) {
    defaultOptions.headers["Authorization"] = `Bearer ${token}`;
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      // Try to get error message from response
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          errorData.error ||
          `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

export const authAPI = {
  // Sign up a new user
  signUp: (userData) => {
    return apiCall(API_ENDPOINTS.AUTH.SIGN_UP, {
      method: "POST",
      body: JSON.stringify({ user: userData }),
    });
  },

  // Sign in user
  signIn: (credentials) => {
    return apiCall(API_ENDPOINTS.AUTH.SIGN_IN, {
      method: "POST",
      body: JSON.stringify({ user: credentials }),
    });
  },

  // Sign out user
  signOut: () => {
    return apiCall(API_ENDPOINTS.AUTH.SIGN_OUT, {
      method: "DELETE",
    });
  },
};

export { API_BASE_URL, API_ENDPOINTS, apiCall };
