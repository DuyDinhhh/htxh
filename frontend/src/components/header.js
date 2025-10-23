import React from "react";

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-400"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-400"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  );
}

const Header = () => {
  return (
    <header className="bg-[#ffffff] border-b  py-4 px-6 flex items-center justify-between">
      <div className="relative w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="text"
          className="bg-[#eff2f8] border border-[#e1e4eb] text-white rounded-md py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search for projects"
        />
      </div>

      <div className="flex items-center">
        <div className="relative mr-4">
          <BellIcon />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
