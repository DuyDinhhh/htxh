const Footer = ({ footerBg, footerTextColor, loadingConfig, config }) => {
  return (
    <footer
      className="w-full mt-2 flex-none flex flex-col justify-center items-center py-4"
      style={{ backgroundColor: footerBg }}
    >
      <div
        className="text-lg font-bold text-center uppercase"
        style={{
          display: "inline-block",
          animation: "marquee 10s linear infinite",
          color: footerTextColor,
        }}
      >
        {loadingConfig ? "Đang tải cấu hình..." : config?.text_bottom ?? ""}
      </div>
    </footer>
  );
};

export default Footer;
