import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  const location = useLocation();
  const hideHeaderRoutes = ["/login"];
  const shouldShowHeader = !hideHeaderRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowHeader && <Header />}
      <main style={{ paddingTop: "65px" }}>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
