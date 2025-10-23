// import React, { useEffect, useRef, useState } from "react";
// import TicketService from "../../services/ticketService";
// import { toast } from "react-toastify";

// const REFRESH_MS = 1000;

// export default function QueueDisplayWithTTS() {
//   const [tickets, setTickets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const pollRef = useRef(null);

//   const fetchTickets = async (showLoading = false) => {
//     if (showLoading) setLoading(true);
//     try {
//       const response = await TicketService.queue_display();
//       const data = response.tickets;
//       setTickets(data || []);
//     } catch (err) {
//       console.error(err);
//       toast.error("Không thể tải dữ liệu quầy.");
//     } finally {
//       if (showLoading) setLoading(false);
//     }
//   };

//   // Run initial load with spinner
//   useEffect(() => {
//     fetchTickets(true);
//     pollRef.current = setInterval(fetchTickets, REFRESH_MS);
//     return () => clearInterval(pollRef.current);
//   }, []);

//   return (
//     <div className="flex flex-col h-screen bg-gray-50 justify-between overflow-hidden">
//       <header className="w-full bg-[#B3AAAA] flex-none flex flex-col justify-center items-center py-2">
//         <img
//           src="/images/agribank-logo.png"
//           alt="Header Logo"
//           className="h-20 w-96 object-contain"
//         />
//         <div className="text-lg text-[#b10730] font-semibold text-center uppercase">
//           Ngân hàng Agribank - Chi nhánh Bắc Đồng Nai
//         </div>
//       </header>

//       <main className="flex-1 flex items-center justify-center px-8 w-full">
//         {loading ? (
//           <div className="text-center text-gray-300">Đang tải dữ liệu...</div>
//         ) : !tickets.length ? (
//           <div className="text-center text-gray-300">
//             Không có dữ liệu quầy.
//           </div>
//         ) : (
//           <div className="w-full max-w-3xl">
//             <div className="overflow-x-auto bg-white rounded-lg shadow border-2 border-[#b10730]">
//               <table className="min-w-[520px] w-full table-auto border-collapse">
//                 <thead className="bg-[#B3AAAA] text-black">
//                   <tr>
//                     <th className="px-4 py-3 text-center border border-[#b10730]">
//                       Số thứ tự
//                     </th>
//                     <th className="px-4 py-3 text-center border border-[#b10730]">
//                       Quầy
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-gray-700">
//                   {tickets.map((item, idx) => {
//                     const isMostRecent = idx === 0; // highlight the newest called ticket
//                     return (
//                       <tr
//                         key={item.id ?? idx}
//                         className="odd:bg-white even:bg-[#FFF2F4]"
//                       >
//                         <td className="px-4 py-3 text-center border border-[#b10730]">
//                           <span
//                             className={`${
//                               isMostRecent
//                                 ? "text-[#b10730] font-bold"
//                                 : "text-gray-700"
//                             }`}
//                           >
//                             {item.ticket_number}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-center font-bold border border-[#b10730]">
//                           {item.device?.name}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </main>

//       <footer className="w-full bg-[#B3AAAA] flex-none flex flex-col justify-center items-center py-4 overflow-hidden">
//         <div
//           className="text-lg text-[#b10730] font-semibold uppercase whitespace-nowrap"
//           style={{
//             display: "inline-block",
//             animation: "marquee 10s linear infinite",
//           }}
//         >
//           Kính chào quý khách, chúc quý khách một ngày tốt lành!
//         </div>
//       </footer>
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { echo } from "../../echo"; // make sure this is configured

const MAX_ROWS = 7; // 👈 keep only the 7 latest rows

export default function QueueDisplayWithTTS() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- TTS state/refs ----
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const voiceRef = useRef(null);
  const firstLoadRef = useRef(true);

  const prevTopIdRef = useRef(null);
  const prevTopUpdatedMsRef = useRef(0);

  // --- Load voices (Web Speech API) ---
  useEffect(() => {
    const pickVoice = () => {
      if (!window.speechSynthesis) return;
      const voices = window.speechSynthesis.getVoices?.() || [];
      voiceRef.current =
        voices.find((v) => v.lang?.toLowerCase().startsWith("vi")) ||
        voices.find((v) => v.lang?.toLowerCase().startsWith("en")) ||
        null;
    };
    pickVoice();
    if (window.speechSynthesis)
      window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // --- Speak helper ---
  const speak = (text) => {
    if (!ttsEnabled || !window.speechSynthesis || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.lang = voiceRef.current?.lang || "vi-VN";
      u.rate = 0.7;
      u.pitch = 1;
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.error("TTS error:", e);
    }
  };

  // --- Echo subscription only (no API) ---
  useEffect(() => {
    let firstEvent = true;

    const channel = echo
      .channel("queue.display")
      .listen(".ResponseNumberReceived", (e) => {
        // Normalize payload
        const payload = e?.payload ?? {};
        const row = {
          id: `${payload.device_id ?? ""}-${payload.number ?? ""}`, // stable id (no Date.now to allow matching)
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
            // Already in list
            if (isRecall) {
              // Update in place (do NOT change order)
              const next = [...prev];
              next[idx] = { ...next[idx], ...row };
              return next;
            } else {
              // Normal new call for same number/device → move to top (optional)
              const updated = { ...prev[idx], ...row };
              const without = prev.filter((_, i) => i !== idx);
              return [updated, ...without].slice(0, MAX_ROWS);
            }
          } else {
            // Not in list
            if (isRecall) {
              const next = [...prev, row];
              return next.slice(0, MAX_ROWS);
            } else {
              // New call → prepend to top
              const next = [row, ...prev];
              return next.slice(0, MAX_ROWS);
            }
          }
        });

        if (firstEvent) {
          setLoading(false);
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

  // --- Announce when a NEW top ticket appears ---
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

      const ticketPart = String(top?.ticket_number ?? "")
        .replace(/\s+/g, " ")
        .trim();
      let rawCounter = String(top?.device?.name ?? "")
        .replace(/\s+/g, " ")
        .trim();
      rawCounter = rawCounter.replace(/^qu(â|a)y\s*/i, "").trim();

      speak(`Mời số ${ticketPart} đến ${rawCounter}.`);
    }
  }, [tickets]);

  // --- UI ---
  return (
    <div className="flex flex-col h-screen bg-gray-50 justify-between overflow-hidden">
      <header className="w-full bg-[#B3AAAA] flex-none flex flex-col justify-center items-center py-2 relative">
        {/* sound toggle — top-right */}
        <button
          onClick={() => {
            if (!ttsEnabled) {
              try {
                window.speechSynthesis?.speak(new SpeechSynthesisUtterance(""));
              } catch {}
            }
            setTtsEnabled((v) => !v);
          }}
          className={`absolute top-2 right-2 px-3 py-1 rounded-xl text-sm font-semibold border shadow
      ${
        ttsEnabled
          ? "bg-green-50 text-green-700 border-green-300"
          : "bg-red-50 text-red-700 border-red-300"
      }`}
          title={ttsEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
          aria-label={ttsEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
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
            // Speaker OFF (muted) icon
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
          src="/images/agribank-logo.png"
          alt="Header Logo"
          className="h-20 w-96 object-contain"
        />
        <div className="text-lg text-[#b10730] font-semibold text-center uppercase">
          Ngân hàng Agribank - Chi nhánh Bắc Đồng Nai
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-8 w-full">
        {loading ? (
          <div className="text-center text-gray-300">Chưa có dữ liệu</div>
        ) : !tickets.length ? (
          <div className="text-center text-gray-300">
            Không có dữ liệu quầy.
          </div>
        ) : (
          <div className="w-full max-w-3xl">
            <div className="overflow-x-auto bg-white rounded-lg shadow border-2 border-[#b10730]">
              <table className="min-w-[520px] w-full table-auto border-collapse">
                <thead className="bg-[#B3AAAA] text-black">
                  <tr>
                    <th className="px-4 py-3 text-center border border-[#b10730]">
                      Số thứ tự
                    </th>
                    <th className="px-4 py-3 text-center border border-[#b10730]">
                      Quầy
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {tickets.map((item, idx) => {
                    const isMostRecent = idx === 0;
                    return (
                      <tr
                        key={item.id ?? `${item.ticket_number}-${idx}`}
                        className="odd:bg-white even:bg-[#FFF2F4]"
                      >
                        <td className="px-4 py-3 text-center border border-[#b10730]">
                          <span
                            className={
                              isMostRecent
                                ? "text-[#b10730] font-bold"
                                : "text-gray-700"
                            }
                          >
                            {item.ticket_number}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold border border-[#b10730]">
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

      <footer className="w-full bg-[#B3AAAA] flex-none flex flex-col justify-center items-center py-4 overflow-hidden">
        <div
          className="text-lg text-[#b10730] font-semibold uppercase whitespace-nowrap"
          style={{
            display: "inline-block",
            animation: "marquee 10s linear infinite",
          }}
        >
          Kính chào quý khách, chúc quý khách một ngày tốt lành!
        </div>
      </footer>
    </div>
  );
}
