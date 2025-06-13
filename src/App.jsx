import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDeliveryAuth from "./Pages/AdminDeliveryAuth/StaffAuthPages";
import CreateProduct from "./Pages/Products/CreateProducts/CreateProduct";
import Navbar from "./Components/Navbar/Navbar";
// import CreateProduct from "./Pages/Products/CreateProducts/CreateProduct";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<AdminDeliveryAuth />} />
          <Route path="/products" element={<CreateProduct />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
