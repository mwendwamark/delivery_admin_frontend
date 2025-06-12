import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ProductManagement.css'; 

const ProductManagement = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    brand: '',
    country: '',
    abv: '',
    description: '',
    // image_url is now managed by the backend; we send the file directly
  });
  const [imageFile, setImageFile] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null); 

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview); // Clean up the object URL
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!imageFile) {
      setError('Please select a product image to upload.');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData(); 

      // Append all text-based form data
      Object.keys(formData).forEach(key => {
        data.append(`product[${key}]`, formData[key]);
      });

      // Append the image file.
      // The key MUST match the has_one_attached name in your Rails model (e.g., :image)
      data.append('product[image]', imageFile);

      const response = await axios.post('http://localhost:3000/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data', // Essential for file uploads
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        }
      });

      if (response.status === 201) { 
        alert('Product created successfully!');
        // Reset the form fields
        setFormData({
          name: '',
          category: '',
          subcategory: '',
          brand: '',
          country: '',
          abv: '',
          description: '',
        });
        setImageFile(null);       
        setImagePreview(null);    
        // Optional: navigate after successful creation
        // navigate('/products-list');
      }
    } catch (err) {
      console.error('Error creating product:', err.response || err);
      const backendErrors = err.response?.data?.errors;
      if (backendErrors) {
        setError(Array.isArray(backendErrors) ? backendErrors.join(', ') : backendErrors.message || 'An error occurred.');
      } else {
        setError('Error creating product. Please check the server and your network.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-management">
      <h2>Add New Product</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="subcategory">Subcategory</label>
          <input
            type="text"
            id="subcategory"
            name="subcategory"
            value={formData.subcategory}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="brand">Brand</label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="country">Country</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="abv">ABV (%)</label>
          <input
            type="number"
            id="abv"
            name="abv"
            value={formData.abv}
            onChange={handleChange}
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        {/* Standard File Input for Image Upload */}
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
              <img src={imagePreview} alt="Selected Product Preview" className="image-preview" />
              <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="remove-image-button">Remove Image</button>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductManagement;