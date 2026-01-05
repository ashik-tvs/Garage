import React from "react";
import Category from "./Category";
import Features from "./Features";
import Make from "./Make";
import Search from "./Search";
import "../../styles/home/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <Search />
      <Features />
      <Category />
      <Make />
    </div>
  );
};

export default Home;
