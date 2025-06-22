import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsAPI } from "../../../Config/api";
import "./UpdateProductVariants.css";
import { MoveLeft } from "lucide-react";

const AdminProductVariantsManagement = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [productName, setProductName] = useState("");
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // State for success message

  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    size: "",
    price: "",
    availability: true,
    stock: 0,
  });

  const [editingVariantId, setEditingVariantId] = useState(null);
  const [editVariant, setEditVariant] = useState({
    size: "",
    price: "",
    availability: true,
    stock: 0,
  });

  useEffect(() => {
    fetchProductAndVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // --- New useEffect for success message timeout ---
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null); // Clear the message after 5 seconds
      }, 5000); // 5000 milliseconds = 5 seconds

      return () => clearTimeout(timer); // Clean up the timer if component unmounts or message changes
    }
  }, [successMessage]); // Re-run this effect whenever successMessage changes
  // --------------------------------------------------

  const fetchProductAndVariants = async () => {
    setLoading(true);
    setError(null);
    try {
      const productData = await productsAPI.getProductById(productId);
      setProductName(productData.name || "Unknown Product");

      const variantsData = await productsAPI.getProductVariants(productId);
      setVariants(variantsData);
    } catch (err) {
      console.error("Error fetching product or variants:", err);
      setError("Failed to load product variants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewVariantChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewVariant((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditVariantChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditVariant((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddVariantSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null); // Clear any old success messages
    try {
      if (
        !newVariant.size ||
        !newVariant.price ||
        newVariant.stock === null ||
        newVariant.stock === ""
      ) {
        throw new Error(
          "Please fill in all fields (Size, Price, Stock) for the new variant."
        );
      }
      if (
        isNaN(parseFloat(newVariant.price)) ||
        parseFloat(newVariant.price) <= 0
      ) {
        throw new Error("Price must be a positive number.");
      }
      if (
        isNaN(parseInt(newVariant.stock, 10)) ||
        parseInt(newVariant.stock, 10) < 0
      ) {
        throw new Error("Stock must be a non-negative integer.");
      }

      const addedVariant = await productsAPI.createProductVariant(
        productId,
        newVariant
      );
      setVariants((prev) => [...prev, addedVariant]);
      setNewVariant({ size: "", price: "", availability: true, stock: 0 });
      setShowAddForm(false);
      setSuccessMessage("Variant added successfully!"); // Set the success message
    } catch (err) {
      console.error("Error adding variant:", err);
      setError(err.message || "Failed to add variant. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateVariantSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null); // Clear any old success messages
    try {
      if (
        !editVariant.size ||
        !editVariant.price ||
        editVariant.stock === null ||
        editVariant.stock === ""
      ) {
        throw new Error(
          "Please fill in all fields (Size, Price, Stock) for the variant."
        );
      }
      if (
        isNaN(parseFloat(editVariant.price)) ||
        parseFloat(editVariant.price) <= 0
      ) {
        throw new Error("Price must be a positive number.");
      }
      if (
        isNaN(parseInt(editVariant.stock, 10)) ||
        parseInt(editVariant.stock, 10) < 0
      ) {
        throw new Error("Stock must be a non-negative integer.");
      }

      const updatedVariant = await productsAPI.updateProductVariant(
        editingVariantId,
        editVariant
      );
      setVariants((prev) =>
        prev.map((v) => (v.id === editingVariantId ? updatedVariant : v))
      );
      setEditingVariantId(null);
      setSuccessMessage("Variant updated successfully!"); // Set the success message
    } catch (err) {
      console.error("Error updating variant:", err);
      setError(err.message || "Failed to update variant. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this variant? This action cannot be undone."
      )
    )
      return;
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null); // Clear any old success messages
    try {
      await productsAPI.deleteProductVariant(variantId);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      setSuccessMessage("Variant deleted successfully!"); // Set the success message
    } catch (err) {
      console.error("Error deleting variant:", err);
      setError("Failed to delete variant.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (variant) => {
    setEditingVariantId(variant.id);
    setEditVariant({
      size: variant.size,
      price: variant.price,
      availability: variant.availability,
      stock: variant.stock,
    });
    setShowAddForm(false);
    setError(null); // Clear errors when starting edit
    setSuccessMessage(null); // Clear success when starting edit
  };

  const cancelEditing = () => {
    setEditingVariantId(null);
    setEditVariant({ size: "", price: "", availability: true, stock: 0 });
    setError(null); // Clear errors when canceling edit
    setSuccessMessage(null); // Clear success when canceling edit
  };

  if (loading) {
    return (
      <div className="update-product-variants-container loading-state">
        Loading product variants...
      </div>
    );
  }

  // Ensure error is cleared if success message is present, and vice versa.
  // The useEffect for success will handle its disappearance.
  // If an error exists, it should still show unless cleared by another action.

  return (
    <div className="update-product-variants-container section container">
      <div className="update-product-variants-header">
        <h2>Manage Variants for "{productName}"</h2>
        <button
          onClick={() => navigate("/admin/products")}
          className="back-to-products-btn btn-icon"
        >
          <MoveLeft/>Back to Products
        </button>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {error && <div className="error-message">{error}</div>}

      <div className="update-product-variants-list-section">
        <h3>Current Variants</h3>
        {variants.length === 0 ? (
          <p className="no-variants">
            No variants found for this product. Add one below!
          </p>
        ) : (
          <div className="update-product-variants-table-wrapper">
            <table className="update-product-variants-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Price (KES)</th>
                  <th>Stock</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr key={variant.id}>
                    {editingVariantId === variant.id ? (
                      <>
                        <td data-label="Size">
                          <input
                            type="text"
                            name="size"
                            value={editVariant.size}
                            onChange={handleEditVariantChange}
                            disabled={submitting}
                          />
                        </td>
                        <td data-label="Price">
                          <input
                            type="number"
                            name="price"
                            value={editVariant.price}
                            onChange={handleEditVariantChange}
                            step="0.01"
                            disabled={submitting}
                          />
                        </td>
                        <td data-label="Stock">
                          <input
                            type="number"
                            name="stock"
                            value={editVariant.stock}
                            onChange={handleEditVariantChange}
                            disabled={submitting}
                          />
                        </td>
                        <td data-label="Available">
                          <input
                            type="checkbox"
                            name="availability"
                            checked={editVariant.availability}
                            onChange={handleEditVariantChange}
                            disabled={submitting}
                          />
                        </td>
                        <td data-label="Actions">
                          <button
                            onClick={handleUpdateVariantSubmit}
                            disabled={submitting}
                            className="update-product_save-btn"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={submitting}
                            className="update-product_cancel-btn"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td data-label="Size">{variant.size}</td>
                        <td data-label="Price">
                          KES {parseFloat(variant.price).toFixed(2)}
                        </td>
                        <td data-label="Stock">{variant.stock}</td>
                        <td data-label="Available">
                          {variant.availability ? "Yes" : "No"}
                        </td>
                        <td data-label="Actions">
                          <button
                            onClick={() => startEditing(variant)}
                            className="update-product_edit-btn"
                            disabled={submitting}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteVariant(variant.id)}
                            className="update-product_delete-btn"
                            disabled={submitting}
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="update-product-add-variant-section">
        <h3>Add New Variant</h3>
        <button
          onClick={() => {
            setShowAddForm((prev) => !prev);
            setEditingVariantId(null);
            setNewVariant({
              size: "",
              price: "",
              availability: true,
              stock: 0,
            });
            setError(null); // Clear errors when toggling add form
            setSuccessMessage(null); // Clear success when toggling add form
          }}
          className="toggle-add-form-btn"
        >
          {showAddForm ? "Hide Add Form" : "+ Add New Variant"}
        </button>

        {showAddForm && (
          <form
            onSubmit={handleAddVariantSubmit}
            className="update-product-add-variant-form"
          >
            <div className="update-product-form-group">
              <label htmlFor="new-size">Size:</label>
              <input
                type="text"
                id="new-size"
                name="size"
                value={newVariant.size}
                onChange={handleNewVariantChange}
                required
                disabled={submitting}
              />
            </div>
            <div className="update-product-form-group">
              <label htmlFor="new-price">Price (KES):</label>
              <input
                type="number"
                id="new-price"
                name="price"
                value={newVariant.price}
                onChange={handleNewVariantChange}
                step="0.01"
                required
                disabled={submitting}
              />
            </div>
            <div className="update-product-form-group">
              <label htmlFor="new-stock">Stock:</label>
              <input
                type="number"
                id="new-stock"
                name="stock"
                value={newVariant.stock}
                onChange={handleNewVariantChange}
                required
                disabled={submitting}
              />
            </div>
            <div className="update-product-form-group checkbox-group">
              <input
                type="checkbox"
                id="new-availability"
                name="availability"
                checked={newVariant.availability}
                onChange={handleNewVariantChange}
                disabled={submitting}
              />
              <label htmlFor="new-availability">Available</label>
            </div>
            <button type="submit" disabled={submitting} className="submit-btn">
              {submitting ? "Adding..." : "Add Variant"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminProductVariantsManagement;