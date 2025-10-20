import { useState, useEffect } from "react";
import { ordersAPI } from "../../Config/api";
import "./AdminOrdersList.css";

const AdminOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const statusLabels = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  const statusColors = {
    pending: "#ffc107",
    confirmed: "#17a2b8",
    preparing: "#007bff",
    out_for_delivery: "#6f42c1",
    delivered: "#28a745",
    cancelled: "#dc3545",
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        per_page: 15,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (dateFilter !== "all") {
        params.date_range = dateFilter;
      }

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await ordersAPI.getAllOrders(params);

      setOrders(response.orders || []);
      setTotalPages(response.meta?.total_pages || 1);
      setTotalCount(response.meta?.total_count || 0);
    } catch (err) {
      setError(err.message || "Failed to fetch orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await ordersAPI.getOrderById(orderId);
      setSelectedOrder(response);
      setShowModal(true);
    } catch (err) {
      alert("Failed to fetch order details: " + err.message);
    }
  };

  const handleGenerateReceipt = async (orderId) => {
    try {
      const response = await ordersAPI.generateReceipt(orderId);
      alert(response.message || "Receipt generated successfully");
      
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = await ordersAPI.getOrderById(orderId);
        setSelectedOrder(updatedOrder);
      }
      
      fetchOrders();
    } catch (err) {
      alert("Failed to generate receipt: " + err.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="orders-container">
        <div className="loading-spinner">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="orders-container section container">
      <div className="orders-header">
        <h1>Order Management</h1>
        <p className="orders-count">Total Orders: {totalCount}</p>
      </div>

      <div className="orders-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>

        <div className="filters-group">
          <div className="filter-item">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="date-filter">Date Range:</label>
            <select
              id="date-filter"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="30d">Last 30 Days</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Items</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">#{order.id}</td>
                  <td>User #{order.user_id}</td>
                  <td className="order-total">
                    {formatCurrency(order.total_price)}
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: statusColors[order.status] + "20",
                        color: statusColors[order.status],
                      }}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`payment-badge payment-${order.payment_status}`}
                    >
                      {order.payment_status}
                    </span>
                  </td>
                  <td>{order.order_items?.length || 0} items</td>
                  <td>{formatDate(order.created_at)}</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleViewOrder(order.id)}
                      className="btn-view"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Order Details - #{selectedOrder.id}</h2>
              <button onClick={closeModal} className="close-btn">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="order-details-grid">
                <div className="detail-section">
                  <h3>Order Information</h3>
                  <div className="detail-group">
                    <label>Order ID:</label>
                    <p>#{selectedOrder.id}</p>
                  </div>
                  <div className="detail-group">
                    <label>Status:</label>
                    <p>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor:
                            statusColors[selectedOrder.status] + "20",
                          color: statusColors[selectedOrder.status],
                        }}
                      >
                        {statusLabels[selectedOrder.status]}
                      </span>
                    </p>
                  </div>
                  <div className="detail-group">
                    <label>Payment Status:</label>
                    <p>
                      <span
                        className={`payment-badge payment-${selectedOrder.payment_status}`}
                      >
                        {selectedOrder.payment_status}
                      </span>
                    </p>
                  </div>
                  <div className="detail-group">
                    <label>Payment Method:</label>
                    <p>{selectedOrder.payment_method || "N/A"}</p>
                  </div>
                  <div className="detail-group">
                    <label>Order Date:</label>
                    <p>{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div className="detail-group">
                    <label>Total Amount:</label>
                    <p className="total-amount">
                      {formatCurrency(selectedOrder.total_price)}
                    </p>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Shipping Address</h3>
                  {selectedOrder.shipping_address ? (
                    <>
                      <div className="detail-group">
                        <label>Street:</label>
                        <p>{selectedOrder.shipping_address.street}</p>
                      </div>
                      <div className="detail-group">
                        <label>City:</label>
                        <p>{selectedOrder.shipping_address.city}</p>
                      </div>
                      <div className="detail-group">
                        <label>State:</label>
                        <p>{selectedOrder.shipping_address.state}</p>
                      </div>
                      <div className="detail-group">
                        <label>Postal Code:</label>
                        <p>{selectedOrder.shipping_address.postal_code}</p>
                      </div>
                      <div className="detail-group">
                        <label>Phone:</label>
                        <p>{selectedOrder.shipping_address.phone}</p>
                      </div>
                    </>
                  ) : (
                    <p>No shipping address provided</p>
                  )}
                </div>
              </div>

              {selectedOrder.delivery_instructions && (
                <div className="detail-section">
                  <h3>Delivery Instructions</h3>
                  <p className="delivery-instructions">
                    {selectedOrder.delivery_instructions}
                  </p>
                </div>
              )}

              <div className="detail-section">
                <h3>Order Items</h3>
                <div className="order-items-list">
                  {selectedOrder.order_items &&
                  selectedOrder.order_items.length > 0 ? (
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Size</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.order_items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              {item.product?.name || `Product #${item.product_id}`}
                            </td>
                            <td>{item.size}</td>
                            <td>{item.quantity}</td>
                            <td>{formatCurrency(item.price_per_unit)}</td>
                            <td>
                              {formatCurrency(
                                item.item_total || item.price_per_unit * item.quantity
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No items in this order</p>
                  )}
                </div>
              </div>

              {selectedOrder.receipt_url && (
                <div className="receipt-section">
                  <a
                    href={selectedOrder.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-receipt"
                  >
                    View Receipt
                  </a>
                </div>
              )}

              {!selectedOrder.receipt_url && (
                <div className="receipt-section">
                  <button
                    onClick={() => handleGenerateReceipt(selectedOrder.id)}
                    className="btn-generate-receipt"
                  >
                    Generate Receipt
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersList;