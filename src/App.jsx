import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDeliveryAuth from "./Pages/AdminDeliveryAuth/StaffAuthPages";
import ProductManagement from "./Pages/Products/CreateProducts/ProductManagement";
import Navbar from "./Components/Navbar/Navbar";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/admin/auth" element={<AdminDeliveryAuth />} />
          <Route path="/products" element={<ProductManagement />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
