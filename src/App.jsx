import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDeliveryAuth from "./Pages/AdminDeliveryAuth/StaffAuthPages";
import CreateProduct from "./Pages/Products/CreateProducts/CreateProduct";
import Navbar from "./Components/Navbar/Navbar";
import AdminProductList from "./Pages/Products/AdminProductList";
import AdminProductUpdate from "./Pages/Products/UpdateProducts/AdminProductUpdate";
import AdminProductVariantsManagement from "./Pages/Products/UpdateProducts/UpdateProductVariants";
import AdminUsersList from "./Pages/Users/AdminUsersList";
import AdminOrdersList from "./Pages/Orders/AdminOrdersList";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<AdminDeliveryAuth />} />
          <Route path="/products/create" element={<CreateProduct />} />
          <Route path="/admin/products" element={<AdminProductList />} />
          <Route
            path="/products/update/:productId"
            element={<AdminProductUpdate />}
          />
          <Route
            path="/products/:productId/variants"
            element={<AdminProductVariantsManagement />}
          />
          <Route path="/admin/users" element={<AdminUsersList />} />
          <Route path="/admin/orders" element={<AdminOrdersList />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;