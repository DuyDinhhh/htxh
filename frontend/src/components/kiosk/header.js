const Header = ({
  headerBg,
  headerTextColor,
  logoSrc,
  loadingConfig,
  config,
}) => {
  return (
    <header
      className="w-full flex-none flex flex-col items-center mb-2 justify-center px-10 py-4"
      style={{ backgroundColor: headerBg }}
    >
      <img
        src={logoSrc}
        alt="Header Logo"
        className="h-20 w-96 object-contain"
      />
      <div
        className="text-lg font-semibold text-center uppercase"
        style={{ color: headerTextColor }}
      >
        {loadingConfig ? "Đang tải cấu hình..." : config?.text_top ?? ""}
      </div>
    </header>
  );
};
export default Header;
