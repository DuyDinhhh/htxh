import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ConfigService from "../../services/configService";
import { getImageUrl } from "../../services/httpAxios";
import mqtt from "mqtt";

const MAX_ROWS = 7;
const DEFAULT_BG = "#B3AAAA";

// Validate hex color string
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

// Return normalized hex or fallback
const safeColor = (val, fallback) =>
  isValidHex(val) ? normalizeHex(val) : fallback;

export default function QueueDisplayWithTTS() {
  const ttsQueueRef = useRef([]);
  const isSpeakingRef = useRef(false);
  const audioRef = useRef(null);

  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [ttsEnabled, setTtsEnabled] = useState(true);
  const firstLoadRef = useRef(true);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const prevTopIdRef = useRef(null);
  const prevTopUpdatedMsRef = useRef(0);

  const audioCache = useRef({});

  useEffect(() => {
    // Preload TTS audio files into cache
    const preloadAudio = () => {
      const files = [
        "xinmoiso",
        "denquayso",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
      ];

      files.forEach((file) => {
        try {
          const audio = new Audio(`/audio/${file}.mp3`);
          audio.preload = "auto";
          audio.load();
          audioCache.current[file] = audio;
        } catch (error) {
          console.error(`Failed to preload audio: ${file}`, error);
        }
      });
    };

    preloadAudio();

    return () => {
      Object.values(audioCache.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
      audioCache.current = {};
    };
  }, []);

  // Play cached audio files sequentially for TTS
  const playAudioSequence = async (audioFiles) => {
    if (!ttsEnabled || audioFiles.length === 0) {
      return;
    }

    for (let i = 0; i < audioFiles.length; i++) {
      const fileName = audioFiles[i];
      const audio = audioCache.current[fileName];

      if (!audio) {
        console.error(`Audio file not found in cache: ${fileName}`);
        continue;
      }

      try {
        const audioClone = audio.cloneNode();
        audioRef.current = audioClone;

        await new Promise((resolve, reject) => {
          audioClone.onended = resolve;
          audioClone.onerror = (e) => {
            console.error(`Error playing ${fileName}:`, e);
            reject(e);
          };

          const playPromise = audioClone.play();
          if (playPromise !== undefined) {
            playPromise.catch(reject);
          }
        });

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error in audio sequence for ${fileName}:`, error);
      }
    }
  };

  // Enqueue ticket and counter for TTS playback
  const speakMulti = (ticketStr, counterStr) => {
    if (!ttsEnabled) return;
    ttsQueueRef.current.push({ ticketStr, counterStr });
    if (!isSpeakingRef.current) {
      processTTSQueue();
    }
  };

  // Dequeue and play queued TTS sequences one-by-one
  const processTTSQueue = async () => {
    if (isSpeakingRef.current) return;
    if (ttsQueueRef.current.length === 0) return;

    const { ticketStr, counterStr } = ttsQueueRef.current.shift();
    isSpeakingRef.current = true;

    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {}
    }

    const audioSequence = [];
    audioSequence.push("xinmoiso");
    const ticketDigits = ticketStr.replace(/\s+/g, "").split("");
    ticketDigits.forEach((char) => {
      if (/[0-9]/.test(char)) {
        audioSequence.push(char);
      }
    });

    audioSequence.push("denquayso");

    const counterDigits = counterStr.replace(/\s+/g, "").split("");
    counterDigits.forEach((char) => {
      if (/[0-9]/.test(char)) {
        audioSequence.push(char);
      }
    });

    await playAudioSequence(audioSequence);

    setTimeout(() => {
      isSpeakingRef.current = false;
      processTTSQueue();
    }, 1000);
  };

  // Load display config once (colors, table styles, photo)
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
          "#ff0000",
        );

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
        console.error("Error loading config:", e);
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

  // MQTT Config
  const mqttHost = "ws://10.10.1.21:8083/mqtt";
  const topic = "responsenumber";

  const mqttUsername = "appuser";
  const mqttPassword = "1111";

  useEffect(() => {
    const client = mqtt.connect(mqttHost, {
      username: mqttUsername,
      password: mqttPassword,
    });

    // MQTT: connect and subscribe to ticket topic
    client.on("connect", () => {
      console.log("Connected to MQTT broker!");
      setLoadingTickets(false);
      client.subscribe(topic, { qos: 1 }, (error) => {
        if (error) {
          console.error("Subscription error:", error);
        } else {
          console.log(`Subscribed to topic: ${topic}`);
        }
      });
    });

    // MQTT: incoming messages handler
    client.on("message", (receivedTopic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        // console.log(`Received message on topic "${receivedTopic}":`, payload);

        if (payload.number !== "NoAvailable") {
          const row = {
            id: `${payload.device_id}-${payload.number}`,
            ticket_number: payload.number ?? "",
            device: {
              id: payload.device_id ?? "",
              name: payload.device_name || "",
            },
            called_at: payload.called_at ?? null,
            recalled_at: payload.recalled_at ?? null,
            updated_at: payload.updated_at ?? new Date().toISOString(),
          };

          setTickets((prev) => {
            const newTickets = [row, ...prev.filter((t) => t.id !== row.id)];
            return newTickets.slice(0, MAX_ROWS);
          });
        } else {
          // console.log("Skipped NoAvailable message");
        }
      } catch (error) {
        console.error("Error processing MQTT message:", error);
      }
    });

    client.on("error", (error) => {
      console.error("MQTT error:", error);
      toast.error("Mất kết nối. Đang thử kết nối lại…");
    });

    return () => {
      if (client.connected) {
        client.unsubscribe(topic);
        client.end();
        console.log("Disconnected from MQTT broker.");
      }
    };
  }, []);

  // ---------- Watch for ticket changes and trigger TTS ----------
  useEffect(() => {
    if (!tickets || tickets.length === 0) return;
    if (!ttsEnabled) return;
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
      const ticketPartRaw = String(top?.ticket_number ?? "")
        .replace(/\s+/g, "")
        .trim();

      let rawCounter = String(top?.device?.name ?? "")
        .replace(/\s+/g, " ")
        .trim();
      rawCounter = rawCounter.replace(/^qu(â|a)y\s*/i, "").trim();
      const parts = rawCounter.split(" ");
      const lastPart = parts[parts.length - 1];

      // Trigger TTS for initial top ticket
      speakMulti(ticketPartRaw, lastPart);
      return;
    }

    const topChanged = topId !== prevTopIdRef.current;
    const updatedChanged = topUpdatedMs !== prevTopUpdatedMsRef.current;

    if (topChanged || updatedChanged) {
      prevTopIdRef.current = topId;
      prevTopUpdatedMsRef.current = topUpdatedMs;

      const ticketPartRaw = String(top?.ticket_number ?? "")
        .replace(/\s+/g, "")
        .trim();

      let rawCounter = String(top?.device?.name ?? "")
        .replace(/\s+/g, " ")
        .trim();
      rawCounter = rawCounter.replace(/^qu(â|a)y\s*/i, "").trim();
      const parts = rawCounter.split(" ");
      const lastPart = parts[parts.length - 1];

      // Trigger TTS for updated top ticket
      speakMulti(ticketPartRaw, lastPart);
    }
  }, [tickets, ttsEnabled]);

  // ---------- Style variables ----------
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
      <header className="bg-card border-b-4 border-red-700 border-primary ">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-lg shadow-md ">
              <img
                src="/images/agribank-logo2.png"
                alt="Logo"
                className="object-contain h-full w-full"
              />
            </div>
            <div
              className="text-md font-semibold uppercase"
              style={{ color: headerTextColor }}
            >
              <h1 className="text-3xl font-bold text-primary tracking-tight">
                AGRIBANK
              </h1>
              <div
                className="text-md font-semibold text-center uppercase"
                style={{ color: headerTextColor }}
              >
                {loadingConfig
                  ? "Đang tải cấu hình..."
                  : (config?.text_top ?? "")}
              </div>{" "}
            </div>
          </div>

          <div
            className="flex items-center gap-6"
            style={{ color: headerTextColor }}
          >
            <div className="text-right">
              <div className="text-4xl font-bold text-foreground tracking-tight">
                {currentTime.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
              <div className="text-sm text-muted-foreground font-medium mt-1">
                {currentTime.toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
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
              className="overflow-hidden bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl"
              style={{ borderColor: borderAccent }}
            >
              <table className="min-w-[520px] w-full table-auto border-collapse">
                <thead
                  className="text-black"
                  style={{ backgroundColor: "#af1b40" }}
                >
                  <tr>
                    <th
                      className="px-4 py-3 w-[400px] text-3xl text-center"
                      style={{
                        border: ` ${borderAccent}`,
                        color: "#fff",
                      }}
                    >
                      Số thứ tự
                    </th>
                    <th
                      className="px-4 py-3 w-[400px] text-3xl text-center"
                      style={{
                        border: `${borderAccent}`,
                        color: "#fff",
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
                          className="px-4 py-3 text-3xl text-center font-bold "
                          style={{
                            color: tableTextColor,
                          }}
                        >
                          <span
                            style={{
                              color: isMostRecent ? "#af1b40" : tableTextColor,
                              fontSize: isMostRecent && "45px",
                            }}
                            className={isMostRecent ? "flicker" : ""}
                          >
                            {item.ticket_number}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-center text-3xl font-bold ${} "
                          style={{
                            color: tableTextColor,
                            fontSize: isMostRecent && "30px",
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
        className="w-full flex-none flex flex-col justify-center items-center py-6 overflow-hidden"
        style={{ backgroundColor: "#af1b40" }}
      >
        <div
          className="text-2xl font-bold uppercase whitespace-nowrap"
          style={{
            display: "inline-block",
            animation: "marquee 10s linear infinite",
            color: "#FFFFFF",
          }}
        >
          {loadingConfig ? "Đang tải cấu hình..." : (config?.text_bottom ?? "")}
        </div>
      </footer>

      <style jsx>{`
        @keyframes flicker {
          0% {
            opacity: 1;
          }
          25% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.2;
          }
          75% {
            opacity: 0.6;
          }
          100% {
            opacity: 1;
          }
        }

        .flicker {
          animation: flicker 3s forwards;
        }

        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
