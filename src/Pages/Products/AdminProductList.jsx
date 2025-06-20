import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productsAPI } from "../../Config/api"; // Ensure this path is correct
import "./AdminProductList.css"; // Ensure your CSS path is correct

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    category: "",
    brand: "",
    available_only: false, // This will be converted to "true" or "false" string
  });
  const [sortBy, setSortBy] = useState("name_asc");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [searchTerm, selectedFilters, sortBy]); // Re-fetch when these dependencies change

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedFilters.category) params.category = selectedFilters.category;
      if (selectedFilters.brand) params.brand = selectedFilters.brand;
      // Convert boolean to string "true" or "false" for the backend
      if (selectedFilters.available_only) params.available_only = "true";
      if (sortBy) params.sort_by = sortBy;

      // Pass the constructed params object to getAllProducts
      const data = await productsAPI.getAllProducts(params);
      setProducts(data.products || []);
      setFilters(data.filters || {});
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    )
      return;
    try {
      await productsAPI.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert("Product deleted successfully!");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product. Please try again.");
    }
  };

  return (
    <div className="admin-products-container container section">
      <div className="admin-products-container_contents">
        <div className="admin-products-header">
          <h2>Products Management</h2>
          <button
            className="create-product-btn"
            onClick={() => navigate("/products/create")}
          >
            + Create Product
          </button>
        </div>
        <div className="admin-products-filters">
          <input
            type="text"
            placeholder="Search by name, brand, or description..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <select
            name="category"
            value={selectedFilters.category}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {filters.categories &&
              filters.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>
          <select
            name="brand"
            value={selectedFilters.brand}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Brands</option>
            {filters.brands &&
              filters.brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
          </select>
          <label className="available-only-label">
            <input
              type="checkbox"
              name="available_only"
              checked={selectedFilters.available_only}
              onChange={handleFilterChange}
            />
            Available Only
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name_asc">Sort: Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="price_asc">Price (Low-High)</option>
            <option value="price_desc">Price (High-Low)</option>
            <option value="newest">Newest</option>
          </select>
        </div>
        {loading ? (
          <div className="admin-products-loading">Loading products...</div>
        ) : error ? (
          <div className="admin-products-error">{error}</div>
        ) : (
          <div className="admin-products-table-wrapper">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-products">
                      No products found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="product-image-thumb"
                          />
                        ) : (
                          <span className="no-image">No Image</span>
                        )}
                      </td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{product.brand}</td>
                      <td>
                        {product.price_info && product.price_info.has_variants
                          ? product.price_info.price_range
                          : "N/A"}{" "}
                        {/* Changed from "Out of Stock" to N/A if no variants */}
                      </td>
                      <td>
                        {product.availability_info
                          ? product.availability_info.total_stock
                          : "0"}{" "}
                        {/* Default to 0 if no availability info */}
                      </td>
                      <td>
                        {product.availability_info &&
                        product.availability_info.is_available
                          ? "Yes"
                          : "No"}
                      </td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() =>
                            navigate(`/products/update/${product.id}`)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="variants-btn"
                          onClick={() =>
                            navigate(`/products/${product.id}/variants`)
                          }
                        >
                          Variants
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductList;
