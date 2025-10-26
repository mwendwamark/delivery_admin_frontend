import { useState, useEffect } from "react";
import { usersAPI } from "../../Config/api";
import "./AdminUsersList.css";

const AdminUsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const roleLabels = {
    0: "Customer",
    1: "Admin",
    2: "Delivery Person",
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        per_page: 20,
      };

      if (roleFilter !== "all") {
        params.role = roleFilter;
      }

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await usersAPI.getAllUsers(params);

      setUsers(response.users || []);
      setTotalPages(response.meta?.total_pages || 1);
      setTotalCount(response.meta?.total_count || 0);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await usersAPI.getUserById(userId);
      setSelectedUser(response.user);
      setShowModal(true);
    } catch (err) {
      alert("Failed to fetch user details: " + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await usersAPI.deleteUser(userId);
      alert("User deleted successfully");
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="users-container">
        <div className="loading-spinner">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="users-container section container">
      <div className="users-header">
        <h1>User Management</h1>
        <p className="users-count">Total Users: {totalCount}</p>
      </div>

      <div className="users-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>

        <div className="filter-group">
          <label htmlFor="role-filter">Filter by Role:</label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="0">Customers</option>
            <option value="1">Admins</option>
            <option value="2">Delivery Personnel</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Age Verified</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    {user.first_name} {user.last_name}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone_number || "N/A"}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`verification-badge ${
                        user["age_verified?"] ? "verified" : "unverified"
                      }`}
                    >
                      {user["age_verified?"] ? "✓ Verified" : "✗ Unverified"}
                    </span>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleViewUser(user.id)}
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

      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button onClick={closeModal} className="close-btn">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-group">
                <label>Name:</label>
                <p>
                  {selectedUser.first_name} {selectedUser.last_name}
                </p>
              </div>
              <div className="detail-group">
                <label>Email:</label>
                <p>{selectedUser.email}</p>
              </div>
              <div className="detail-group">
                <label>Phone:</label>
                <p>{selectedUser.phone_number || "Not provided"}</p>
              </div>
              <div className="detail-group">
                <label>Role:</label>
                <p>{roleLabels[selectedUser.role]}</p>
              </div>
              <div className="detail-group">
                <label>Date of Birth:</label>
                <p>
                  {selectedUser.date_of_birth
                    ? formatDate(selectedUser.date_of_birth)
                    : "Not provided"}
                </p>
              </div>
              <div className="detail-group">
                <label>Age Verified:</label>
                <p>
                  {selectedUser["age_verified?"] ? (
                    <span style={{ color: "#28a745", fontWeight: "bold" }}>
                      ✓ Verified
                    </span>
                  ) : (
                    <span style={{ color: "#dc3545", fontWeight: "bold" }}>
                      ✗ Unverified
                    </span>
                  )}
                </p>
              </div>
              <div className="detail-group">
                <label>Member Since:</label>
                <p>{formatDate(selectedUser.created_at)}</p>
              </div>

              {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                <div className="detail-group">
                  <label>Addresses:</label>
                  <ul className="addresses-list">
                    {selectedUser.addresses.map((addr) => (
                      <li key={addr.id}>
                        {addr.street_address}, {addr.location}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedUser.orders && selectedUser.orders.length > 0 && (
                <div className="detail-group">
                  <label>Recent Orders:</label>
                  <div className="orders-summary">
                    <p>Total Orders: {selectedUser.orders.length}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersList;
