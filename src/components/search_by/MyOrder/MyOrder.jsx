import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageNavigation from "../../page_navigation/PageNavigation.jsx";
import SearchIcon from "../../../assets/search/search.png";
import LeftArrow from "../../../assets/Product/Left_Arrow.png";
import "../../../styles/search_by/MyOrder/MyOrder.css";

const initialOrders = [
  {
    id: "5340109BAR0012IN",
    date: "2025-02-10",
    quantity: 3,
    status: "Invoiced",
    location: "Chennai",
  },
  {
    id: "5340109BAR0013IN",
    date: "2025-02-10",
    quantity: 4,
    status: "Dispatched",
    location: "Chennai",
  },
  {
    id: "5340109BAR0014IN",
    date: "2025-02-11",
    quantity: 5,
    status: "Delivery",
    location: "Bangalore",
  },
  {
    id: "5340109BAR0015IN",
    date: "2025-02-11",
    quantity: 2,
    status: "Delivery",
    location: "Hyderabad",
  },
  {
    id: "5340109BAR0016IN",
    date: "2025-02-12",
    quantity: 1,
    status: "Invoiced",
    location: "Chennai",
  },
  {
    id: "5340109BAR0017IN",
    date: "2025-02-12",
    quantity: 6,
    status: "Dispatched",
    location: "Mumbai",
  },
];

const MyOrder = () => {
  const navigate = useNavigate();

  const [orders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  /* 🔹 Dynamic filtering logic */
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchTab =
        activeTab === "all" || order.status.toLowerCase() === activeTab;

      const matchSearch =
        order.id.toLowerCase().includes(searchText.toLowerCase()) ||
        order.location.toLowerCase().includes(searchText.toLowerCase()) ||
        order.status.toLowerCase().includes(searchText.toLowerCase());

      const matchDate = !selectedDate || order.date === selectedDate;

      return matchTab && matchSearch && matchDate;
    });
  }, [orders, activeTab, searchText, selectedDate]);

  /* 🔹 Dynamic tab counts */
  const counts = useMemo(() => {
    return {
      all: orders.length,
      invoiced: orders.filter((o) => o.status === "Invoiced").length,
      dispatched: orders.filter((o) => o.status === "Dispatched").length,
      delivery: orders.filter((o) => o.status === "Delivery").length,
    };
  }, [orders]);

  return (
    <div className="myorder-container">
      {/* 🔹 Top Bar */}
      <div className="myorder-top-bar">
        <div className="myorder-left-section">
          <button className="back-button" onClick={() => navigate(-1)}>
            <img src={LeftArrow} alt="Back" />
          </button>
          <PageNavigation />
        </div>

        <div className="myorder-right-section">
          <input
            type="date"
            className="date-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search order, status or location"
              className="search-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <img src={SearchIcon} alt="Search" className="search-icon" />
          </div>

          <button className="export-btn">Export</button>
        </div>
      </div>

      {/* 🔹 Title + Tabs */}
      <div className="myorder-title-section">
        <h2 className="myorder-title">My Orders</h2>

        <div className="myorder-tabs">
          {["all", "invoiced", "dispatched", "delivery"].map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="tab-badge">{counts[tab]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 🔹 Table */}
      <div className="myorder-table-container">
        <table className="myorder-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Date</th>
              <th>Quantity</th>
              <th>Order Status</th>
              <th>Location</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.date}</td>
                  <td>{order.quantity}</td>
                  <td>
                    <span
                      className={`status-badge status-${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{order.location}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyOrder;
