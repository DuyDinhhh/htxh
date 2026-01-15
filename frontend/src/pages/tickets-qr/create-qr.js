import React, { useEffect, useState, useCallback, useRef } from "react";
import ServiceService from "../../services/serviceService";
import TicketService from "../../services/ticketService";
import ConfigService from "../../services/configService";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import { getImageUrl } from "../../services/httpAxios";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/kiosk/header";
import Footer from "../../components/kiosk/footer";

const DEFAULT_BG = "#B3AAAA";
const DEFAULT_HEADER_TEXT_COLOR = "#b10730";
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

const TicketCreateQR = () => {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [registering, setRegistering] = useState({});
  // const [error, setError] = useState(null);
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  const [number, setNumber] = useState(() => {
    return sessionStorage.getItem("ticket_number") || null;
  });
  const [serviceName, setServiceName] = useState(false);

  const navigate = useNavigate();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  console.log(token);
  useEffect(() => {
    if (!token) {
      navigate("/error");
      return;
    }

    const validateUrl = async () => {
      try {
        const response = await TicketService.validateUrl(token);
        if (response.status === true) {
          setIsValid(true);
        } else {
          if (!number) {
            navigate("/notfound");
          } else {
            setIsValid(true);
          }
        }
      } catch (err) {
        navigate("/notfound");
      } finally {
        setIsValidating(false);
      }
    };
    validateUrl();
  }, [token, navigate, number]);

  useEffect(() => {
    if (!isValid || isValidating) return;

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
  }, [isValid, isValidating]);

  useEffect(() => {
    if (!isValid || isValidating) return;

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
  }, [isValid, isValidating]);

  // Use useRef to store the debounced function
  const debouncedRegisterRef = useRef(null);

  useEffect(() => {
    debouncedRegisterRef.current = debounce(
      async (id) => {
        setRegistering((prev) => ({ ...prev, [id]: true }));
        try {
          const response = await TicketService.register(id);
          if (response.status) {
            setNumber(response.ticket.ticket_number);
            setServiceName(response.service);
            sessionStorage.setItem(
              "ticket_number",
              response.ticket.ticket_number
            );
          }
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
    );

    return () => {
      debouncedRegisterRef.current?.cancel?.();
    };
  }, []);

  const handleRegister = useCallback((id) => {
    if (debouncedRegisterRef.current) {
      debouncedRegisterRef.current(id);
    }
  }, []);

  const headerBg = config?.bg_top_color ?? DEFAULT_BG;
  const headerTextColor = config?.text_top_color ?? DEFAULT_HEADER_TEXT_COLOR;
  const footerBg = config?.bg_bottom_color ?? DEFAULT_BG;
  const footerTextColor =
    config?.text_bottom_color ?? DEFAULT_HEADER_TEXT_COLOR;
  const logoSrc = config?.photoUrl ?? "/images/agribank-logo.png";

  const isLoadingAll = loadingServices || loadingConfig;

  // Don't render anything until validation is complete
  if (isValidating) {
    return null;
  }

  // If validation failed, navigation will happen, so don't render
  if (!isValid) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 justify-between overflow-hidden">
      <Header
        headerBg={headerBg}
        headerTextColor={headerTextColor}
        logoSrc={logoSrc}
        loadingConfig={loadingConfig}
        config={config}
      />
      <main className="flex-1 flex flex-col px-4 py-2 sm:px-6 md:px-8 overflow-hidden">
        {number ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="font-bold text-9xl">{number}</p>
            <p className="font-bold text-2xl">{serviceName}</p>
          </div>
        ) : isLoadingAll ? (
          <div className="text-center text-gray-300">Đang tải...</div>
        ) : !services.length ? (
          <div className="text-center text-gray-300">
            Không tìm thấy dịch vụ.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center w-full max-w-7xl mx-auto gap-y-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  disabled={registering[service.id]}
                  onClick={() => handleRegister(service.id)}
                  className={`
              w-full max-w-[420px]
              h-[85px]  // Fixed height for each button
              rounded-xl text-white shadow transition
              uppercase font-semibold
              text-xl sm:text-2xl md:text-2xl
              p-2 sm:p-3 md:p-4
              text-center
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
          </div>
        )}
      </main>

      <Footer
        footerBg={footerBg}
        footerTextColor={footerTextColor}
        loadingConfig={loadingConfig}
        config={config}
      />
    </div>
  );
};

export default TicketCreateQR;
