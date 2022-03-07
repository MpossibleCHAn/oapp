import * as React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Users from "./Users";

export const Nav = () => {
  return (
    <>
      <div>Nav</div>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/users" element={<Users />} />
      </Routes>
    </>
  );
};
