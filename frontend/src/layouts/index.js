import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";

function LayoutAdmin() {
  return (
    <div className="flex min-h-screen bg-[#f7f8fc]  ">
      <Sidebar />
      <div className="bg-[#fdfcf8] flex flex-col flex-1 w-full">
        <Header />
        <Outlet />
      </div>
    </div>
  );
}

export default LayoutAdmin;
