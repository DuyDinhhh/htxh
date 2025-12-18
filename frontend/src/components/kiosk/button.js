const DEFAULT_BUTTON_BG = "#8B4513";

const isValidHex = (val = "") =>
  /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test((val || "").trim());

const normalizeHex = (val = "") => {
  const v = (val || "").trim();
  if (/^#([0-9A-Fa-f]{6})$/.test(v)) return v.toLowerCase();
  if (/^#([0-9A-Fa-f]{3})$/.test(v)) {
    const short = v.slice(1).split("");
    return ("#" + short.map((c) => c + c).join("")).toLowerCase();
  }
  return v;
};

const safeColor = (val, fallback) =>
  isValidHex(val) ? normalizeHex(val) : fallback;

const ServiceButton = ({
  service,
  isRegistering,
  onRegister,
  settings,
  isMobile,
  useFixedOnMobile,
  isAbsolutePositioned = false,
}) => {
  const applyFixed = !isMobile || useFixedOnMobile;
  const buttonWidthStyle = applyFixed ? `${settings.width}px` : "100%";

  const buttonStyle = {
    width: isAbsolutePositioned ? `${settings.width}px` : buttonWidthStyle,
    maxWidth: "100%",
    height: `${settings.height}px`,
    backgroundColor: safeColor(service.color, null) || DEFAULT_BUTTON_BG,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "0 12px",
    boxSizing: "border-box",
    border: "none",
  };

  return (
    <button
      disabled={isRegistering}
      onClick={() => onRegister(service.id)}
      className={`
        rounded-xl text-white shadow transition uppercase font-semibold text-xl sm:text-2xl md:text-2xl
        flex items-center justify-center  whitespace-normal break-words leading-tight
        ${
          isRegistering
            ? "opacity-60 cursor-not-allowed"
            : "hover:brightness-90"
        }
      `}
      style={buttonStyle}
    >
      <span
        className="block"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          width: "100%",
        }}
      >
        {service.name}
      </span>
    </button>
  );
};

export default ServiceButton;
