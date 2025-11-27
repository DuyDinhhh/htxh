import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-toastify";
import ConfigService from "../../services/configService";
import { getImageUrl } from "../../services/httpAxios";

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
  const [url, setUrl] = useState("http://10.10.1.95:3000/ticket/create-qr");

  const generateNewUrl = () => {
    const randomSuffix = Math.random().toString(36).substring(7);
    setUrl(`http://10.10.1.95:3000/ticket/create-qr/?id=${randomSuffix}`);
  };

  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(generateNewUrl, 60000);

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
      clearInterval(intervalId);
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
      <header
        className="w-full flex-none flex flex-col justify-center items-center py-2 relative"
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

      <main className="flex-1 flex items-center justify-center px-8 w-full">
        <QRCodeCanvas
          value={url}
          size={300}
          fgColor="#000000"
          bgColor="#FFFFFF"
        />
      </main>

      <footer
        className="w-full flex-none flex flex-col justify-center items-center py-4 overflow-hidden"
        style={{ backgroundColor: footerBg }}
      >
        <div
          className="text-lg font-bold uppercase whitespace-nowrap"
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

export default QRCTicketGenerator;
