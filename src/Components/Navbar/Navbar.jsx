import React, { useState, useEffect, useRef, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { RiUserLine, RiCloseLine } from "react-icons/ri";
import { IoMenu } from "react-icons/io5";
import "../../assets/Fonts/ciguatera.regular.otf";
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // States derived from session storage
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);
  const [adminName, setAdminName] = useState("");

  const profileDropdownRef = useRef(null);
  const userIconRef = useRef(null);

  // --- Functions to get and store user data ---

  // Function to parse user data from session storage
  const getAdminDataFromSession = useCallback(() => {
    try {
      const userString = sessionStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        // Assuming role 1 is admin
        if (user && user.role === 1) {
          setLoggedInAdmin(user);
          // Combine first_name and last_name for the full name
          setAdminName(
            `${user.first_name || ""} ${user.last_name || ""}`.trim()
          );
        } else {
          setLoggedInAdmin(null);
          setAdminName("");
        }
      } else {
        setLoggedInAdmin(null);
        setAdminName("");
      }
    } catch (error) {
      console.error("Failed to parse user data from session storage:", error);
      setLoggedInAdmin(null);
      setAdminName("");
      // Clear potentially corrupted session data
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("authToken");
    }
  }, []);

  // Function to clear user data from session storage (logout)
  const clearAdminDataFromSession = useCallback(() => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("authToken");
    setLoggedInAdmin(null);
    setAdminName("");
  }, []);

  // --- Effects ---

  // Load admin data on component mount
  useEffect(() => {
    getAdminDataFromSession();

    // Optionally listen for storage changes if auth happens in another tab/window
    const handleStorageChange = () => {
      getAdminDataFromSession();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [getAdminDataFromSession]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  // Handle clicks outside the profile dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        userIconRef.current &&
        !userIconRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- UI Handlers ---

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = isMenuOpen ? "auto" : "hidden";
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = "auto";
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  const handleLogout = () => {
    clearAdminDataFromSession();
    setShowProfileDropdown(false);
    alert("You have been logged out!");
    // navigate('/admin/login'); // Uncomment if you want to redirect
  };

  // Determine if admin is logged in
  const isLoggedIn = !!loggedInAdmin;

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar_contents container">
          {/* Desktop Navigation - Left Items (Hidden on mobile) */}
          <div className="desktop-nav nav-items_left">
            <NavLink
              to="/admin/dashboard"
              className="nav-item_left"
              onClick={closeMenu}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/products"
              className="nav-item_left"
              onClick={closeMenu}
            >
              Products
            </NavLink>
            <NavLink
              to="/admin/orders"
              className="nav-item_left"
              onClick={closeMenu}
            >
              Orders
            </NavLink>
            <NavLink
              to="/admin/users"
              className="nav-item_left"
              onClick={closeMenu}
            >
              Users
            </NavLink>
            <NavLink
              to="/admin/settings"
              className="nav-item_left"
              onClick={closeMenu}
            >
              Settings
            </NavLink>
          </div>

          {/* Logo - Center */}
          <div className="nav-items_logo">
            <NavLink
              to="/admin/dashboard"
              className="nav-logo"
              onClick={closeMenu}
            >
              <span className="logo-line">Liquor</span>
              <span className="logo-line">ChapChap</span>
            </NavLink>
          </div>

          {/* Desktop Navigation - Right Items (Hidden on mobile) */}
          <div className="desktop-nav nav-items_right">
            <div className="profile-icon-container" ref={userIconRef}>
              {isLoggedIn ? (
                <div
                  className="user-avatar"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  {getInitials(adminName)}
                </div>
              ) : (
                <NavLink to="/admin/auth" className="nav-login_btn btn btn-primary">
                  <RiUserLine className="nav-right_icon-large" /> <p>Login</p>
                </NavLink>
              )}

              {showProfileDropdown && isLoggedIn && (
                <div className="profile-dropdown" ref={profileDropdownRef}>
                  <div className="profile-info">
                    <p className="profile-name">{adminName}</p>
                    <p className="profile-role">Admin</p>
                  </div>
                  <NavLink
                    to="/admin/profile"
                    className="dropdown-item"
                    onClick={() => {
                      closeMenu();
                      setShowProfileDropdown(false);
                    }}
                  >
                    View Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout-button"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Header Icons (Shown only on mobile) */}
          <div className="mobile-header-icons">
            {/* Avatar for mobile */}
            <div className="profile-icon-container" ref={userIconRef}>
              {isLoggedIn ? (
                <div
                  className="user-avatar"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  {getInitials(adminName)}
                </div>
              ) : (
                <NavLink to="/admin/auth" className="nav-login" onClick={closeMenu}>
                  <RiUserLine className="mobile-header-icon" /> 
                </NavLink>
              )}

              {/* Profile dropdown for mobile */}
              {showProfileDropdown && isLoggedIn && (
                <div className="profile-dropdown" ref={profileDropdownRef}>
                  <div className="profile-info">
                    <p className="profile-name">{adminName}</p>
                    <p className="profile-role">Admin</p>
                  </div>
                  <NavLink
                    to="/admin/profile"
                    className="dropdown-item"
                    onClick={() => {
                      closeMenu();
                      setShowProfileDropdown(false);
                    }}
                  >
                    View Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout-button"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger menu button */}
            <button
              className="hamburger-menu"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <RiCloseLine className="menu-icon" />
              ) : (
                <IoMenu className="menu-icon" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${isMenuOpen ? "active" : ""}`}
        onClick={closeMenu}
      ></div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? "active" : ""}`}>
        <div className="mobile-menu-content">
          <div className="mobile-nav-items">
            <NavLink
              to="/admin/dashboard"
              className="mobile-nav-item"
              onClick={closeMenu}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/products"
              className="mobile-nav-item"
              onClick={closeMenu}
            >
              Products
            </NavLink>
            <NavLink
              to="/admin/orders"
              className="mobile-nav-item"
              onClick={closeMenu}
            >
              Orders
            </NavLink>
            <NavLink
              to="/admin/users"
              className="mobile-nav-item"
              onClick={closeMenu}
            >
              Users
            </NavLink>
            <NavLink
              to="/admin/settings"
              className="mobile-nav-item"
              onClick={closeMenu}
            >
              Settings
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
