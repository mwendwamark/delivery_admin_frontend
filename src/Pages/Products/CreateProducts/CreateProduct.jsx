import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductVariantForm from "./ProductVariantForm"; // Import the new component
import "./CreateProduct.css";
import { productsAPI } from "../../../Config/api"; // Import your API helper

const CreateProduct = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1); // 1: Product, 2: Variants
  const [createdProductId, setCreatedProductId] = useState(null);

  // State for Product Details
  const [productFormData, setProductFormData] = useState({
    name: "",
    category: "",
    subcategory: "",
    brand: "",
    country: "",
    abv: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview); // Clean up the object URL
      }
    };
  }, [imagePreview]);

  // --- Handlers for Product Form (Step 1) ---
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear overall error

    if (!imageFile) {
      setError("Please select a product image to upload.");
      setLoading(false);
      return;
    }

    try {
      const response = await productsAPI.createProduct(productFormData, imageFile);

      if (response && response.id) {
        setCreatedProductId(response.id); // Store the newly created product ID
        setCurrentStep(2); // Move to the next step
        alert("Product created successfully! Now add variants.");
      } else {
        // This case should ideally be caught by apiCall's error handling, but good for fallback
        setError("Failed to get product ID after creation.");
      }
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err.message || "An error occurred during product creation.");
    } finally {
      setLoading(false);
    }
  };

  // --- Callbacks from ProductVariantForm ---
  const handleVariantsAdded = () => {
    // Reset all forms and navigate or show success message
    setProductFormData({
      name: "", category: "", subcategory: "", brand: "",
      country: "", abv: "", description: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setCreatedProductId(null);
    setCurrentStep(1); // Go back to step 1 for new product
    navigate('/products'); // Example: navigate to product list after full process
  };

  const handleVariantFormError = (errorMessage) => {
    setError(errorMessage); // Pass error from variant form up to the main component's error display
  };

  const handleBackToProductDetails = () => {
    setCurrentStep(1); // Go back to step 1
    setError(""); // Clear any errors
  };

  return (
    <>
      <section className="product-management_page container section">
        <div className="product-management">
          <h2>
            {currentStep === 1
              ? "Add New Product"
              : `Add Variants for ${productFormData.name || "Product"}`}
          </h2>
          {error && <div className="error-message">{error}</div>}

          {currentStep === 1 && (
            <form onSubmit={handleProductSubmit} className="product-form">
              {/* Product Details Fields */}
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={productFormData.name}
                  onChange={handleProductChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={productFormData.category}
                  onChange={handleProductChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subcategory">Subcategory</label>
                <input
                  type="text"
                  id="subcategory"
                  name="subcategory"
                  value={productFormData.subcategory}
                  onChange={handleProductChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={productFormData.brand}
                  onChange={handleProductChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={productFormData.country}
                  onChange={handleProductChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="abv">ABV (%)</label>
                <input
                  type="number"
                  id="abv"
                  name="abv"
                  value={productFormData.abv}
                  onChange={handleProductChange}
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={productFormData.description}
                  onChange={handleProductChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Upload Product Image</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleImageChange}
                  accept="image/*"
                  required
                />
                {imagePreview && (
                  <div className="image-preview-container">
                    <p>Image Preview:</p>
                    <img
                      src={imagePreview}
                      alt="Selected Product Preview"
                      className="image-preview"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="remove-image-button"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Creating Product..." : "Create Product & Add Variants"}
              </button>
            </form>
          )}

          {currentStep === 2 && createdProductId && (
            <ProductVariantForm
              productId={createdProductId}
              onVariantsAdded={handleVariantsAdded}
              onError={handleVariantFormError}
              onBack={handleBackToProductDetails}
            />
          )}
        </div>
      </section>
    </>
  );
};

export default CreateProduct;