import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";

function LayoutAdmin() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  return (
    <div className="flex min-h-screen bg-[#f7f8fc]  ">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="bg-[#fdfcf8] flex flex-col flex-1 w-full">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <Outlet />
      </div>
    </div>
  );
}

export default LayoutAdmin;
