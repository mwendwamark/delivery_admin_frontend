import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { productsAPI } from "../../../Config/api"; // Import your API helper
import "./ProductVariantForm.css"; // New CSS file for this component
import { MoveLeft } from "lucide-react";

const ProductVariantForm = ({
  productId,
  onVariantsAdded,
  onError,
  onBack,
}) => {
  const navigate = useNavigate();
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
      const hasInvalidVariant = productVariants.some(
        (variant) =>
          !variant.size ||
          !variant.price ||
          !variant.stock ||
          isNaN(parseFloat(variant.price)) ||
          isNaN(parseInt(variant.stock, 10))
      );

      if (hasInvalidVariant) {
        setCurrentError(
          "Please ensure all variant fields (size, price, stock) are filled correctly."
        );
        setLoading(false);
        onError(
          "Please ensure all variant fields (size, price, stock) are filled correctly."
        );
        return;
      }

      const results = [];
      for (const variant of productVariants) {
        try {
          const response = await productsAPI.createProductVariant(
            productId,
            variant
          );
          results.push({ success: true, data: response });
        } catch (err) {
          console.error(`Error adding variant ${variant.size}:`, err);
          results.push({
            success: false,
            error: err.message,
            variant: variant,
          });
          setCurrentError(
            (prev) =>
              prev + `\nFailed to add variant ${variant.size}: ${err.message}`
          );
        }
      }

      const allSuccessful = results.every((res) => res.success);

      if (allSuccessful) {
        alert("Product and all variants created successfully!");
        navigate("/admin/products"); // Navigate to /admin/products after successful creation
      } else {
        onError(
          "Some variants failed to create. Please check the errors above."
        );
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
    <>
      {/* The main form container for variants */}
      <form onSubmit={handleAllVariantsSubmit} className="variant-form-container">
        <h3>Add Product Variants</h3>
        {currentError && <div className="variant-error-message">{currentError}</div>}

        {productVariants.map((variant, index) => (
          <div key={index} className="variant-item variant-form-group">
            <h4>Variant #{index + 1}</h4>
            {/* Flex container for size and price inputs */}
            <div className="variant-form-flex">
              <div className="variant-form-group input-half-width">
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
              <div className="variant-form-group input-half-width">
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
            </div>
            {/* Flex container for stock and availability inputs */}
            <div className="variant-form-flex">
              <div className="variant-form-group input-half-width">
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
              <div className="variant-form-group input-half-width variant-checkbox-group">
                <input
                  type="checkbox"
                  id={`availability-${index}`}
                  name="availability"
                  checked={variant.availability}
                  onChange={(e) => handleVariantChange(index, e)}
                />
                <label htmlFor={`availability-${index}`}>Available</label>
              </div>
            </div>
            {productVariants.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveVariant(index)}
                className="variant-remove-btn btn btn-outline"
              >
                Remove Variant
              </button>
            )}
          </div>
        ))}
        {/* Button to add more variants */}
        <button
          type="button"
          onClick={handleAddVariant}
          className="variant-add-btn btn btn-secondary"
        >
          + Add Another Variant
        </button>
        {/* Action buttons at the bottom of the form */}
        <div className="variant-form-actions variant-form-flex">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary input-half-width"
          >
            {loading ? "Saving Variants..." : "Save Variants & Finish"}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="variant-back-btn btn btn-outline input-half-width btn-icon"
          >
            <MoveLeft /> to Product Details
          </button>
        </div>
      </form>
    </>
  );
};

ProductVariantForm.propTypes = {
  productId: PropTypes.number.isRequired,
  onVariantsAdded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default ProductVariantForm;