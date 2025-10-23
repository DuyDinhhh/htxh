import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function HomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  );
}
function MonitorIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2"></rect>
      <line x1="8" x2="16" y1="21" y2="21"></line>
      <line x1="12" x2="12" y1="17" y2="21"></line>
    </svg>
  );
}
function FileTextIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <line x1="10" y1="9" x2="8" y2="9"></line>
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      class="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
      />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  );
}
function ActivityIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}

function SidebarItem({ icon, label, to, active, onClick, asButton = false }) {
  const baseClass =
    "flex items-center px-4 py-3 cursor-pointer transition-colors select-none gap-3";
  const activeClass = "bg-[#d40724] text-white font-bold rounded-xl";
  const inactiveClass =
    "text-black hover:bg-[#ffded6] hover:text-red-500 font-bold rounded-xl";
  const content = (
    <>
      <span className="text-current">{icon}</span>
      <span>{label}</span>
    </>
  );

  if (asButton) {
    return (
      <button
        onClick={onClick}
        className={`${baseClass} w-full text-left ${
          active ? activeClass : inactiveClass
        }`}
        aria-expanded={active ? "true" : "false"}
      >
        {content}
        <svg
          className={`ml-auto w-4 h-4 transition-transform duration-200 ${
            active ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <polyline
            points="6 9 12 15 18 9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }

  return (
    <Link
      to={to}
      className={`${baseClass} ${active ? activeClass : inactiveClass}`}
    >
      {content}
    </Link>
  );
}

export function Sidebar() {
  const location = useLocation();
  // Dropdowns
  const [isPlaylistsOpen, setIsPlaylistsOpen] = useState(false);
  const [isDevicesOpen, setIsDevicesOpen] = useState(false);
  const [isMonitoringOpen, setIsMonitoringOpen] = useState(false);

  const isActive = (base) =>
    location.pathname.toLowerCase().startsWith(base.toLowerCase());

  useEffect(() => {
    if (isActive("/playlists") || isActive("/playlist_contents"))
      setIsPlaylistsOpen(true);
    if (
      isActive("/devices") ||
      isActive("/device_groups") ||
      isActive("/device_configurations") ||
      isActive("/device_group_mappings")
    )
      setIsDevicesOpen(true);
    if (isActive("/logs") || isActive("/deployment_logs"))
      setIsMonitoringOpen(true);
  }, [location.pathname]);

  return (
    <aside className="w-64 bg-[#f7f8fc] border-r border-[#dbdee4] hidden md:flex flex-col">
      <div className="p-4 border-b border-[#dbdee4]">
        <Link to="/">
          <h2 className="h-16 text-2xl font-bold text-[#d40724] flex items-center justify-center">
            Nam Trung
          </h2>
        </Link>
      </div>
      <nav className="flex-1 mx-4 py-4 flex flex-col gap-1">
        <div className="flex flex-col gap-2 rounded-full">
          <SidebarItem
            icon={<HomeIcon />}
            label="Dashboard"
            to="/dashboards"
            active={isActive("/dashboards")}
          />
          <SidebarItem
            icon={<FileTextIcon />}
            label="Feedback"
            to="/feedbacks"
            active={isActive("/feedbacks")}
          />
          <SidebarItem
            icon={<ListIcon />}
            label="Service"
            to="/services"
            active={isActive("/services")}
          />
          <SidebarItem
            icon={<MonitorIcon />}
            label="Device"
            to="/devices"
            active={isActive("/devices")}
          />
          <SidebarItem
            icon={<TicketIcon />}
            label="Ticket"
            to="/tickets"
            active={isActive("/tickets")}
          />

          <SidebarItem
            icon={<ActivityIcon />}
            label="Monitoring"
            active={isMonitoringOpen}
            onClick={() => setIsMonitoringOpen((prev) => !prev)}
            asButton
          />
          {isMonitoringOpen && (
            <div className="ml-8 flex flex-col gap-1">
              <SidebarItem
                icon={
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                }
                label="Logs"
                to="/logs"
                active={isActive("/logs")}
              />
              <SidebarItem
                icon={
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                }
                label="Deployment Logs"
                to="/deployment_logs"
                active={isActive("/deployment_logs")}
              />
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
