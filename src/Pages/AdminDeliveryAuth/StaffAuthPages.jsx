import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle,
  AlertCircle,
  Shield, // Icon for Admin
  Truck, // Icon for Delivery Person
} from "lucide-react";
import { HiOutlineArrowLongRight } from "react-icons/hi2";
import { authAPI } from "../../Config/api"; // Adjust path based on where Config/api.js is relative to this new file
import "./StaffAuthPages.css"; // Create this CSS file
import heroAdmin from "../../assets/AdminDeliveryImages/HeroImage.jpg";
import heroDelivery from "../../assets/AdminDeliveryImages/HeroImage.jpg";
// import img2 from "../../assets/AdminDeliveryImages/HeroImage.jpg"

// Message component (Can be a shared utility component)
const MessageAlert = ({ type, text }) => {
  if (!text) return null;
  return (
    <div className={`message-alert ${type}`}>
      {type === "success" ? <CheckCircle /> : <AlertCircle />}
      <span>{text}</span>
    </div>
  );
};

// --- Sub-components for Role Selection, Admin Login/Signup, Delivery Login/Signup ---

// Component for initial Role Selection
const RoleSelection = ({ selectRole }) => (
  <div className="auth-form-full-width auth-role-selection">
    <div className="auth-header">
      <h2 className="auth-title">Welcome, Staff!</h2>
      <p className="auth-subtitle">Please choose your role to sign in or sign up.</p>
    </div>
    <div className="role-options">
      <button onClick={() => selectRole('admin')} className="role-card">
        <Shield size={48} />
        <h3>Admin Portal</h3>
        <p>Manage store operations, products, and orders.</p>
      </button>
      <button onClick={() => selectRole('delivery')} className="role-card">
        <Truck size={48} />
        <h3>Delivery Portal</h3>
        <p>Manage deliveries and track customer orders.</p>
      </button>
    </div>
  </div>
);

// Component for Admin Login Form
const AdminLoginForm = ({
  loginData, setLoginData, showPassword, setShowPassword, handleLogin, loading, message, switchToSignup
}) => (
  <div className="auth-form">
    <div className="auth-header">
      <h2 className="auth-title">Admin Login</h2>
      <p className="auth-subtitle">Sign in to your admin account</p>
    </div>
    <MessageAlert type={message.type} text={message.text} />
    <form onSubmit={(e) => { e.preventDefault(); handleLogin(1); }}> {/* Pass role ID 1 for admin */}
      <div className="form-group">
        <label className="form-label">Email Address</label>
        <div className="input-group">
          <Mail className="input-icon" />
          <input type="email" required value={loginData.email} onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))} className="form-input" placeholder="Enter your admin email" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Password</label>
        <div className="input-group">
          <Lock className="input-icon" />
          <input type={showPassword ? "text" : "password"} required value={loginData.password} onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))} className="form-input password-input" placeholder="Enter your password" />
          <button type="button" onClick={() => setShowPassword(prev => !prev)} className="password-toggle">{showPassword ? <EyeOff /> : <Eye />}</button>
        </div>
      </div>
      <button type="submit" disabled={loading} className="auth-submit-btn">
        {loading ? <div className="loading-spinner"></div> : <>Sign In <HiOutlineArrowLongRight /></>}
      </button>
    </form>
    <div className="auth-footer">
      <p>
        Don't have an admin account?{" "}
        <button onClick={switchToSignup} className="auth-link" type="button">
          Sign up here
        </button>
      </p>
    </div>
  </div>
);

// Component for Admin Signup Form
const AdminSignupForm = ({
  signupData, setSignupData, showPassword, showConfirmPassword, setShowPassword, setShowConfirmPassword, handleSignup, loading, message, switchToLogin
}) => (
  <div className="auth-form-wide">
    <div className="auth-header">
      <h2 className="auth-title">Create Admin Account</h2>
      <p className="auth-subtitle">Register a new admin staff account</p>
    </div>
    <MessageAlert type={message.type} text={message.text} />
    <form onSubmit={(e) => { e.preventDefault(); handleSignup(1); }}> {/* Pass role ID 1 for admin */}
      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label className="form-label">First Name</label>
          <div className="input-group"><User className="input-icon" /><input type="text" required value={signupData.first_name} onChange={(e) => setSignupData(prev => ({ ...prev, first_name: e.target.value }))} className="form-input" placeholder="Enter first name" /></div>
        </div>
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <div className="input-group"><User className="input-icon" /><input type="text" required value={signupData.last_name} onChange={(e) => setSignupData(prev => ({ ...prev, last_name: e.target.value }))} className="form-input" placeholder="Enter last name" /></div>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Email Address</label>
        <div className="input-group"><Mail className="input-icon" /><input type="email" required value={signupData.email} onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))} className="form-input" placeholder="Enter email address" /></div>
      </div>
      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-group"><Lock className="input-icon" /><input type={showPassword ? "text" : "password"} required minLength={6} value={signupData.password} onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))} className="form-input password-input" placeholder="Create password" /><button type="button" onClick={() => setShowPassword(prev => !prev)} className="password-toggle">{showPassword ? <EyeOff /> : <Eye />}</button></div>
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <div className="input-group"><Lock className="input-icon" /><input type={showConfirmPassword ? "text" : "password"} required minLength={6} value={signupData.password_confirmation} onChange={(e) => setSignupData(prev => ({ ...prev, password_confirmation: e.target.value }))} className="form-input password-input" placeholder="Confirm password" /><button type="button" onClick={() => setShowConfirmPassword(prev => !prev)} className="password-toggle">{showConfirmPassword ? <EyeOff /> : <Eye />}</button></div>
        </div>
      </div>
      <button type="submit" disabled={loading} className="auth-submit-btn">
        {loading ? <div className="loading-spinner"></div> : <>Create Admin Account <HiOutlineArrowLongRight /></>}
      </button>
    </form>
    <div className="auth-footer">
      <p>
        Already have an account?{" "}
        <button onClick={switchToLogin} className="auth-link" type="button">
          Sign in here
        </button>
      </p>
    </div>
  </div>
);

// Component for Delivery Login Form
const DeliveryLoginForm = ({
  loginData, setLoginData, showPassword, setShowPassword, handleLogin, loading, message, switchToSignup
}) => (
  <div className="auth-form">
    <div className="auth-header">
      <h2 className="auth-title">Delivery Login</h2>
      <p className="auth-subtitle">Sign in to your delivery account</p>
    </div>
    <MessageAlert type={message.type} text={message.text} />
    <form onSubmit={(e) => { e.preventDefault(); handleLogin(2); }}> {/* Pass role ID 2 for delivery */}
      <div className="form-group">
        <label className="form-label">Email Address</label>
        <div className="input-group">
          <Mail className="input-icon" />
          <input type="email" required value={loginData.email} onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))} className="form-input" placeholder="Enter your delivery email" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Password</label>
        <div className="input-group">
          <Lock className="input-icon" />
          <input type={showPassword ? "text" : "password"} required value={loginData.password} onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))} className="form-input password-input" placeholder="Enter your password" />
          <button type="button" onClick={() => setShowPassword(prev => !prev)} className="password-toggle">{showPassword ? <EyeOff /> : <Eye />}</button>
        </div>
      </div>
      <button type="submit" disabled={loading} className="auth-submit-btn">
        {loading ? <div className="loading-spinner"></div> : <>Sign In <HiOutlineArrowLongRight /></>}
      </button>
    </form>
    <div className="auth-footer">
      <p>
        Don't have a delivery account?{" "}
        <button onClick={switchToSignup} className="auth-link" type="button">
          Sign up here
        </button>
      </p>
    </div>
  </div>
);

// Component for Delivery Signup Form
const DeliverySignupForm = ({
  signupData, setSignupData, showPassword, showConfirmPassword, setShowPassword, setShowConfirmPassword, handleSignup, loading, message, switchToLogin
}) => (
  <div className="auth-form-wide">
    <div className="auth-header">
      <h2 className="auth-title">Create Delivery Account</h2>
      <p className="auth-subtitle">Register a new delivery staff account</p>
    </div>
    <MessageAlert type={message.type} text={message.text} />
    <form onSubmit={(e) => { e.preventDefault(); handleSignup(2); }}> {/* Pass role ID 2 for delivery */}
      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label className="form-label">First Name</label>
          <div className="input-group"><User className="input-icon" /><input type="text" required value={signupData.first_name} onChange={(e) => setSignupData(prev => ({ ...prev, first_name: e.target.value }))} className="form-input" placeholder="Enter first name" /></div>
        </div>
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <div className="input-group"><User className="input-icon" /><input type="text" required value={signupData.last_name} onChange={(e) => setSignupData(prev => ({ ...prev, last_name: e.target.value }))} className="form-input" placeholder="Enter last name" /></div>
        </div>
      </div>
      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="input-group"><Mail className="input-icon" /><input type="email" required value={signupData.email} onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))} className="form-input" placeholder="Enter email address" /></div>
        </div>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <div className="input-group"><Phone className="input-icon" /><input type="tel" required value={signupData.phone_number} onChange={(e) => setSignupData(prev => ({ ...prev, phone_number: e.target.value }))} className="form-input" placeholder="e.g., 0712345678" /></div>
        </div>
      </div>
      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-group"><Lock className="input-icon" /><input type={showPassword ? "text" : "password"} required minLength={6} value={signupData.password} onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))} className="form-input password-input" placeholder="Create password" /><button type="button" onClick={() => setShowPassword(prev => !prev)} className="password-toggle">{showPassword ? <EyeOff /> : <Eye />}</button></div>
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <div className="input-group"><Lock className="input-icon" /><input type={showConfirmPassword ? "text" : "password"} required minLength={6} value={signupData.password_confirmation} onChange={(e) => setSignupData(prev => ({ ...prev, password_confirmation: e.target.value }))} className="form-input password-input" placeholder="Confirm password" /><button type="button" onClick={() => setShowConfirmPassword(prev => !prev)} className="password-toggle">{showConfirmPassword ? <EyeOff /> : <Eye />}</button></div>
        </div>
      </div>
      <button type="submit" disabled={loading} className="auth-submit-btn">
        {loading ? <div className="loading-spinner"></div> : <>Create Delivery Account <HiOutlineArrowLongRight /></>}
      </button>
    </form>
    <div className="auth-footer">
      <p>
        Already have an account?{" "}
        <button onClick={switchToLogin} className="auth-link" type="button">
          Sign in here
        </button>
      </p>
    </div>
  </div>
);


// --- Main StaffAuthPages Component ---
const StaffAuthPages = () => {
  // State to manage the current view: 'roleSelection', 'adminLogin', 'adminSignup', 'deliveryLogin', 'deliverySignup'
  const [currentView, setCurrentView] = useState("roleSelection");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();


  // Reusable login form state (email, password will be common)
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Separate signup form states for each role (to manage specific fields like phone_number)
  const [adminSignupData, setAdminSignupData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: 1, // Hardcoded role for Admin
  });

  const [deliverySignupData, setDeliverySignupData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "", // Delivery person might need a phone number
    email: "",
    password: "",
    password_confirmation: "",
    role: 2, // Hardcoded role for Delivery Person
  });

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  }, []);

  // Handler for selecting a role from the initial screen
  const handleRoleSelection = useCallback((roleType) => {
    setCurrentView(`${roleType}Login`); // Go directly to login for the selected role
    setMessage({ type: "", text: "" }); // Clear any previous messages
    setLoginData({ email: "", password: "" }); // Clear login data
    setShowPassword(false);
  }, []);

  // Unified Login Handler for both Admin and Delivery
  const handleLogin = useCallback(async (expectedRole) => {
    setLoading(true);
    try {
      const response = await authAPI.signIn({
        email: loginData.email,
        password: loginData.password,
      });

      // Crucial: Check if the returned user's role matches the portal they are logging into
      if (response.user.role !== expectedRole) {
        showMessage("error", "Access Denied: Incorrect role for this portal.");
        // Force sign out and clear session if role mismatch
        authAPI.signOut();
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("authToken");
        return;
      }

      showMessage("success", response.message || "Login successful!");
      sessionStorage.setItem("user", JSON.stringify(response.user));
      sessionStorage.setItem("authToken", response.token);
      setLoginData({ email: "", password: "" });

      // Redirect based on the actual logged-in role
      if (response.user.role === 1) { // Admin role
        navigate ("/products"); // Example: root of admin dashboard
      } else if (response.user.role === 2) { // Delivery Person role
        navigate ("/delivery/dashboard"); // Example: root of delivery dashboard
      }
    } catch (error) {
      showMessage("error", error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }, [loginData, showMessage]);

  // Unified Signup Handler for both Admin and Delivery
  const handleSignup = useCallback(async (roleToAssign) => {
    setLoading(true);

    let currentSignupData;
    if (roleToAssign === 1) {
      currentSignupData = adminSignupData;
    } else if (roleToAssign === 2) {
      currentSignupData = deliverySignupData;
    }

    if (currentSignupData.password !== currentSignupData.password_confirmation) {
      showMessage("error", "Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { password_confirmation, ...userData } = currentSignupData;
      const response = await authAPI.signUp(userData); // Backend handles role

      showMessage("success", response.message || "Account created successfully!");
      // Clear specific signup data after success
      if (roleToAssign === 1) {
        setAdminSignupData({
          first_name: "", last_name: "", email: "", password: "",
          password_confirmation: "", role: 1,
        });
        setCurrentView("adminLogin"); // Go back to admin login after signup
      } else if (roleToAssign === 2) {
        setDeliverySignupData({
          first_name: "", last_name: "", phone_number: "", email: "", password: "",
          password_confirmation: "", role: 2,
        });
        setCurrentView("deliveryLogin"); // Go back to delivery login after signup
      }
      setTimeout(() => setMessage({ type: "", text: "" }), 2000); // Clear success message quickly
    } catch (error) {
      showMessage("error", error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }, [adminSignupData, deliverySignupData, showMessage]);


  // Navigation handlers within the component
  const switchToAdminSignup = useCallback(() => setCurrentView("adminSignup"), []);
  const switchToAdminLogin = useCallback(() => setCurrentView("adminLogin"), []);
  const switchToDeliverySignup = useCallback(() => setCurrentView("deliverySignup"), []);
  const switchToDeliveryLogin = useCallback(() => setCurrentView("deliveryLogin"), []);
  const backToRoleSelection = useCallback(() => setCurrentView("roleSelection"), []);


  // Determine which form to render based on currentView state
  const renderAuthForm = () => {
    switch (currentView) {
      case "roleSelection":
        return <RoleSelection selectRole={handleRoleSelection} />;
      case "adminLogin":
        return (
          <AdminLoginForm
            loginData={loginData} setLoginData={setLoginData}
            showPassword={showPassword} setShowPassword={setShowPassword}
            handleLogin={handleLogin} loading={loading} message={message}
            switchToSignup={switchToAdminSignup}
          />
        );
      case "adminSignup":
        return (
          <AdminSignupForm
            signupData={adminSignupData} setSignupData={setAdminSignupData}
            showPassword={showPassword} showConfirmPassword={showConfirmPassword}
            setShowPassword={setShowPassword} setShowConfirmPassword={setShowConfirmPassword}
            handleSignup={handleSignup} loading={loading} message={message}
            switchToLogin={switchToAdminLogin}
          />
        );
      case "deliveryLogin":
        return (
          <DeliveryLoginForm
            loginData={loginData} setLoginData={setLoginData}
            showPassword={showPassword} setShowPassword={setShowPassword}
            handleLogin={handleLogin} loading={loading} message={message}
            switchToSignup={switchToDeliverySignup}
          />
        );
      case "deliverySignup":
        return (
          <DeliverySignupForm
            signupData={deliverySignupData} setSignupData={setDeliverySignupData}
            showPassword={showPassword} showConfirmPassword={showConfirmPassword}
            setShowPassword={setShowPassword} setShowConfirmPassword={setShowConfirmPassword}
            handleSignup={handleSignup} loading={loading} message={message}
            switchToLogin={switchToDeliveryLogin}
          />
        );
      default:
        return <RoleSelection selectRole={handleRoleSelection} />;
    }
  };

  // Determine decoration image and text based on currentView
  const getDecorationContent = () => {
    let image = heroAdmin; // Default
    let title = "Staff Portal";
    let text = "Select your role to access the internal system.";

    if (currentView.startsWith("admin")) {
      image = heroAdmin;
      title = currentView === "adminLogin" ? "Admin Login" : "Admin Signup";
      text = currentView === "adminLogin"
        ? "Sign in to manage the entire liquor delivery operation."
        : "Register to become an administrator.";
    } else if (currentView.startsWith("delivery")) {
      image = heroDelivery;
      title = currentView === "deliveryLogin" ? "Delivery Login" : "Delivery Signup";
      text = currentView === "deliveryLogin"
        ? "Sign in to manage and track your delivery routes."
        : "Join our team as a delivery person.";
    }

    return { image, title, text };
  };

  const { image: decorationImage, title: decorationTitle, text: decorationText } = getDecorationContent();

  return (
    <div className="auth-container section">
      <div className="auth-card">
        {renderAuthForm()}

        <div className="auth-decoration">
          <div className="decoration-content">
            <img
              src={decorationImage}
              alt="Illustration"
              className="decoration-image"
            />
            <h2 className="decoration-title">{decorationTitle}</h2>
            <p className="decoration-text">{decorationText}</p>
            {(currentView !== 'roleSelection') && (
              <button onClick={backToRoleSelection} className="auth-link back-to-roles">
                &larr; Back to Role Selection
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffAuthPages;