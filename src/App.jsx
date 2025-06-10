import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDeliveryAuth from "./Pages/AdminDeliveryAuth/StaffAuthPages";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminDeliveryAuth />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
