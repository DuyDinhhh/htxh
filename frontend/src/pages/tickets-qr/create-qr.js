import React, { useEffect, useState, useCallback } from "react";
import ServiceService from "../../services/serviceService";
import TicketService from "../../services/ticketService";
import ConfigService from "../../services/configService";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import { getImageUrl } from "../../services/httpAxios";
import { useLocation, useNavigate } from "react-router-dom";
const DEFAULT_BG = "#B3AAAA";
const DEFAULT_HEADER_TEXT_COLOR = "#b10730";
const DEFAULT_BUTTON_BG = "#8B4513";

const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

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

const TicketCreateQR = () => {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [registering, setRegistering] = useState({});
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [number, setNumber] = useState(null);
  const navigate = useNavigate();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");

  useEffect(() => {
    if (!id) {
      setError("Invalid QR code, missing ID");
      navigate("/error");
      return;
    }

    const validateUrl = async () => {
      try {
        const response = await TicketService.validateUrl(id);
        if (response.status === true) {
          // console.log("QR code is valid.");
        } else {
          setError("QR code expired or invalid.");
          navigate("/notfound");
        }
      } catch (err) {
        setError("Failed to validate QR code");
        console.error("Error during validation:", err);
        navigate("/notfound");
      }
    };

    validateUrl();
  }, [id, navigate]);

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

  useEffect(() => {
    let mounted = true;
    const loadConfig = async () => {
      setLoadingConfig(true);
      try {
        const res = await ConfigService.index();
        const cfg = res?.config || res || null;
        if (!cfg) throw new Error("No config");

        const bgTop =
          safeColor(cfg?.bg_top_color, null) ||
          safeColor(cfg?.color_top, DEFAULT_BG) ||
          DEFAULT_BG;
        const bgBottom =
          safeColor(cfg?.bg_bottom_color, null) ||
          safeColor(cfg?.color_bottom, DEFAULT_BG) ||
          DEFAULT_BG;

        if (cfg?.photo) {
          cfg.photo = getImageUrl(cfg.photo);
        }

        const photoUrl = cfg.photo;

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

  const debouncedRegister = useCallback(
    debounce(
      async (id) => {
        setRegistering((prev) => ({ ...prev, [id]: true }));
        try {
          const response = await TicketService.register(id);
          // console.log(response);
          if (response.status) {
            setNumber(response.ticket.ticket_number);
          }
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
  const serviceColumns = chunkArray(services, 5);

  const headerBg = config?.bg_top_color ?? DEFAULT_BG;
  const headerTextColor = config?.text_top_color ?? DEFAULT_HEADER_TEXT_COLOR;
  const footerBg = config?.bg_bottom_color ?? DEFAULT_BG;
  const footerTextColor =
    config?.text_bottom_color ?? DEFAULT_HEADER_TEXT_COLOR;
  const logoSrc = config?.photoUrl ?? "/images/agribank-logo.png";

  const isLoadingAll = loadingServices || loadingConfig;

  return (
    <div className="flex flex-col h-screen bg-gray-50 justify-between overflow-hidden">
      <header
        className="w-full flex-none flex flex-col items-center mb-2 justify-center px-10  py-1"
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

      <main className="flex-1 flex items-center justify-center p-4 sm:px-6 md:px-8 overflow-y-auto md:overflow-hidden">
        {number ? (
          <div className="mt-4 w-full overflow-hidden text-center">
            {/* <p className="text-2xl">Số thứ tự của bạn là: </p> */}
            <p className="font-bold text-9xl">{number}</p>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setNumber(null)}
                className="bg-red-500 text-white py-1 px-5 rounded"
              >
                Lấy số mới
              </button>
            </div>
          </div>
        ) : isLoadingAll ? (
          <div className="text-center text-gray-300">Đang tải...</div>
        ) : !services.length ? (
          <div className="text-center text-gray-300">
            Không tìm thấy dịch vụ.
          </div>
        ) : (
          <div
            className={`
        grid w-full max-w-7xl mx-auto h-full
        justify-items-center
        grid-cols-1 grid-flow-row
        gap-y-2 gap-x-3

        md:grid-flow-col
        md:auto-cols-[420px]
        md:[grid-template-rows:repeat(5,1fr)]
        md:[grid-auto-rows:calc((100%_-_0.5rem*4)/5)]

        md:w-auto            
        md:justify-center     
        md:inline-grid       
      `}
          >
            {services.map((service) => (
              <button
                key={service.id}
                disabled={registering[service.id]}
                onClick={() => handleRegister(service.id)}
                className={`
            w-full md:w-[420px] max-w-[420px]
            h-full
            rounded text-white shadow transition
            uppercase font-semibold
            text-xl sm:text-2xl md:text-2xl
            p-2 sm:p-3 md:p-4
            flex items-center justify-center text-center
            whitespace-normal break-words leading-tight
            ${
              registering[service.id]
                ? "opacity-60 cursor-not-allowed"
                : "hover:brightness-90"
            }
          `}
                style={{
                  backgroundColor:
                    safeColor(service.color, null) || DEFAULT_BUTTON_BG,
                }}
              >
                <span
                  className="block"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {service.name}
                </span>
              </button>
            ))}
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

export default TicketCreateQR;
