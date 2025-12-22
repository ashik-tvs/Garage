import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageNavigation from "../../page_navigation/PageNavigation.jsx";
import SearchIcon from "../../../assets/search/search.png";
import LeftArrow from "../../../assets/Product/Left_Arrow.png";
import "../../../styles/search_by/MyOrder/MyOrder.css";

/* 🔹 Expanded mock data */
const initialOrders = Array.from({ length: 28 }, (_, i) => ({
  id: `5340109BAR00${i + 12}IN`,
  date: `2025-02-${(i % 5) + 10}`,
  quantity: (i % 6) + 1,
  status: ["Invoiced", "Dispatched", "Delivery"][i % 3],
  location: ["Chennai", "Bangalore", "Mumbai", "Hyderabad"][i % 4],
}));

const ITEMS_PER_PAGE =6;

const MyOrder = () => {
  const navigate = useNavigate();

  const [orders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /* 🔹 Filter logic */
  const filteredOrders = useMemo(() => {
    setCurrentPage(1); // reset page on filter change
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

  /* 🔹 Pagination calculations */
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  /* 🔹 Tab counts */
  const counts = useMemo(() => ({
    all: orders.length,
    invoiced: orders.filter((o) => o.status === "Invoiced").length,
    dispatched: orders.filter((o) => o.status === "Dispatched").length,
    delivery: orders.filter((o) => o.status === "Delivery").length,
  }), [orders]);

  return (
    <div className="myorder-container">
      {/* Top Bar */}
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

      {/* Title & Tabs */}
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

      {/* Table */}
      <div className="myorder-table-container">
        <table className="myorder-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Date</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.date}</td>
                <td>{order.quantity}</td>
                <td>
                  <span className={`status-badge status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 PAGINATION */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "active" : ""}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MyOrder;
