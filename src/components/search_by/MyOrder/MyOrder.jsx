import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../../services/apiservice";
import PageNavigation from "../../page_navigation/PageNavigation.jsx";
import SearchIcon from "../../../assets/search/search.png";
import LeftArrow from "../../../assets/Product/Left_Arrow.png";
import "../../../styles/search_by/MyOrder/MyOrder.css";

const ITEMS_PER_PAGE = 6;

const MyOrder = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      console.log("[MyOrder] Fetching orders...");

      try {
        const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];

        console.log("[MyOrder] Stored orders:", storedOrders);

        // Step 2: For each order, fetch status from API
        const ordersWithStatus = await Promise.all(
          storedOrders.map(async (order) => {
            console.log("[MyOrder] Processing order:", order.sourceOrderId);

            try {
              const res = await apiService.get("/order/status", {
                params: { source_order_id: order.sourceOrderId }, // keep this
              });

              console.log(
                `[MyOrder] Status API response for ${order.sourceOrderId}:`,
                res.data
              );

              return {
                ...order,
                status: res.data.SalesOrder_status || order.status || "PENDING",
                orderNumber: res.data.SalesOrder_number || order.orderNumber,
              };
            } catch (err) {
              console.error(
                `[MyOrder] Failed to get status for ${order.sourceOrderId}:`,
                err.response?.data || err.message
              );
              return { ...order, status: order.status || "PENDING" }; // fallback
            }
          })
        );

        console.log(
          "[MyOrder] Orders after fetching status:",
          ordersWithStatus
        );

        setOrders(ordersWithStatus);
      } catch (err) {
        console.error("[MyOrder] Error fetching orders:", err.message);
      } finally {
        setLoading(false);
        console.log("[MyOrder] Fetching orders finished.");
      }
    };

    fetchOrders();
  }, []);

  /* 🔹 Filter logic */
  const filteredOrders = useMemo(() => {
    setCurrentPage(1); // reset page on filter change
    return orders.filter((order) => {
      const status = order.status || "PENDING"; // fallback if undefined
      const matchTab =
        activeTab === "all" || status.toLowerCase() === activeTab;

      const matchSearch =
        (order.id || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (order.location || "")
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        status.toLowerCase().includes(searchText.toLowerCase());

      const matchDate = !selectedDate || order.date === selectedDate;

      // Console log to trace filtering issues
      if (!matchTab || !matchSearch || !matchDate) {
        console.log(
          `[MyOrder][Filter] Excluding order ${order.orderNumber || order.id}:`,
          { status, matchTab, matchSearch, matchDate }
        );
      }

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
  const counts = useMemo(
    () => ({
      all: orders.length,
      invoiced: orders.filter((o) => o.status === "Invoiced").length,
      dispatched: orders.filter((o) => o.status === "Dispatched").length,
      delivery: orders.filter((o) => o.status === "Delivery").length,
    }),
    [orders]
  );

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
        {loading ? (
          <div>Loading orders...</div>
        ) : (
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
              {paginatedOrders.map((order, idx) => (
                <tr key={order.id || idx}>
                  <td>{order.orderNumber}</td> {/* show orderNumber here */}
                  <td>{order.date}</td>
                  <td>{order.quantity}</td>
                  <td>
                    <span
                      className={`status-badge status-${(
                        order.status || "pending"
                      ).toLowerCase()}`}
                    >
                      {order.status || "PENDING"}
                    </span>
                  </td>
                  <td>{order.location || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
