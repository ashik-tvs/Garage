import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/page_navigation/PageNavigation.css";

function PageNavigate() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="breadcrumb-container">
      <div className="breadcrumb-tabs">

        {/* HOME */}
        <Link
          to="/home"
          className={`crumb ${pathnames.length === 0 ? "active" : ""}`}
        >
          Home
        </Link>

        {/* DYNAMIC PATHS */}
        {pathnames.map((segment, index) => {
          const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
          const formatted = segment
            .replace(/-/g, " ") // replace dashes with spaces
            .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize each word
          const isLast = index === pathnames.length - 1;

          return isLast ? (
            <span key={index} className="crumb active">
              {formatted}
            </span>
          ) : (
            <Link key={index} to={routeTo} className="crumb">
              {formatted}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default PageNavigate;
