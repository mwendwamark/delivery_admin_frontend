// --- api.js ---

// Define and export API_BASE_URL directly at the top
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Define API_ENDPOINTS, which now correctly uses the exported API_BASE_URL
const API_ENDPOINTS = {
  AUTH: {
    SIGN_UP: `${API_BASE_URL}/users`,
    SIGN_IN: `${API_BASE_URL}/users/sign_in`,
    SIGN_OUT: `${API_BASE_URL}/users/sign_out`,
  },
  PRODUCTS: `${API_BASE_URL}/products`,
  PRODUCT_VARIANTS: (productId) =>
    `${API_BASE_URL}/products/${productId}/product_variants`,
  INDIVIDUAL_PRODUCT_VARIANT: (variantId) =>
    `${API_BASE_URL}/product_variants/${variantId}`,
};

// Helper function for API calls
const apiCall = async (url, options = {}) => {
  // ... (rest of your apiCall function)
  const defaultOptions = {
    headers: {
      Accept: "application/json",
    },
  };

  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

  if (token) {
    defaultOptions.headers["Authorization"] = `Bearer ${token}`;
  }

  const isFormData = options.body instanceof FormData;

  if (!isFormData) {
    defaultOptions.headers["Content-Type"] = "application/json";

    if (options.body && typeof options.body !== "string") {
      options.body = JSON.stringify(options.body);
    }
  } else {
    delete defaultOptions.headers["Content-Type"];
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
      const errorData = await response.json().catch(() => ({}));

      throw new Error(
        errorData.message ||
          errorData.error ||
          (errorData.errors
            ? Object.values(errorData.errors).flat().join(", ")
            : `HTTP error! status: ${response.status}`)
      );
    }

    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("API call failed:", error);

    throw error;
  }
};

// Export authAPI and productsAPI as you already have them
export const authAPI = {
  // ... (your authAPI code)
  signUp: (userData) => {
    return apiCall(API_ENDPOINTS.AUTH.SIGN_UP, {
      method: "POST",

      body: { user: userData },
    });
  },

  signIn: (credentials) => {
    return apiCall(API_ENDPOINTS.AUTH.SIGN_IN, {
      method: "POST",

      body: { user: credentials },
    });
  },

  signOut: () => {
    return apiCall(API_ENDPOINTS.AUTH.SIGN_OUT, {
      method: "DELETE",
    });
  },
};

export const productsAPI = {
  // ... (your productsAPI code)
  createProduct: (productData, imageFile) => {
    const formData = new FormData();

    Object.keys(productData).forEach((key) => {
      formData.append(`product[${key}]`, productData[key]);
    });

    if (imageFile) {
      formData.append("product[image]", imageFile);
    }

    return apiCall(API_ENDPOINTS.PRODUCTS, {
      method: "POST",

      body: formData,
    });
  },

  createProductVariant: (productId, variantData) => {
    return apiCall(API_ENDPOINTS.PRODUCT_VARIANTS(productId), {
      method: "POST",

      body: { product_variant: variantData },
    });
  },

  getAllProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();

    const url = `${API_ENDPOINTS.PRODUCTS}${
      queryString ? `?${queryString}` : ""
    }`;

    return apiCall(url);
  },

  getProductById: (id) => {
    return apiCall(`${API_ENDPOINTS.PRODUCTS}/${id}`);
  },

  updateProduct: (id, productData, imageFile = null) => {
    const formData = new FormData();

    Object.keys(productData).forEach((key) => {
      formData.append(`product[${key}]`, productData[key]);
    });

    if (imageFile) {
      formData.append("product[image]", imageFile);
    }

    return apiCall(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
      method: "PATCH",

      body: formData,
    });
  },

  deleteProduct: (id) => {
    return apiCall(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
      method: "DELETE",
    });
  },

  getProductVariants: (productId) => {
    return apiCall(API_ENDPOINTS.PRODUCT_VARIANTS(productId));
  },

  updateProductVariant: (variantId, variantData) => {
    return apiCall(API_ENDPOINTS.INDIVIDUAL_PRODUCT_VARIANT(variantId), {
      method: "PATCH",

      body: { product_variant: variantData },
    });
  },

  deleteProductVariant: (variantId) => {
    return apiCall(API_ENDPOINTS.INDIVIDUAL_PRODUCT_VARIANT(variantId), {
      method: "DELETE",
    });
  },
};

// Add these to your existing api.js file

// Users API
export const usersAPI = {
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/api/users${queryString ? `?${queryString}` : ""}`;
    return apiCall(url);
  },

  getUserById: (id) => {
    return apiCall(`${API_BASE_URL}/users/${id}`);
  },

  updateUser: (id, userData) => {
    return apiCall(`${API_BASE_URL}/users/${id}`, {
      method: "PATCH",
      body: { user: userData },
    });
  },

  deleteUser: (id) => {
    return apiCall(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
    });
  },
};

// Orders API
export const ordersAPI = {
  getAllOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/api/orders${queryString ? `?${queryString}` : ""}`;
    return apiCall(url);
  },

  getOrderById: (id) => {
    return apiCall(`${API_BASE_URL}/api/orders/${id}`);
  },

  getOrderStatus: (id) => {
    return apiCall(`${API_BASE_URL}/api/orders/${id}/status`);
  },

  generateReceipt: (id) => {
    return apiCall(`${API_BASE_URL}/api/orders/${id}/generate_receipt`, {
      method: "POST",
    });
  },

  getReceiptInfo: (id) => {
    return apiCall(`${API_BASE_URL}/api/orders/${id}/receipt_info`);
  },
};