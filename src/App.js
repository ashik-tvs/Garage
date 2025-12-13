import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/header/Layout.jsx";
import Home from "./components/home/Home.jsx";
import VehicleNumberEntry from "./components/search_by/vehicle_number_entry/VehicleNumberEntry.jsx";
import VehicleNumberProduct from "./components/search_by/vehicle_number_entry/VehicleNumberProduct.jsx";
import ServiceTypeSearch from "./components/search_by/service_type/ServiceTypeSearch.jsx";
import ServiceTypeProduct from "./components/search_by/service_type/ServiceTypeProduct.jsx";
import Cart from "./components/cart/Cart.jsx";
import Search from "./components/home/Search.jsx";
import PartNumber from "./components/search_by/partnumber/PartNumber.jsx";
import Image from "./components/search_by/image/Image.jsx";
import { CartProvider } from "./context/CartContext.js";
// import Login from "./components/login/Login.jsx";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />

            <Route
              path="/search-by-vehicle-number"
              element={<VehicleNumberEntry />}
            />
            <Route
              path="/vehicle-number-products"
              element={<VehicleNumberProduct />}
            />
            <Route
              path="/search-by-service-type"
              element={<ServiceTypeSearch />}
            />
            <Route
              path="/service-type-products"
              element={<ServiceTypeProduct />}
            />
            <Route path="/search-by-part-number" element={<PartNumber />} />
            <Route path="/search-by-image" element={<Image />} />
            <Route path="/cart" element={<Cart />} />
          </Route>

          {/* Pages without header */}
          {/* <Route path="/login" element={<Login />} /> */}
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
