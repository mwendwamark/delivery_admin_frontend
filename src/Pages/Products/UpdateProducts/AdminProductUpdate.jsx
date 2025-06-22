import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsAPI } from "../../../Config/api"; // Adjust the path as necessary
import "./AdminProductUpdate.css"; // We'll create this CSS file
import { MoveLeft } from "lucide-react";

const AdminProductUpdate = () => {
  const { productId } = useParams(); // Get product ID from URL parameter
  const navigate = useNavigate();

  // State for form data
  const [product, setProduct] = useState({
    name: "",
    category: "",
    subcategory: "",
    brand: "",
    country: "",
    abv: "", // Alcohol by Volume, assuming this is a number
    description: "",
  });
  const [currentImageUrl, setCurrentImageUrl] = useState(null); // To display the existing image
  const [imageFile, setImageFile] = useState(null); // To hold the new image file for upload

  // State for UI feedback
  const [loading, setLoading] = useState(true); // For initial data fetch
  const [updating, setUpdating] = useState(false); // For showing update in progress
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Effect to fetch product data when the component mounts or productId changes
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productsAPI.getProductById(productId);
        // Set form fields with fetched data
        setProduct({
          name: data.name || "",
          category: data.category || "",
          subcategory: data.subcategory || "",
          brand: data.brand || "",
          country: data.country || "",
          abv: data.abv || "",
          description: data.description || "",
        });
        setCurrentImageUrl(data.image_url || null); // Store current image URL for preview
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(
          "Failed to load product details. Please check the product ID or network connection."
        );
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    } else {
      setError("No product ID provided in the URL.");
      setLoading(false);
    }
  }, [productId]); // Dependency array: re-run effect if productId changes

  // Handles changes for text/number input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  // Handles changes for the file input (image upload)
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create a URL for immediate preview of the newly selected image
      setCurrentImageUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      // If the user clears the file input, reset the image preview.
      // Note: To revert to the *original* image from DB, you'd need to store that separately
      // and reset currentImageUrl to that original value here. For simplicity, we'll just clear the preview.
      setCurrentImageUrl(null); // Clear preview if no file selected
    }
  };

  // Handles the form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)
    setUpdating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // productsAPI.updateProduct is designed to handle sending form data,
      // including the image file, as FormData.
      await productsAPI.updateProduct(productId, product, imageFile);
      setSuccessMessage("Product updated successfully!");
      // Optionally navigate back to the product list after a short delay
      setTimeout(() => navigate("/admin/products"), 2000);
    } catch (err) {
      console.error("Error updating product:", err);
      // Display a user-friendly error message
      setError(
        err.message ||
          "Failed to update product. Please check your input and try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="admin-update-container loading-state">
        Loading product details...
      </div>
    );
  }

  // Render error state if initial fetch failed and no success message is present
  if (error && !successMessage) {
    return <div className="admin-update-container error-state">{error}</div>;
  }

  return (
    <>
      <section className="products-update_page section container">
        <div className="products-update_container">
          <div className="products-update_contents">
            <h2>Update Product</h2>
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
            <form onSubmit={handleSubmit} className="product-update-form">
              <div className="update-product_form-group">
                <label htmlFor="name">Product Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="update-product_form-flex ">
                <div className="update-product_form-group update-half-input">
                  <label htmlFor="category">Category:</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="update-product_form-group update-half-input">
                  <label htmlFor="subcategory">Subcategory:</label>
                  <input
                    type="text"
                    id="subcategory"
                    name="subcategory"
                    value={product.subcategory}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="update-product_form-flex">
                <div className="update-product_form-group update-half-input">
                  <label htmlFor="brand">Brand:</label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={product.brand}
                    onChange={handleChange}
                  />
                </div>

                <div className="update-product_form-group update-half-input">
                  <label htmlFor="country">Country:</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={product.country}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="update-product_form-group">
                <label htmlFor="abv">ABV (%):</label>
                <input
                  type="number"
                  id="abv"
                  name="abv"
                  value={product.abv}
                  onChange={handleChange}
                  step="0.1" // Allows decimal values for ABV
                />
              </div>

              <div className="update-product_form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  rows="5"
                ></textarea>
              </div>

              <div className="update-product_form-group image-upload-group">
                <label htmlFor="image">Product Image:</label>
                {currentImageUrl ? (
                  <div className="current-image-preview">
                    <p>Current/New Image Preview:</p>
                    <img
                      src={currentImageUrl}
                      alt="Product"
                      className="product-image-preview"
                    />
                  </div>
                ) : (
                  <div className="no-image-preview">
                    No image selected or uploaded yet.
                  </div>
                )}
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*" // Only accept image files
                  onChange={handleImageChange}
                />
                <small>
                  Upload a new image to replace the current one. Leave blank to
                  keep existing image.
                </small>
              </div>

              <div className="update-products_form-actions">
                <button
                  type="submit"
                  disabled={updating}
                  className="submit-btn btn btn-primary"
                >
                  {updating ? "Updating..." : "Update Product"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/products")} // Navigate back to product list
                  className="back-btn btn btn-outline btn-icon"
                  disabled={updating}
                >
                 <MoveLeft/> Back to Products
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminProductUpdate;
