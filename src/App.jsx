import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDeliveryAuth from "./Pages/AdminDeliveryAuth/StaffAuthPages";
import ProductManagement from "./Pages/Products/CreateProducts/ProductManagement";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminDeliveryAuth />} />
          <Route path="/products" element={<ProductManagement />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
