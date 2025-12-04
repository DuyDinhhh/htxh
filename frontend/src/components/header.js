import React from "react";
function MenuIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      aria-hidden="true"
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

const Header = ({ onMenuClick }) => {
  return (
    <header className="bg-white border-b py-3 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="md:hidden p-2 rounded-lg hover:bg-[#ffded6] text-[#d40724] shrink-0"
        >
          <MenuIcon />
        </button>

        <span className="md:hidden text-lg font-bold text-[#d40724] shrink-0">
          Nam Trung
        </span>
      </div>

      <div className="flex items-center">
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
