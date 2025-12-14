import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageNavigation from '../../page_navigation/PageNavigation.jsx';
import SearchIcon from '../../../assets/search/search.png';
import BackIcon from '../../../assets/vehicle_search_entry/edit.png';
import '../../../styles/search_by/MyOrder/MyOrder.css';
import LeftArrow from '../../../assets/Product/Left_Arrow.png'
const MyOrder = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([
    {
      id: '5340109BAR0012IN',
      date: '10-02-2025',
      quantity: 3,
      status: 'Invoiced',
      location: 'Chennai'
    },
    {
      id: '5340109BAR0012IN',
      date: '10-02-2025',
      quantity: 4,
      status: 'Dispatched',
      location: 'Chennai'
    },
    {
      id: '5340109BAR0012IN',
      date: '10-02-2025',
      quantity: 3,
      status: 'Invoiced',
      location: 'Chennai'
    },
    {
      id: '5340109BAR0012IN',
      date: '10-02-2025',
      quantity: 4,
      status: 'Dispatched',
      location: 'Chennai'
    },
    {
      id: '5340109BAR0012IN',
      date: '10-02-2025',
      quantity: 5,
      status: 'Delivery',
      location: 'Chennai'
    },
    {
      id: '5340109BAR0012IN',
      date: '10-02-2025',
      quantity: 7,
      status: 'Delivery',
      location: 'Chennai'
    },
    {
      id: '5340109BAR0012IN',
      date: '10-02-2025',
      quantity: 1,
      status: 'Delivery',
      location: 'Chennai'
    },
    {
      id: '5340109BAR0012IN',
      date: '10-02-2025',
      quantity: 2,
      status: 'Delivery',
      location: 'Chennai'
    },
    {
      id: '5340109BAR0012IN',
      date: '10-02-2025',
      quantity: 2,
      status: 'Delivery',
      location: 'Chennai'
    },
    {
      id: '5340109BAR0012IN',
      date: '10-02-2025',
      quantity: 3,
      status: 'Delivery',
      location: 'Chennai'
    }
  ]);

  return (
    <div className="myorder-container">
      {/* Top Section with Back Button, Breadcrumb and Filters */}
      <div className="myorder-top-bar">
        <div className="myorder-left-section">
          <button className="back-button" onClick={() => navigate(-1)}>
            <img src={LeftArrow} alt="Back" />
          </button>
          <PageNavigation />
        </div>
        
        <div className="myorder-right-section">
          <div className="date-input-wrapper">
            <input type="date" className="date-input" placeholder="Date" />
          </div>
          <div className="search-input-wrapper">
            <input type="text" placeholder="Search" className="search-input" />
            <img src={SearchIcon} alt="Search" className="search-icon" />
          </div>
          <button className="export-btn">Export</button>
        </div>
      </div>

      {/* Title and Tabs Section */}
      <div className="myorder-title-section">
        <h2 className="myorder-title">My Orders</h2>
        
        <div className="myorder-tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Orders <span className="tab-badge">7</span>
          </button>
          <button 
            className={`tab ${activeTab === 'invoiced' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoiced')}
          >
            Invoiced
          </button>
          <button 
            className={`tab ${activeTab === 'dispatched' ? 'active' : ''}`}
            onClick={() => setActiveTab('dispatched')}
          >
            Dispatched
          </button>
          <button 
            className={`tab ${activeTab === 'delivery' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivery')}
          >
            Delivery
          </button>
        </div>
      </div>

      {/* Orders Table */}
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
            {orders.map((order, index) => (
              <tr key={index}>
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
    </div>
  );
};

export default MyOrder;
