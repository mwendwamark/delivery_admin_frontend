// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// const API_ENDPOINTS = {
//   AUTH: {
//     SIGN_UP: `${API_BASE_URL}/users`,
//     SIGN_IN: `${API_BASE_URL}/users/sign_in`,
//     SIGN_OUT: `${API_BASE_URL}/users/sign_out`,
//     // PRODUCTS: `${API_BASE_URL}/products`
//   },
// };

// // Helper function for API calls
// const apiCall = async (url, options = {}) => {
//   const defaultOptions = {
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     },
//   };

//   // Get auth token from storage if it exists
//   const token =
//     sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
//   if (token) {
//     defaultOptions.headers["Authorization"] = `Bearer ${token}`;
//   }

//   const mergedOptions = {
//     ...defaultOptions,
//     ...options,
//     headers: {
//       ...defaultOptions.headers,
//       ...options.headers,
//     },
//   };

//   try {
//     const response = await fetch(url, mergedOptions);

//     if (!response.ok) {
//       // Try to get error message from response
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(
//         errorData.message ||
//           errorData.error ||
//           `HTTP error! status: ${response.status}`
//       );
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("API call failed:", error);
//     throw error;
//   }
// };

// export const authAPI = {
//   // Sign up a new user
//   signUp: (userData) => {
//     return apiCall(API_ENDPOINTS.AUTH.SIGN_UP, {
//       method: "POST",
//       body: JSON.stringify({ user: userData }),
//     });
//   },

//   // Sign in user
//   signIn: (credentials) => {
//     return apiCall(API_ENDPOINTS.AUTH.SIGN_IN, {
//       method: "POST",
//       body: JSON.stringify({ user: credentials }),
//     });
//   },

//   // Sign out user
//   signOut: () => {
//     return apiCall(API_ENDPOINTS.AUTH.SIGN_OUT, {
//       method: "DELETE",
//     });
//   },
// };

// export { API_BASE_URL, API_ENDPOINTS, apiCall };
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const API_ENDPOINTS = {
  AUTH: {
    SIGN_UP: `${API_BASE_URL}/users`,
    SIGN_IN: `${API_BASE_URL}/users/sign_in`,
    SIGN_OUT: `${API_BASE_URL}/users/sign_out`,
  },
  PRODUCTS: `${API_BASE_URL}/products`, // New: Base URL for products
  PRODUCT_VARIANTS: (productId) => `${API_BASE_URL}/products/${productId}/product_variants`, // New: Function for nested variants
  // Note: For individual product variant actions (show, update, delete)
  // if you used `shallow: true` in routes, the URL would be `${API_BASE_URL}/product_variants/:id`
  // but for create and index, the nested path is appropriate.
};

// Helper function for API calls
// Modified to handle FormData directly for file uploads
const apiCall = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      Accept: "application/json",
    },
  };

  // Get auth token from storage if it exists
  const token =
    sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
  if (token) {
    defaultOptions.headers["Authorization"] = `Bearer ${token}`;
  }

  // Determine Content-Type. If body is FormData, let browser set it.
  // Otherwise, default to application/json.
  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    defaultOptions.headers["Content-Type"] = "application/json";
    if (options.body && typeof options.body !== 'string') { // If body is an object, stringify it
      options.body = JSON.stringify(options.body);
    }
  } else {
    // If it's FormData, explicitly remove Content-Type header so browser sets it correctly.
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
          (errorData.errors ? Object.values(errorData.errors).flat().join(', ') : `HTTP error! status: ${response.status}`)
      );
    }

    // Handle 204 No Content for DELETE requests gracefully
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

export const authAPI = {
  // Sign up a new user
  signUp: (userData) => {
    return apiCall(API_ENDPOINTS.AUTH.SIGN_UP, {
      method: "POST",
      body: { user: userData }, // body will be stringified by apiCall if not FormData
    });
  },

  // Sign in user
  signIn: (credentials) => {
    return apiCall(API_ENDPOINTS.AUTH.SIGN_IN, {
      method: "POST",
      body: { user: credentials },
    });
  },

  // Sign out user
  signOut: () => {
    return apiCall(API_ENDPOINTS.AUTH.SIGN_OUT, {
      method: "DELETE",
    });
  },
};

export const productsAPI = {
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
      body: formData, // Send FormData directly
    });
  },

  createProductVariant: (productId, variantData) => {
    return apiCall(API_ENDPOINTS.PRODUCT_VARIANTS(productId), {
      method: "POST",
      body: { product_variant: variantData }, // Wrap in product_variant key
    });
  },

  // You might want to add other product/variant related API calls here (fetch all, fetch one, update, delete)
  // For example:
  getAllProducts: () => {
    return apiCall(API_ENDPOINTS.PRODUCTS);
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
      method: "PATCH", // or 'PUT'
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
  // You would add update/delete variant methods too, using the non-nested variant URL for `shallow: true`
  // updateProductVariant: (variantId, variantData) => {
  //   return apiCall(`${API_BASE_URL}/product_variants/${variantId}`, {
  //     method: 'PATCH',
  //     body: { product_variant: variantData }
  //   });
  // },
  // deleteProductVariant: (variantId) => {
  //   return apiCall(`${API_BASE_URL}/product_variants/${variantId}`, {
  //     method: 'DELETE'
  //   });
  // }
};

export { API_BASE_URL, API_ENDPOINTS, apiCall };