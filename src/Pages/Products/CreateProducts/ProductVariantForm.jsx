import React, { useState } from "react";
import PropTypes from "prop-types";
import { productsAPI } from "../../../Config/api"; // Import your API helper

const ProductVariantForm = ({ productId, onVariantsAdded, onError, onBack }) => {
  const [productVariants, setProductVariants] = useState([
    { size: "", price: "", availability: true, stock: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [currentError, setCurrentError] = useState("");

  const handleVariantChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const list = [...productVariants];
    list[index][name] = type === "checkbox" ? checked : value;
    setProductVariants(list);
  };

  const handleAddVariant = () => {
    setProductVariants([
      ...productVariants,
      { size: "", price: "", availability: true, stock: "" },
    ]);
  };

  const handleRemoveVariant = (index) => {
    const list = [...productVariants];
    list.splice(index, 1);
    setProductVariants(list);
  };

  const handleAllVariantsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCurrentError(""); // Clear previous errors

    if (!productId) {
      setCurrentError("Product ID is missing. Please go back to step 1.");
      setLoading(false);
      onError("Product ID is missing. Please go back to step 1.");
      return;
    }

    try {
      // Validate all variants before sending
      const hasInvalidVariant = productVariants.some(variant =>
        !variant.size || !variant.price || !variant.stock || isNaN(parseFloat(variant.price)) || isNaN(parseInt(variant.stock, 10))
      );

      if (hasInvalidVariant) {
        setCurrentError("Please ensure all variant fields (size, price, stock) are filled correctly.");
        setLoading(false);
        onError("Please ensure all variant fields (size, price, stock) are filled correctly.");
        return;
      }

      const results = [];
      for (const variant of productVariants) {
        try {
          const response = await productsAPI.createProductVariant(productId, variant);
          results.push({ success: true, data: response });
        } catch (err) {
          // If one variant fails, record the error but try to continue with others
          console.error(`Error adding variant ${variant.size}:`, err);
          results.push({ success: false, error: err.message, variant: variant });
          setCurrentError((prev) => prev + `\nFailed to add variant ${variant.size}: ${err.message}`);
          // Decide whether to stop or continue. For now, we continue.
        }
      }

      const allSuccessful = results.every(res => res.success);

      if (allSuccessful) {
        alert("Product and all variants created successfully!");
        onVariantsAdded(); // Callback to parent to reset/navigate
      } else {
        onError("Some variants failed to create. Please check the errors above.");
      }
    } catch (err) {
      console.error("Unexpected error during variant submission:", err);
      setCurrentError(`Unexpected error: ${err.message}`);
      onError(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAllVariantsSubmit} className="variant-form">
      <h3>Add Product Variants</h3>
      {currentError && <div className="error-message">{currentError}</div>}

      {productVariants.map((variant, index) => (
        <div key={index} className="variant-entry">
          <h4>Variant #{index + 1}</h4>
          <div className="form-group">
            <label htmlFor={`size-${index}`}>Size (e.g., 750ml, 1L)</label>
            <input
              type="text"
              id={`size-${index}`}
              name="size"
              value={variant.size}
              onChange={(e) => handleVariantChange(index, e)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor={`price-${index}`}>Price</label>
            <input
              type="number"
              id={`price-${index}`}
              name="price"
              value={variant.price}
              onChange={(e) => handleVariantChange(index, e)}
              step="0.01"
              required
            />
          </div>
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id={`availability-${index}`}
              name="availability"
              checked={variant.availability}
              onChange={(e) => handleVariantChange(index, e)}
            />
            <label htmlFor={`availability-${index}`}>Available</label>
          </div>
          <div className="form-group">
            <label htmlFor={`stock-${index}`}>Stock Quantity</label>
            <input
              type="number"
              id={`stock-${index}`}
              name="stock"
              value={variant.stock}
              onChange={(e) => handleVariantChange(index, e)}
              required
            />
          </div>
          {productVariants.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveVariant(index)}
              className="remove-variant-button"
            >
              Remove Variant
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={handleAddVariant} className="add-variant-button">
        Add Another Variant
      </button>
      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? "Saving Variants..." : "Save All Variants & Finish"}
        </button>
        <button type="button" onClick={onBack} className="back-button">
          Back to Product Details
        </button>
      </div>
    </form>
  );
};

ProductVariantForm.propTypes = {
  productId: PropTypes.number.isRequired,
  onVariantsAdded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default ProductVariantForm;