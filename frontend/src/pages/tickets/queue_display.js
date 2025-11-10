import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { echo } from "../../echo";
import ConfigService from "../../services/configService";

const MAX_ROWS = 7;
const DEFAULT_BG = "#B3AAAA";

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

export default function QueueDisplayWithTTS() {
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [ttsEnabled, setTtsEnabled] = useState(false);
  const voiceRef = useRef(null);
  const firstLoadRef = useRef(true);

  const prevTopIdRef = useRef(null);
  const prevTopUpdatedMsRef = useRef(0);

  // ---------- Load CONFIG once ----------
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

        const tableHeader = safeColor(cfg?.table_header_color, "#f3f4f6");
        const tableRowOdd = safeColor(cfg?.table_row_odd_color, "#ffffff");
        const tableRowEven = safeColor(cfg?.table_row_even_color, "#fff2f4");

        const tableText = safeColor(cfg?.table_text_color, "#000000");
        const tableTextActive = safeColor(
          cfg?.table_text_active_color,
          "#ff0000"
        );

        const textTopColor = safeColor(cfg?.text_top_color, "#b10730");
        const textBottomColor = safeColor(cfg?.text_bottom_color, "#b10730");

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
            bg_middle_color: bgMiddle,
            table_header_color: tableHeader,
            table_row_odd_color: tableRowOdd,
            table_row_even_color: tableRowEven,
            table_text_color: tableText,
            table_text_active_color: tableTextActive,
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
            table_header_color: "#f3f4f6",
            table_row_odd_color: "#413434ff",
            table_row_even_color: "#fff2f4",
            table_text_color: "#000000",
            table_text_active_color: "#ff0000",
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

  // ---------- Voice pick ----------
  useEffect(() => {
    const pickVoice = () => {
      if (!window.speechSynthesis) return;
      const voices = window.speechSynthesis.getVoices?.() || [];
      const vietnameseVoices = voices.filter(
        (v) =>
          v.lang?.toLowerCase().startsWith("vi-vn") && !v.name.includes("Linh") // Loại trừ bất kỳ giọng
      );

      voiceRef.current =
        vietnameseVoices.find((v) => v.name.includes("Google Tiếng Việt")) ||
        vietnameseVoices.find((v) => v.name.includes("Microsoft")) ||
        vietnameseVoices[0] ||
        null;

      console.log(
        "🎙️ Using voice:",
        voiceRef.current?.name,
        voiceRef.current?.lang
      );
    };
    pickVoice();
    if (window.speechSynthesis)
      window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = (text) => {
    if (!ttsEnabled || !window.speechSynthesis || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.lang = voiceRef.current?.lang || "vi-VN";
      u.rate = 0.3;
      u.pitch = 1;
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.error("TTS error:", e);
    }
  };

  // ---------- Echo channel for tickets ----------
  useEffect(() => {
    let firstEvent = true;

    const channel = echo
      .channel("queue.display")
      .listen(".ResponseNumberReceived", (e) => {
        const payload = e?.payload ?? {};
        const row = {
          id: `${payload.device_id ?? ""}-${payload.number ?? ""}`,
          ticket_number: payload.number ?? "",
          device: {
            id: payload.device_id ?? "",
            name: payload.device_name || "",
          },
          called_at: payload.called_at ?? null,
          recalled_at: payload.recalled_at ?? null,
          updated_at:
            payload.updated_at ??
            payload.recalled_at ??
            payload.called_at ??
            new Date().toISOString(),
        };

        const isRecall =
          Boolean(payload.is_recall) ||
          String(payload.action || "").toLowerCase() === "recall" ||
          Boolean(payload.recalled_at);

        setTickets((prev) => {
          const key = (x) =>
            `${x.ticket_number ?? ""}|${x.device?.id ?? x.device?.name ?? ""}`;
          const idx = prev.findIndex((t) => key(t) === key(row));

          if (idx >= 0) {
            if (isRecall) {
              const next = [...prev];
              next[idx] = { ...next[idx], ...row };
              return next;
            } else {
              const updated = { ...prev[idx], ...row };
              const without = prev.filter((_, i) => i !== idx);
              return [updated, ...without].slice(0, MAX_ROWS);
            }
          } else {
            if (isRecall) {
              const next = [...prev, row];
              return next.slice(0, MAX_ROWS);
            } else {
              const next = [row, ...prev];
              return next.slice(0, MAX_ROWS);
            }
          }
        });

        if (firstEvent) {
          setLoadingTickets(false);
          firstEvent = false;
        }
      });

    channel.error?.((err) => {
      console.error("Echo channel error:", err);
      toast.error("Mất kết nối. Đang thử kết nối lại…");
    });

    return () => {
      try {
        channel.stopListening(".ResponseNumberReceived");
        echo.leave("queue.display");
      } catch {}
    };
  }, []);

  useEffect(() => {
    if (!tickets || tickets.length === 0) return;

    const top = tickets[0];
    const topId = top?.id ?? top?.ticket_number ?? null;
    const updatedRaw =
      top?.updated_at ?? top?.recalled_at ?? top?.called_at ?? null;

    const topUpdatedMs =
      updatedRaw == null
        ? 0
        : (typeof updatedRaw === "number"
            ? updatedRaw
            : Date.parse(updatedRaw)) || 0;

    if (firstLoadRef.current) {
      prevTopIdRef.current = topId;
      prevTopUpdatedMsRef.current = topUpdatedMs;
      firstLoadRef.current = false;
      return;
    }

    const topChanged = topId !== prevTopIdRef.current;
    const updatedChanged = topUpdatedMs !== prevTopUpdatedMsRef.current;

    if (topChanged || updatedChanged) {
      prevTopIdRef.current = topId;
      prevTopUpdatedMsRef.current = topUpdatedMs;

      const ticketPartRaw = String(top?.ticket_number ?? "")
        .replace(/\s+/g, " ")
        .trim();
      const ticketPart = ticketPartRaw.split("").join("  ");

      let rawCounter = String(top?.device?.name ?? "")
        .replace(/\s+/g, " ")
        .trim();
      rawCounter = rawCounter.replace(/^qu(â|a)y\s*/i, "").trim();
      const parts = rawCounter.split(" ");
      const lastPart = parts[parts.length - 1];
      speak(`Mời số ${ticketPart} đến quầy số ${lastPart}.`);
    }
  }, [tickets, ttsEnabled]);

  const headerBg = config?.bg_top_color ?? config?.color_top ?? DEFAULT_BG;
  const headerTextColor = config?.text_top_color ?? "#b10730";
  const footerBg =
    config?.bg_bottom_color ?? config?.color_bottom ?? DEFAULT_BG;
  const footerTextColor = config?.text_bottom_color ?? headerTextColor;
  const logoSrc = config?.photoUrl ?? "/images/agribank-logo.png";
  const borderAccent = headerTextColor;
  const tableRowOdd = config?.table_row_odd_color ?? "#ffffff";
  const tableRowEven = config?.table_row_even_color ?? "#fff2f4";
  const tableHeaderBg = config?.table_header_color ?? "#f3f4f6";
  const tableTextColor = config?.table_text_color ?? "#000000";
  const tableTextActive = config?.table_text_active_color ?? "#ff0000";

  const isLoadingAll = loadingConfig || loadingTickets;

  return (
    <div className="flex flex-col h-screen bg-gray-50 justify-between overflow-hidden">
      <header
        className="w-full flex-none flex flex-col justify-center items-center py-2 relative"
        style={{ backgroundColor: headerBg }}
      >
        <button
          onClick={() => {
            if (!ttsEnabled) {
              try {
                window.speechSynthesis?.speak(new SpeechSynthesisUtterance(""));
              } catch {}
            }
            setTtsEnabled((v) => !v);
          }}
          className={`absolute top-2 right-2 px-3 py-1 rounded-xl text-sm font-semibold border shadow`}
          title={ttsEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
          aria-label={ttsEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
          style={{
            backgroundColor: ttsEnabled ? "#ecfdf5" : "#fff1f2",
            color: ttsEnabled ? "#166534" : "#7f1d1d",
            borderColor: ttsEnabled ? "#86efac" : "#fca5a5",
          }}
        >
          {ttsEnabled ? (
            // Speaker ON icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
              />
            </svg>
          ) : (
            // Speaker OFF icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
              />
            </svg>
          )}
        </button>

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
        {isLoadingAll ? (
          <div className="text-center text-gray-300">Chưa có dữ liệu</div>
        ) : !tickets.length ? (
          <div className="text-center text-gray-300">
            Không có dữ liệu quầy.
          </div>
        ) : (
          <div className="w-full max-w-3xl">
            <div
              className="overflow-x-auto bg-white rounded-lg shadow"
              style={{ border: `2px solid ${borderAccent}` }}
            >
              <table className="min-w-[520px] w-full table-auto border-collapse">
                <thead
                  className="text-black"
                  style={{ backgroundColor: tableHeaderBg }}
                >
                  <tr>
                    <th
                      className="px-4 py-3 text-2xl text-center"
                      style={{
                        border: `1px solid ${borderAccent}`,
                        color: tableTextColor,
                      }}
                    >
                      Số thứ tự
                    </th>
                    <th
                      className="px-4 py-3 text-2xl text-center"
                      style={{
                        border: `1px solid ${borderAccent}`,
                        color: tableTextColor,
                      }}
                    >
                      Quầy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((item, idx) => {
                    const isMostRecent = idx === 0;
                    const rowBg = idx % 2 === 0 ? tableRowOdd : tableRowEven;
                    return (
                      <tr
                        key={item.id ?? `${item.ticket_number}-${idx}`}
                        style={{ backgroundColor: rowBg }}
                      >
                        <td
                          className="px-4 py-3 text-2xl text-center"
                          style={{ border: `1px solid ${borderAccent}` }}
                        >
                          <span
                            style={{
                              color: isMostRecent
                                ? tableTextActive
                                : tableTextColor,
                              fontWeight: isMostRecent ? 800 : 500,
                            }}
                          >
                            {item.ticket_number}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-center text-2xl font-bold"
                          style={{
                            border: `1px solid ${borderAccent}`,
                            color: tableTextColor,
                          }}
                        >
                          {item.device?.name}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
}
