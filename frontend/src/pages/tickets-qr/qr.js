import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-toastify";
import ConfigService from "../../services/configService";
import { getImageUrl } from "../../services/httpAxios";
import TicketService from "../../services/ticketService";
import Header from "../../components/kiosk/header";
import Footer from "../../components/kiosk/footer";

const DEFAULT_BG = "#B3AAAA";
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

const QRCTicketGenerator = () => {
  const [url, setUrl] = useState("");
  const [countdown, setCountdown] = useState(30);

  const generateNewUrl = async () => {
    try {
      const response = await TicketService.generateNewUrl();
      setUrl(response.url);
      setCountdown(30);
    } catch (err) {
      console.log(err);
      setUrl([]);
      toast.error("Lỗi khi tạo mã QR", { autoClose: 500 });
    }
  };

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);
  useEffect(() => {
    generateNewUrl();

    const intervalId = setInterval(() => {
      generateNewUrl();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Config loading logic
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

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
        const bgMiddle = safeColor(cfg?.bg_middle_color, DEFAULT_BG);

        const textTopColor = safeColor(cfg?.text_top_color, "#b10730");
        const textBottomColor = safeColor(cfg?.text_bottom_color, "#b10730");

        if (cfg?.photo) {
          cfg.photo = getImageUrl(cfg.photo);
        }

        const photoUrl = cfg.photo;

        if (mounted) {
          setConfig({
            ...cfg,
            bg_top_color: bgTop,
            bg_bottom_color: bgBottom,
            bg_middle_color: bgMiddle,
            text_top_color: textTopColor,
            text_bottom_color: textBottomColor,
            photoUrl,
            text_top: cfg?.text_top ?? cfg?.textTop ?? "",
            text_bottom: cfg?.text_bottom ?? cfg?.textBottom ?? "",
          });
        }
      } catch (e) {
        if (mounted) {
          setConfig({
            text_top: "Ngân hàng Agribank - Chi nhánh Bắc Đồng Nai",
            bg_top_color: DEFAULT_BG,
            text_bottom:
              "Kính chào quý khách, chúc quý khách một ngày tốt lành!",
            bg_bottom_color: DEFAULT_BG,
            photoUrl: "/images/agribank-logo.png",
            bg_middle_color: DEFAULT_BG,
            text_top_color: "#b10730",
            text_bottom_color: "#b10730",
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

  const headerBg = config?.bg_top_color ?? config?.color_top ?? DEFAULT_BG;
  const headerTextColor = config?.text_top_color ?? "#b10730";
  const footerBg =
    config?.bg_bottom_color ?? config?.color_bottom ?? DEFAULT_BG;
  const footerTextColor = config?.text_bottom_color ?? headerTextColor;
  const logoSrc = config?.photoUrl ?? "/images/agribank-logo.png";

  return (
    <div className="flex flex-col h-screen bg-gray-50 justify-between overflow-hidden">
      <Header
        headerBg={headerBg}
        headerTextColor={headerTextColor}
        logoSrc={logoSrc}
        loadingConfig={loadingConfig}
        config={config}
      />

      <main className="flex-1 flex flex-col items-center justify-center px-8 w-full">
        <QRCodeCanvas
          value={url}
          size={300}
          fgColor="#000000"
          bgColor="#FFFFFF"
        />
        <p
          className="text-lg font-semibold text-center mt-2"
          style={{ color: headerTextColor }}
        >{`${countdown}s`}</p>
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

export default QRCTicketGenerator;
