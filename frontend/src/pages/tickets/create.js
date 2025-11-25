import React, { useEffect, useState, useCallback, useRef } from "react";
import ServiceService from "../../services/serviceService";
import TicketService from "../../services/ticketService";
import ConfigService from "../../services/configService";
import { toast } from "react-toastify";
import { debounce } from "lodash";

const DEFAULT_BG = "#B3AAAA";
const DEFAULT_HEADER_TEXT_COLOR = "#b10730";
const DEFAULT_BUTTON_BG = "#8B4513";

const DEFAULT_BUTTON_WIDTH = 420;
const DEFAULT_BUTTON_HEIGHT = 90;

const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const isAbsoluteUrl = (url = "") => /^https?:\/\//i.test(url);
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

const parseLayoutFromServer = (
  data,
  setGlobalDims,
  setPerServiceSettings,
  setUseFixedOnMobile
) => {
  if (data?.global) {
    const g = data.global;
    setGlobalDims({
      width: typeof g.width === "number" ? g.width : DEFAULT_BUTTON_WIDTH,
      height: typeof g.height === "number" ? g.height : DEFAULT_BUTTON_HEIGHT,
      hAlign: g.h_align || "center",
      vAlign: g.v_align || "center",
    });
    setUseFixedOnMobile(!!g.use_fixed_on_mobile);
  }

  if (Array.isArray(data?.services)) {
    const map = {};
    data.services.forEach((item) => {
      if (!item.service_id) return;
      map[item.service_id] = {
        width: typeof item.width === "number" ? item.width : undefined,
        height: typeof item.height === "number" ? item.height : undefined,
        hAlign: item.h_align || undefined,
        vAlign: item.v_align || undefined,
        x: typeof item.x === "number" ? item.x : undefined,
        y: typeof item.y === "number" ? item.y : undefined,
      };
    });
    setPerServiceSettings(map);
  }
};

const TicketDisplay = () => {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [registering, setRegistering] = useState({});

  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // layout từ config/buttons
  const [globalDims, setGlobalDims] = useState({
    width: DEFAULT_BUTTON_WIDTH,
    height: DEFAULT_BUTTON_HEIGHT,
    hAlign: "center",
    vAlign: "center",
  });
  const [perServiceSettings, setPerServiceSettings] = useState({});
  const [useFixedOnMobile, setUseFixedOnMobile] = useState(false);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  const resizeListenerRef = useRef(null);
  const canvasRef = useRef(null);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  /** ------------ RESPONSIVE ------------- */
  useEffect(() => {
    const onResize = debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 120);
    window.addEventListener("resize", onResize);
    resizeListenerRef.current = onResize;
    return () => {
      if (resizeListenerRef.current) {
        window.removeEventListener("resize", resizeListenerRef.current);
        resizeListenerRef.current.cancel?.();
      }
    };
  }, []);

  /** ------------ LOAD SERVICES ------------- */
  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const response = await ServiceService.list();
        const validServices = (response.services || []).filter(
          (service) =>
            Array.isArray(service.devices) &&
            service.devices.length > 0 &&
            !service.deleted_at
        );
        setServices(validServices || []);
      } catch (err) {
        setServices([]);
        toast.error("Lỗi khi tải dịch vụ", { autoClose: 500 });
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  /** ------------ LOAD HEADER/FOOTER CONFIG ------------- */
  useEffect(() => {
    let mounted = true;
    const loadConfig = async () => {
      setLoadingConfig(true);
      try {
        const res = await ConfigService.index();
        const cfg = res?.data?.config || res?.config || res || null;
        if (!cfg) throw new Error("No config");

        const bgTop =
          safeColor(cfg?.bg_top_color, null) ||
          safeColor(cfg?.color_top, DEFAULT_BG) ||
          DEFAULT_BG;
        const bgBottom =
          safeColor(cfg?.bg_bottom_color, null) ||
          safeColor(cfg?.color_bottom, DEFAULT_BG) ||
          DEFAULT_BG;
        const photoUrl = cfg?.photo
          ? isAbsoluteUrl(cfg.photo)
            ? cfg.photo
            : `/images/config/${cfg.photo}`
          : null;

        if (mounted) {
          setConfig({
            ...cfg,
            bg_top_color: bgTop,
            bg_bottom_color: bgBottom,
            photoUrl,
            text_top: cfg?.text_top ?? cfg?.textTop ?? "",
            text_bottom: cfg?.text_bottom ?? cfg?.textBottom ?? "",
            text_top_color:
              safeColor(cfg?.text_top_color, DEFAULT_HEADER_TEXT_COLOR) ||
              DEFAULT_HEADER_TEXT_COLOR,
            text_bottom_color:
              safeColor(cfg?.text_bottom_color, DEFAULT_HEADER_TEXT_COLOR) ||
              DEFAULT_HEADER_TEXT_COLOR,
          });
        }
      } catch (e) {
        if (mounted) {
          setConfig({
            text_top: "",
            bg_top_color: DEFAULT_BG,
            text_bottom:
              "Kính chào quý khách, chúc quý khách một ngày tốt lành!",
            bg_bottom_color: DEFAULT_BG,
            photoUrl: "",
            text_top_color: DEFAULT_HEADER_TEXT_COLOR,
            text_bottom_color: DEFAULT_HEADER_TEXT_COLOR,
          });
          toast.error("Không tải được cấu hình, dùng giá trị mặc định.", {
            autoClose: 1000,
          });
        }
      } finally {
        if (mounted) setLoadingConfig(false);
      }
    };
    loadConfig();
    return () => {
      mounted = false;
    };
  }, []);

  /** ------------ LOAD BUTTON LAYOUT TỪ config/buttons ------------- */
  useEffect(() => {
    const loadButtonLayout = async () => {
      try {
        const res = await ConfigService.getButton();
        const data = res?.data || res; // tuỳ backend
        parseLayoutFromServer(
          data,
          setGlobalDims,
          setPerServiceSettings,
          setUseFixedOnMobile
        );
      } catch (e) {
        console.error("Không tải được layout nút từ config/buttons:", e);
        // fallback: keep default layout
      }
    };
    loadButtonLayout();
  }, []);

  /** ------------ ĐĂNG KÝ SỐ THỨ TỰ ------------- */
  const debouncedRegister = useCallback(
    debounce(
      async (id) => {
        setRegistering((prev) => ({ ...prev, [id]: true }));
        try {
          const response = await TicketService.register(id);
          toast.success(response?.message || "Lấy số thành công.", {
            autoClose: 500,
          });
        } catch (err) {
          toast.error(
            err?.response?.data?.message || "Đăng ký số thứ tự thất bại.",
            { autoClose: 500 }
          );
        } finally {
          setRegistering((prev) => ({ ...prev, [id]: false }));
        }
      },
      700,
      { leading: true, trailing: false }
    ),
    []
  );

  useEffect(() => {
    return () => {
      debouncedRegister.cancel?.();
    };
  }, [debouncedRegister]);

  const handleRegister = (id) => debouncedRegister(id);

  /** ------------ LAYOUT HELPERS ------------- */
  const headerBg = config?.bg_top_color ?? DEFAULT_BG;
  const headerTextColor = config?.text_top_color ?? DEFAULT_HEADER_TEXT_COLOR;
  const footerBg = config?.bg_bottom_color ?? DEFAULT_BG;
  const footerTextColor =
    config?.text_bottom_color ?? DEFAULT_HEADER_TEXT_COLOR;
  const logoSrc = config?.photoUrl ?? "/images/agribank-logo.png";

  const isLoadingAll = loadingServices || loadingConfig;

  const getSettingsFor = (serviceId) => {
    const s = perServiceSettings?.[serviceId] || {};
    return {
      width: Number.isFinite(s.width) ? s.width : globalDims.width,
      height: Number.isFinite(s.height) ? s.height : globalDims.height,
      hAlign: s.hAlign || globalDims.hAlign || "center",
      vAlign: s.vAlign || globalDims.vAlign || "center",
      x: Number.isFinite(s.x) ? s.x : undefined,
      y: Number.isFinite(s.y) ? s.y : undefined,
    };
  };

  /** ------------ RENDER ------------- */
  return (
    <div className="flex flex-col h-screen bg-gray-50 justify-between overflow-hidden relative">
      <header
        className="w-full flex-none flex flex-col items-center mb-2 justify-center px-10 py-1"
        style={{ backgroundColor: headerBg }}
      >
        <img
          src={logoSrc}
          alt="Header Logo"
          className="h-20 w-96 mb-2 object-contain"
        />
        <div
          className="text-lg font-semibold text-center uppercase"
          style={{ color: headerTextColor }}
        >
          {loadingConfig ? "Đang tải cấu hình..." : config?.text_top ?? ""}
        </div>
      </header>

      <main
        className="flex-1 p-4 sm:px-6 md:px-8 overflow-auto"
        style={{ position: "relative" }}
      >
        {isLoadingAll ? (
          <div className="text-center text-gray-300">Đang tải...</div>
        ) : !services.length ? (
          <div className="text-center text-gray-300">
            Không tìm thấy dịch vụ.
          </div>
        ) : (
          <div
            className="w-full max-w-7xl mx-auto h-full relative"
            style={{
              minHeight: "60vh",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            ref={canvasRef}
          >
            {/* Các nút không có x,y -> render theo cột (auto layout) */}
            <div
              className="flex gap-6 w-full"
              style={{
                justifyContent: "center",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              {chunkArray(services, 5).map((col, colIndex) => (
                <div
                  key={`col-${colIndex}`}
                  className="flex flex-col gap-4"
                  style={{
                    width: isMobile ? "100%" : "auto",
                    minWidth: isMobile ? undefined : 220,
                    alignItems: "center",
                  }}
                >
                  {col.map((service) => {
                    const s = getSettingsFor(service.id);
                    const hasSavedPos =
                      Number.isFinite(s.x) && Number.isFinite(s.y);
                    // nếu có vị trí tuyệt đối thì không render ở đây, để overlay xử lý
                    if (hasSavedPos) return null;

                    const isRegistering = Boolean(registering[service.id]);
                    const applyFixed = !isMobile || useFixedOnMobile;
                    const buttonWidthStyle = applyFixed
                      ? `${s.width}px`
                      : "100%";

                    let alignItems = "center";
                    if (!applyFixed) {
                      alignItems = "stretch"; // full width
                    } else {
                      if (s.hAlign === "left") alignItems = "flex-start";
                      else if (s.hAlign === "right") alignItems = "flex-end";
                      else alignItems = "center";
                    }

                    const wrapperStyle = {
                      width: applyFixed ? "auto" : "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                    };

                    const buttonStyle = {
                      width: buttonWidthStyle,
                      maxWidth: "100%",
                      height: `${s.height}px`,
                      backgroundColor:
                        safeColor(service.color, null) || DEFAULT_BUTTON_BG,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      padding: "0 12px",
                      boxSizing: "border-box",
                      border: "none",
                    };

                    return (
                      <div
                        key={service.id}
                        className="w-full"
                        style={{
                          display: "flex",
                          justifyContent: alignItems,
                        }}
                      >
                        <div style={wrapperStyle}>
                          <button
                            disabled={isRegistering}
                            onClick={() => handleRegister(service.id)}
                            className={`
                              rounded text-white shadow transition uppercase font-semibold text-xl sm:text-2xl md:text-2xl
                              flex items-center justify-center whitespace-normal break-words leading-tight
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Overlay: các nút có x,y -> hiển thị đúng layout đã config */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 150 }}
            >
              {services.map((service) => {
                const s = getSettingsFor(service.id);
                const hasPos = Number.isFinite(s.x) && Number.isFinite(s.y);
                if (!hasPos) return null;

                const isRegistering = Boolean(registering[service.id]);
                const buttonStyle = {
                  width: `${s.width}px`,
                  maxWidth: "100%",
                  height: `${s.height}px`,
                  backgroundColor:
                    safeColor(service.color, null) || DEFAULT_BUTTON_BG,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "0 12px",
                  boxSizing: "border-box",
                  border: "none",
                };

                const wrapperStyle = {
                  position: "absolute",
                  left: s.x,
                  top: s.y,
                  pointerEvents: "auto", // cho click
                };

                return (
                  <div key={`pos-${service.id}`} style={wrapperStyle}>
                    <button
                      disabled={isRegistering}
                      onClick={() => handleRegister(service.id)}
                      className={`
                        rounded text-white shadow transition uppercase font-semibold text-xl sm:text-2xl md:text-2xl
                        flex items-center justify-center whitespace-normal break-words leading-tight
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
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

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
    </div>
  );
};

export default TicketDisplay;
