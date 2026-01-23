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
import MyOrder from "./components/search_by/MyOrder/MyOrder.jsx";
import Brand from "./components/search_by/MyOrder/Brand.jsx";
import MakeNew from "./components/search_by/MyOrder/MakeNew.jsx";
import Model from "./components/search_by/MyOrder/Model.jsx";
import Category from "./components/search_by/MyOrder/Category.jsx";
import CategoryNew from "./components/search_by/MyOrder/CategoryNew.jsx";
import Sub_Category from "./components/search_by/MyOrder/SubCategory.jsx";
import SeviceTypeModel from "./components/search_by/service_type/ServiceTypeModel.jsx";
import SeviceTypeCategory from "./components/search_by/service_type/ServiceTypeCategory.jsx";
import SeviceTypeSubCategory from "./components/search_by/service_type/ServiceTypeSubCategory.jsx";
import Product1Example from "./components/search_by/partnumber/Product1Example.jsx";

import { CartProvider } from "./context/CartContext.js";
import Login from "./components/Login/Login.jsx";
import ForgotPassword from "./components/Login/Forgotpassword.jsx";
import VerifyOtp from "./components/Login/VerifyOtp.jsx";
import ResetPassword from "./components/Login/ResetPassword.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Login page without Layout */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<Layout />}>
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
            <Route
              path="/service-type-category"
              element={<SeviceTypeCategory />}
            />
            <Route
              path="/service-type-sub-category"
              element={<SeviceTypeSubCategory />}
            />
            <Route path="/service-type-model" element={<SeviceTypeModel />} />
            <Route path="/search-by-part-number" element={<PartNumber />} />
            <Route path="/search-by-image" element={<Image />} />
            <Route path="/my-orders" element={<MyOrder />} />
            <Route path="/brand" element={<Brand />} />
            <Route path="/MakeNew" element={<MakeNew />} />
            <Route path="/Model" element={<Model />} />
            <Route path="/Category" element={<Category />} />
            <Route path="/CategoryNew" element={<CategoryNew />} />
            <Route path="/sub_category" element={<Sub_Category />} />
            <Route path="/product1-example" element={<Product1Example />} />
            {/* <Route path="/make1" element={<Make1 />} /> */}
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
