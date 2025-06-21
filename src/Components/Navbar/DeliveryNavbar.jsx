import { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { RiUserLine, RiCloseLine } from "react-icons/ri";
import { IoMenu } from "react-icons/io5";
import "../../assets/Fonts/ciguatera.regular.otf";
import "./DeliveryNavbar.css"; // You'll need to create this CSS file

const DeliveryNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // States derived from session storage
  const [loggedInDeliveryPerson, setLoggedInDeliveryPerson] = useState(null);
  const [deliveryPersonName, setDeliveryPersonName] = useState("");

  const profileDropdownRef = useRef(null);
  const userIconRef = useRef(null);
  const navigate = useNavigate();

  // --- Functions to get and store user data ---

  // Function to parse user data from session storage
  const getDeliveryPersonDataFromSession = useCallback(() => {
    try {
      const userString = sessionStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        // Assuming role 2 is delivery person
        if (user && user.role === 2) {
          setLoggedInDeliveryPerson(user);
          // Combine first_name and last_name for the full name
          setDeliveryPersonName(
            `${user.first_name || ""} ${user.last_name || ""}`.trim()
          );
        } else {
          setLoggedInDeliveryPerson(null);
          setDeliveryPersonName("");
        }
      } else {
        setLoggedInDeliveryPerson(null);
        setDeliveryPersonName("");
      }
    } catch (error) {
      console.error("Failed to parse user data from session storage:", error);
      setLoggedInDeliveryPerson(null);
      setDeliveryPersonName("");
      // Clear potentially corrupted session data
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("authToken");
    }
  }, []);

  // Function to clear user data from session storage (logout)
  const clearDeliveryPersonDataFromSession = useCallback(() => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("authToken");
    setLoggedInDeliveryPerson(null);
    setDeliveryPersonName("");
  }, []);

  // --- Effects ---

  // Load delivery person data on component mount and set up listeners
  useEffect(() => {
    getDeliveryPersonDataFromSession();

    // Listen for storage changes in other tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'authToken') {
        getDeliveryPersonDataFromSession();
      }
    };

    // Listen for custom events (for same-tab updates)
    const handleAuthChange = () => {
      getDeliveryPersonDataFromSession();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authStateChanged", handleAuthChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
  }, [getDeliveryPersonDataFromSession]);

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
    try {
      // Clear session data
      clearDeliveryPersonDataFromSession();
      
      // Close dropdown
      setShowProfileDropdown(false);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('authStateChanged'));
      
      // Navigate to staff auth page
      navigate("/staff-auth");
      
      // Show success message after navigation
      setTimeout(() => {
        console.log("Successfully logged out");
      }, 100);
      
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Determine if delivery person is logged in
  const isLoggedIn = !!loggedInDeliveryPerson;

  return (
    <>
      <nav className={`delivery-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar_contents container">
          {/* Desktop Navigation - Left Items (Hidden on mobile) */}
          <div className="desktop-nav nav-items_left">
            <NavLink
              to="/delivery/dashboard"
              className="nav-item_left"
              onClick={closeMenu}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/delivery/orders"
              className="nav-item_left"
              onClick={closeMenu}
            >
              My Orders
            </NavLink>
            <NavLink
              to="/delivery/routes"
              className="nav-item_left"
              onClick={closeMenu}
            >
              Routes
            </NavLink>
            <NavLink
              to="/delivery/history"
              className="nav-item_left"
              onClick={closeMenu}
            >
              History
            </NavLink>
            <NavLink
              to="/delivery/profile"
              className="nav-item_left"
              onClick={closeMenu}
            >
              Profile
            </NavLink>
          </div>

          {/* Logo - Center */}
          <div className="nav-items_logo">
            <NavLink
              to="/delivery/dashboard"
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
                  {getInitials(deliveryPersonName)}
                </div>
              ) : (
                <NavLink to="/staff-auth" className="nav-login_btn btn btn-primary">
                  <RiUserLine className="nav-right_icon-large" /> <p>Login</p>
                </NavLink>
              )}

              {showProfileDropdown && isLoggedIn && (
                <div className="profile-dropdown" ref={profileDropdownRef}>
                  <div className="profile-info">
                    <p className="profile-name">{deliveryPersonName}</p>
                    <p className="profile-role">Delivery Person</p>
                  </div>
                  <NavLink
                    to="/delivery/profile"
                    className="dropdown-item"
                    onClick={() => {
                      closeMenu();
                      setShowProfileDropdown(false);
                    }}
                  >
                    View Profile
                  </NavLink>
                  <NavLink
                    to="/delivery/settings"
                    className="dropdown-item"
                    onClick={() => {
                      closeMenu();
                      setShowProfileDropdown(false);
                    }}
                  >
                    Settings
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
                  {getInitials(deliveryPersonName)}
                </div>
              ) : (
                <NavLink to="/staff-auth" className="nav-login" onClick={closeMenu}>
                  <RiUserLine className="mobile-header-icon" />
                </NavLink>
              )}

              {/* Profile dropdown for mobile */}
              {showProfileDropdown && isLoggedIn && (
                <div className="profile-dropdown" ref={profileDropdownRef}>
                  <div className="profile-info">
                    <p className="profile-name">{deliveryPersonName}</p>
                    <p className="profile-role">Delivery Person</p>
                  </div>
                  <NavLink
                    to="/delivery/profile"
                    className="dropdown-item"
                    onClick={() => {
                      closeMenu();
                      setShowProfileDropdown(false);
                    }}
                  >
                    View Profile
                  </NavLink>
                  <NavLink
                    to="/delivery/settings"
                    className="dropdown-item"
                    onClick={() => {
                      closeMenu();
                      setShowProfileDropdown(false);
                    }}
                  >
                    Settings
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
              to="/delivery/dashboard"
              className="mobile-nav-item"
              onClick={closeMenu}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/delivery/orders"
              className="mobile-nav-item"
              onClick={closeMenu}
            >
              My Orders
            </NavLink>
            <NavLink
              to="/delivery/routes"
              className="mobile-nav-item"
              onClick={closeMenu}
            >
              Routes
            </NavLink>
            <NavLink
              to="/delivery/history"
              className="mobile-nav-item"
              onClick={closeMenu}
            >
              History
            </NavLink>
            <NavLink
              to="/delivery/profile"
              className="mobile-nav-item"
              onClick={closeMenu}
            >
              Profile
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeliveryNavbar;