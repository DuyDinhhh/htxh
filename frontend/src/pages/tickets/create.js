// import React, { useEffect, useState, useCallback } from "react";
// import ServiceService from "../../services/serviceService";
// import TicketService from "../../services/ticketService";
// import ConfigService from "../../services/configService";
// import { toast } from "react-toastify";
// import { debounce } from "lodash";

// const DEFAULT_BG = "#B3AAAA";
// const DEFAULT_HEADER_TEXT_COLOR = "#b10730";
// const DEFAULT_BUTTON_BG = "#8B4513";

// const chunkArray = (array, size) => {
//   const result = [];
//   for (let i = 0; i < array.length; i += size) {
//     result.push(array.slice(i, i + size));
//   }
//   return result;
// };

// const isAbsoluteUrl = (url = "") => /^https?:\/\//i.test(url);
// const isValidHex = (val = "") =>
//   /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test((val || "").trim());
// const normalizeHex = (val = "") => {
//   const v = (val || "").trim();
//   if (/^#([0-9A-Fa-f]{6})$/.test(v)) return v.toLowerCase();
//   if (/^#([0-9A-Fa-f]{3})$/.test(v)) {
//     const short = v.slice(1).split("");
//     return ("#" + short.map((c) => c + c).join("")).toLowerCase();
//   }
//   return v;
// };
// const safeColor = (val, fallback) =>
//   isValidHex(val) ? normalizeHex(val) : fallback;

// const TicketCreate = () => {
//   const [services, setServices] = useState([]);
//   const [loadingServices, setLoadingServices] = useState(true);
//   const [registering, setRegistering] = useState({});

//   const [config, setConfig] = useState(null);
//   const [loadingConfig, setLoadingConfig] = useState(true);

//   useEffect(() => {
//     const fetchServices = async () => {
//       setLoadingServices(true);
//       try {
//         const response = await ServiceService.list();
//         console.log("Service: ", response);
//         const validServices = (response.services || []).filter(
//           (service) =>
//             Array.isArray(service.devices) &&
//             service.devices.length > 0 &&
//             !service.deleted_at
//         );
//         setServices(validServices || []);
//       } catch (err) {
//         setServices([]);
//         toast.error("Lỗi khi tải dịch vụ", { autoClose: 500 });
//       } finally {
//         setLoadingServices(false);
//       }
//     };
//     fetchServices();
//   }, []);

//   useEffect(() => {
//     let mounted = true;
//     const loadConfig = async () => {
//       setLoadingConfig(true);
//       try {
//         const res = await ConfigService.index();
//         const cfg = res?.config || res || null;
//         if (!cfg) throw new Error("No config");

//         const bgTop =
//           safeColor(cfg?.bg_top_color, null) ||
//           safeColor(cfg?.color_top, DEFAULT_BG) ||
//           DEFAULT_BG;
//         const bgBottom =
//           safeColor(cfg?.bg_bottom_color, null) ||
//           safeColor(cfg?.color_bottom, DEFAULT_BG) ||
//           DEFAULT_BG;
//         const photoUrl = cfg?.photo
//           ? isAbsoluteUrl(cfg.photo)
//             ? cfg.photo
//             : `/images/config/${cfg.photo}`
//           : null;

//         if (mounted) {
//           setConfig({
//             ...cfg,
//             bg_top_color: bgTop,
//             bg_bottom_color: bgBottom,
//             photoUrl,
//             text_top: cfg?.text_top ?? cfg?.textTop ?? "",
//             text_bottom: cfg?.text_bottom ?? cfg?.textBottom ?? "",
//             text_top_color:
//               safeColor(cfg?.text_top_color, DEFAULT_HEADER_TEXT_COLOR) ||
//               DEFAULT_HEADER_TEXT_COLOR,
//             text_bottom_color:
//               safeColor(cfg?.text_bottom_color, DEFAULT_HEADER_TEXT_COLOR) ||
//               DEFAULT_HEADER_TEXT_COLOR,
//           });
//         }
//       } catch (e) {
//         if (mounted) {
//           setConfig({
//             text_top: "",
//             bg_top_color: DEFAULT_BG,
//             text_bottom:
//               "Kính chào quý khách, chúc quý khách một ngày tốt lành!",
//             bg_bottom_color: DEFAULT_BG,
//             photoUrl: "",
//             text_top_color: DEFAULT_HEADER_TEXT_COLOR,
//             text_bottom_color: DEFAULT_HEADER_TEXT_COLOR,
//           });
//           toast.error("Không tải được cấu hình, dùng giá trị mặc định.", {
//             autoClose: 1000,
//           });
//         }
//       } finally {
//         if (mounted) setLoadingConfig(false);
//       }
//     };
//     loadConfig();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const debouncedRegister = useCallback(
//     debounce(
//       async (id) => {
//         setRegistering((prev) => ({ ...prev, [id]: true }));
//         try {
//           const response = await TicketService.register(id);
//           toast.success(response?.message || "Lấy số thành công.", {
//             autoClose: 500,
//           });
//         } catch (err) {
//           toast.error(
//             err?.response?.data?.message || "Đăng ký số thứ tự thất bại.",
//             { autoClose: 500 }
//           );
//         } finally {
//           setRegistering((prev) => ({ ...prev, [id]: false }));
//         }
//       },
//       700,
//       { leading: true, trailing: false }
//     ),
//     []
//   );

//   useEffect(() => {
//     return () => {
//       debouncedRegister.cancel?.();
//     };
//   }, [debouncedRegister]);

//   const handleRegister = (id) => debouncedRegister(id);
//   const serviceColumns = chunkArray(services, 5);

//   const headerBg = config?.bg_top_color ?? DEFAULT_BG;
//   const headerTextColor = config?.text_top_color ?? DEFAULT_HEADER_TEXT_COLOR;
//   const footerBg = config?.bg_bottom_color ?? DEFAULT_BG;
//   const footerTextColor =
//     config?.text_bottom_color ?? DEFAULT_HEADER_TEXT_COLOR;
//   const logoSrc = config?.photoUrl ?? "/images/agribank-logo.png";

//   const isLoadingAll = loadingServices || loadingConfig;

//   return (
//     <div className="flex flex-col h-screen bg-gray-50 justify-between overflow-hidden">
//       <header
//         className="w-full flex-none flex flex-col items-center mb-2 justify-center px-10  py-1"
//         style={{ backgroundColor: headerBg }}
//       >
//         <img
//           src={logoSrc}
//           alt="Header Logo"
//           className="h-20 w-96 mb-2 object-contain"
//         />
//         <div
//           className="text-lg font-semibold text-center uppercase"
//           style={{ color: headerTextColor }}
//         >
//           {loadingConfig ? "Đang tải cấu hình..." : config?.text_top ?? ""}
//         </div>
//       </header>

//       <main className="flex-1 flex items-center justify-center p-4 sm:px-6 md:px-8 overflow-y-auto md:overflow-hidden">
//         {isLoadingAll ? (
//           <div className="text-center text-gray-300">Đang tải...</div>
//         ) : !services.length ? (
//           <div className="text-center text-gray-300">
//             Không tìm thấy dịch vụ.
//           </div>
//         ) : (
//           <div
//             className={`
//               grid w-full max-w-7xl mx-auto h-full
//               justify-items-center
//               grid-cols-1 grid-flow-row
//               gap-y-2 gap-x-3

//               md:grid-flow-col
//               md:auto-cols-[420px]
//               md:[grid-template-rows:repeat(5,1fr)]
//               md:[grid-auto-rows:calc((100%_-_0.5rem*4)/5)]

//               md:w-auto
//               md:justify-center
//               md:inline-grid
//             `}
//           >
//             {services.map((service) => (
//               <button
//                 key={service.id}
//                 disabled={registering[service.id]}
//                 onClick={() => handleRegister(service.id)}
//                 className={`
//             w-full md:w-[420px] max-w-[420px]
//             h-full
//             rounded text-white shadow transition
//             uppercase font-semibold
//             text-xl sm:text-2xl md:text-2xl
//             p-2 sm:p-3 md:p-4
//             flex items-center justify-center text-center
//             whitespace-normal break-words leading-tight
//             ${
//               registering[service.id]
//                 ? "opacity-60 cursor-not-allowed"
//                 : "hover:brightness-90"
//             }
//           `}
//                 style={{
//                   backgroundColor:
//                     safeColor(service.color, null) || DEFAULT_BUTTON_BG,
//                 }}
//               >
//                 <span
//                   className="block"
//                   style={{
//                     display: "-webkit-box",
//                     WebkitLineClamp: 2,
//                     WebkitBoxOrient: "vertical",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                   }}
//                 >
//                   {service.name}
//                 </span>
//               </button>
//             ))}
//           </div>
//         )}
//       </main>

//       <footer
//         className="w-full mt-2 flex-none flex flex-col justify-center items-center py-4"
//         style={{ backgroundColor: footerBg }}
//       >
//         <div
//           className="text-lg font-bold text-center uppercase"
//           style={{
//             display: "inline-block",
//             animation: "marquee 10s linear infinite",
//             color: footerTextColor,
//           }}
//         >
//           {loadingConfig ? "Đang tải cấu hình..." : config?.text_bottom ?? ""}
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default TicketCreate;
// import React, { useEffect, useState, useCallback, useRef } from "react";
// import ServiceService from "../../services/serviceService";
// import TicketService from "../../services/ticketService";
// import ConfigService from "../../services/configService";
// import { toast } from "react-toastify";
// import { debounce } from "lodash";

// const DEFAULT_BG = "#B3AAAA";
// const DEFAULT_HEADER_TEXT_COLOR = "#b10730";
// const DEFAULT_BUTTON_BG = "#8B4513";

// const DEFAULT_BUTTON_WIDTH = 420; // px for md+ screens
// const DEFAULT_BUTTON_HEIGHT = 90; // px

// const MIN_BUTTON_WIDTH = 80;
// const MAX_BUTTON_WIDTH = 1200;
// const MIN_BUTTON_HEIGHT = 30;
// const MAX_BUTTON_HEIGHT = 800;

// const storageKeyGlobal = "ticket_button_dims_v2";
// const storageKeyPerService = "ticket_button_settings_v2";
// const storageKeyUseFixed = "ticket_button_use_fixed_v2";

// const SNAP_THRESHOLD = 16; // px threshold to snap to edges/center/others

// const chunkArray = (array, size) => {
//   const result = [];
//   for (let i = 0; i < array.length; i += size) {
//     result.push(array.slice(i, i + size));
//   }
//   return result;
// };

// const isAbsoluteUrl = (url = "") => /^https?:\/\//i.test(url);
// const isValidHex = (val = "") =>
//   /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test((val || "").trim());
// const normalizeHex = (val = "") => {
//   const v = (val || "").trim();
//   if (/^#([0-9A-Fa-f]{6})$/.test(v)) return v.toLowerCase();
//   if (/^#([0-9A-Fa-f]{3})$/.test(v)) {
//     const short = v.slice(1).split("");
//     return ("#" + short.map((c) => c + c).join("")).toLowerCase();
//   }
//   return v;
// };
// const safeColor = (val, fallback) =>
//   isValidHex(val) ? normalizeHex(val) : fallback;

// /**
//  * TicketCreate
//  *
//  * Improvements in this version:
//  * - Pointer drag + snapping (auto-center / auto-left / auto-right / snap-to-other-buttons)
//  *   while dragging a button, it will snap to:
//  *     - left margin
//  *     - center horizontally in the canvas
//  *     - right margin
//  *     - x positions of other absolutely positioned buttons (if any)
//  *   vertical snapping is also applied for top/center/bottom of canvas.
//  * - When a snap triggers, the perServiceSettings.hAlign/vAlign are updated to reflect
//  *   the alignment (left/center/right and top/center/bottom) to give a better UX and
//  *   preserve semantic alignment in the settings.
//  *
//  * Fix included:
//  * - When changing hAlign/vAlign for a service that already has absolute x/y saved,
//  *   recompute x/y (left/top) using the canvas size and button size so the button visibly moves.
//  */

// const TicketCreate = () => {
//   const [services, setServices] = useState([]);
//   const [loadingServices, setLoadingServices] = useState(true);
//   const [registering, setRegistering] = useState({});

//   const [config, setConfig] = useState(null);
//   const [loadingConfig, setLoadingConfig] = useState(true);

//   // global dims (fallback)
//   const [globalDims, setGlobalDims] = useState(() => {
//     try {
//       const raw = localStorage.getItem(storageKeyGlobal);
//       if (!raw)
//         return {
//           width: DEFAULT_BUTTON_WIDTH,
//           height: DEFAULT_BUTTON_HEIGHT,
//           hAlign: "center",
//           vAlign: "center",
//         };
//       const parsed = JSON.parse(raw);
//       return {
//         width: Number.isFinite(parsed.width)
//           ? parsed.width
//           : DEFAULT_BUTTON_WIDTH,
//         height: Number.isFinite(parsed.height)
//           ? parsed.height
//           : DEFAULT_BUTTON_HEIGHT,
//         hAlign: parsed.hAlign || "center",
//         vAlign: parsed.vAlign || "center",
//       };
//     } catch {
//       return {
//         width: DEFAULT_BUTTON_WIDTH,
//         height: DEFAULT_BUTTON_HEIGHT,
//         hAlign: "center",
//         vAlign: "center",
//       };
//     }
//   });

//   // per-service settings: { [serviceId]: { width, height, hAlign, vAlign, x, y } }
//   const [perServiceSettings, setPerServiceSettings] = useState(() => {
//     try {
//       const raw = localStorage.getItem(storageKeyPerService);
//       if (!raw) return {};
//       return JSON.parse(raw) || {};
//     } catch {
//       return {};
//     }
//   });

//   const [useFixedOnMobile, setUseFixedOnMobile] = useState(() => {
//     return localStorage.getItem(storageKeyUseFixed) === "1";
//   });

//   const [selectedServiceId, setSelectedServiceId] = useState(null);

//   const [isMobile, setIsMobile] = useState(
//     typeof window !== "undefined" ? window.innerWidth < 768 : false
//   );

//   const resizeListenerRef = useRef(null);
//   const canvasRef = useRef(null);

//   // drag state stored in ref to avoid re-renders
//   const dragRef = useRef({
//     active: false,
//     serviceId: null,
//     startX: 0,
//     startY: 0,
//     origX: 0,
//     origY: 0,
//   });

//   // transient state used to re-render while dragging
//   const [, setDragTick] = useState(0);

//   useEffect(() => {
//     const onResize = debounce(() => {
//       setIsMobile(window.innerWidth < 768);
//     }, 120);
//     window.addEventListener("resize", onResize);
//     resizeListenerRef.current = onResize;
//     return () => {
//       if (resizeListenerRef.current) {
//         window.removeEventListener("resize", resizeListenerRef.current);
//         resizeListenerRef.current.cancel?.();
//       }
//     };
//   }, []);

//   // persist settings
//   useEffect(() => {
//     try {
//       localStorage.setItem(storageKeyGlobal, JSON.stringify(globalDims));
//     } catch {}
//   }, [globalDims]);

//   useEffect(() => {
//     try {
//       localStorage.setItem(
//         storageKeyPerService,
//         JSON.stringify(perServiceSettings)
//       );
//     } catch {}
//   }, [perServiceSettings]);

//   useEffect(() => {
//     try {
//       localStorage.setItem(storageKeyUseFixed, useFixedOnMobile ? "1" : "0");
//     } catch {}
//   }, [useFixedOnMobile]);

//   useEffect(() => {
//     const fetchServices = async () => {
//       setLoadingServices(true);
//       try {
//         const response = await ServiceService.list();
//         const validServices = (response.services || []).filter(
//           (service) =>
//             Array.isArray(service.devices) &&
//             service.devices.length > 0 &&
//             !service.deleted_at
//         );
//         setServices(validServices || []);
//       } catch (err) {
//         setServices([]);
//         toast.error("Lỗi khi tải dịch vụ", { autoClose: 500 });
//       } finally {
//         setLoadingServices(false);
//       }
//     };
//     fetchServices();
//   }, []);

//   useEffect(() => {
//     let mounted = true;
//     const loadConfig = async () => {
//       setLoadingConfig(true);
//       try {
//         const res = await ConfigService.index();
//         const cfg = res?.config || res || null;
//         if (!cfg) throw new Error("No config");

//         const bgTop =
//           safeColor(cfg?.bg_top_color, null) ||
//           safeColor(cfg?.color_top, DEFAULT_BG) ||
//           DEFAULT_BG;
//         const bgBottom =
//           safeColor(cfg?.bg_bottom_color, null) ||
//           safeColor(cfg?.color_bottom, DEFAULT_BG) ||
//           DEFAULT_BG;
//         const photoUrl = cfg?.photo
//           ? isAbsoluteUrl(cfg.photo)
//             ? cfg.photo
//             : `/images/config/${cfg.photo}`
//           : null;

//         if (mounted) {
//           setConfig({
//             ...cfg,
//             bg_top_color: bgTop,
//             bg_bottom_color: bgBottom,
//             photoUrl,
//             text_top: cfg?.text_top ?? cfg?.textTop ?? "",
//             text_bottom: cfg?.text_bottom ?? cfg?.textBottom ?? "",
//             text_top_color:
//               safeColor(cfg?.text_top_color, DEFAULT_HEADER_TEXT_COLOR) ||
//               DEFAULT_HEADER_TEXT_COLOR,
//             text_bottom_color:
//               safeColor(cfg?.text_bottom_color, DEFAULT_HEADER_TEXT_COLOR) ||
//               DEFAULT_HEADER_TEXT_COLOR,
//           });
//         }
//       } catch (e) {
//         if (mounted) {
//           setConfig({
//             text_top: "",
//             bg_top_color: DEFAULT_BG,
//             text_bottom:
//               "Kính chào quý khách, chúc quý khách một ngày tốt lành!",
//             bg_bottom_color: DEFAULT_BG,
//             photoUrl: "",
//             text_top_color: DEFAULT_HEADER_TEXT_COLOR,
//             text_bottom_color: DEFAULT_HEADER_TEXT_COLOR,
//           });
//           toast.error("Không tải được cấu hình, dùng giá trị mặc định.", {
//             autoClose: 1000,
//           });
//         }
//       } finally {
//         if (mounted) setLoadingConfig(false);
//       }
//     };
//     loadConfig();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const debouncedRegister = useCallback(
//     debounce(
//       async (id) => {
//         setRegistering((prev) => ({ ...prev, [id]: true }));
//         try {
//           const response = await TicketService.register(id);
//           toast.success(response?.message || "Lấy số thành công.", {
//             autoClose: 500,
//           });
//         } catch (err) {
//           toast.error(
//             err?.response?.data?.message || "Đăng ký số thứ tự thất bại.",
//             { autoClose: 500 }
//           );
//         } finally {
//           setRegistering((prev) => ({ ...prev, [id]: false }));
//         }
//       },
//       700,
//       { leading: true, trailing: false }
//     ),
//     []
//   );

//   useEffect(() => {
//     return () => {
//       debouncedRegister.cancel?.();
//     };
//   }, [debouncedRegister]);

//   const handleRegister = (id) => debouncedRegister(id);

//   const headerBg = config?.bg_top_color ?? DEFAULT_BG;
//   const headerTextColor = config?.text_top_color ?? DEFAULT_HEADER_TEXT_COLOR;
//   const footerBg = config?.bg_bottom_color ?? DEFAULT_BG;
//   const footerTextColor =
//     config?.text_bottom_color ?? DEFAULT_HEADER_TEXT_COLOR;
//   const logoSrc = config?.photoUrl ?? "/images/agribank-logo.png";

//   const isLoadingAll = loadingServices || loadingConfig;

//   // helper: get effective settings for a given service
//   const getSettingsFor = (serviceId) => {
//     const s = perServiceSettings?.[serviceId] || {};
//     return {
//       width: Number.isFinite(s.width) ? s.width : globalDims.width,
//       height: Number.isFinite(s.height) ? s.height : globalDims.height,
//       hAlign: s.hAlign || globalDims.hAlign || "center", // left | center | right
//       vAlign: s.vAlign || globalDims.vAlign || "center", // top | center | bottom
//       x: Number.isFinite(s.x) ? s.x : undefined,
//       y: Number.isFinite(s.y) ? s.y : undefined,
//     };
//   };

//   // compute aligned absolute x/y for a service inside the canvas
//   const computeAlignedPosition = (serviceId, hAlign, vAlign) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return null;
//     const rect = canvas.getBoundingClientRect();
//     const s = perServiceSettings?.[serviceId] || {};
//     const width = Number.isFinite(s.width) ? s.width : globalDims.width;
//     const height = Number.isFinite(s.height) ? s.height : globalDims.height;

//     const leftEdge = 8;
//     const rightEdge = Math.max(8, rect.width - width - 8);
//     const centerX = Math.round((rect.width - width) / 2);

//     const topY = 8;
//     const bottomY = Math.max(8, rect.height - height - 8);
//     const centerY = Math.round((rect.height - height) / 2);

//     let x = undefined;
//     if (hAlign === "left") x = leftEdge;
//     else if (hAlign === "center") x = centerX;
//     else if (hAlign === "right") x = rightEdge;
//     // for "custom" we keep existing x (do not override) - caller can handle

//     let y = undefined;
//     if (vAlign === "top") y = topY;
//     else if (vAlign === "center") y = centerY;
//     else if (vAlign === "bottom") y = bottomY;

//     // ensure in bounds
//     if (typeof x === "number") {
//       x = Math.max(0, Math.min(x, Math.max(0, rect.width - width)));
//     }
//     if (typeof y === "number") {
//       y = Math.max(0, Math.min(y, Math.max(0, rect.height - height)));
//     }
//     return { x, y };
//   };

//   // change selected (or global if none selected)
//   const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

//   const changeSelectedWidth = (delta) => {
//     if (!selectedServiceId) {
//       setGlobalDims((prev) => ({
//         ...prev,
//         width: clamp(prev.width + delta, MIN_BUTTON_WIDTH, MAX_BUTTON_WIDTH),
//       }));
//       return;
//     }
//     setPerServiceSettings((prev) => {
//       const cur = prev[selectedServiceId] || {};
//       const newW = clamp(
//         (Number.isFinite(cur.width) ? cur.width : globalDims.width) + delta,
//         MIN_BUTTON_WIDTH,
//         MAX_BUTTON_WIDTH
//       );
//       return { ...prev, [selectedServiceId]: { ...cur, width: newW } };
//     });
//   };

//   const changeSelectedHeight = (delta) => {
//     if (!selectedServiceId) {
//       setGlobalDims((prev) => ({
//         ...prev,
//         height: clamp(
//           prev.height + delta,
//           MIN_BUTTON_HEIGHT,
//           MAX_BUTTON_HEIGHT
//         ),
//       }));
//       return;
//     }
//     setPerServiceSettings((prev) => {
//       const cur = prev[selectedServiceId] || {};
//       const newH = clamp(
//         (Number.isFinite(cur.height) ? cur.height : globalDims.height) + delta,
//         MIN_BUTTON_HEIGHT,
//         MAX_BUTTON_HEIGHT
//       );
//       return { ...prev, [selectedServiceId]: { ...cur, height: newH } };
//     });
//   };

//   const setSelectedHAlign = (align) => {
//     if (!selectedServiceId) {
//       setGlobalDims((prev) => ({ ...prev, hAlign: align }));
//       // also optionally set per-service to inherit? we'll leave per-service unmodified so they keep overrides.
//       return;
//     }

//     setPerServiceSettings((prev) => {
//       const cur = prev[selectedServiceId] || {};
//       const next = { ...prev, [selectedServiceId]: { ...cur, hAlign: align } };

//       // if this service already has absolute x (positioned), recompute x based on the chosen semantic alignment
//       if (Number.isFinite(cur.x) && canvasRef.current) {
//         const pos = computeAlignedPosition(
//           selectedServiceId,
//           align,
//           cur.vAlign || globalDims.vAlign
//         );
//         if (pos && typeof pos.x === "number") {
//           next[selectedServiceId].x = Math.round(pos.x);
//         }
//       }
//       return next;
//     });
//   };

//   const setSelectedVAlign = (align) => {
//     if (!selectedServiceId) {
//       setGlobalDims((prev) => ({ ...prev, vAlign: align }));
//       return;
//     }
//     setPerServiceSettings((prev) => {
//       const cur = prev[selectedServiceId] || {};
//       const next = { ...prev, [selectedServiceId]: { ...cur, vAlign: align } };

//       // if already positioned, recompute y to reflect the chosen vertical alignment
//       if (Number.isFinite(cur.y) && canvasRef.current) {
//         const pos = computeAlignedPosition(
//           selectedServiceId,
//           cur.hAlign || globalDims.hAlign,
//           align
//         );
//         if (pos && typeof pos.y === "number") {
//           next[selectedServiceId].y = Math.round(pos.y);
//         }
//       }
//       return next;
//     });
//   };

//   const resetSelected = () => {
//     setSelectedServiceId(null);
//   };

//   const applySelectedToAll = () => {
//     if (!selectedServiceId) return;
//     const sel = getSettingsFor(selectedServiceId);
//     const next = {};
//     services.forEach((s) => {
//       next[s.id] = {
//         width: sel.width,
//         height: sel.height,
//         hAlign: sel.hAlign,
//         vAlign: sel.vAlign,
//         // keep position only if it's the selected one
//         x: sel.x,
//         y: sel.y,
//       };
//     });
//     setPerServiceSettings(next);
//     toast.success("Áp dụng cấu hình cho tất cả dịch vụ.", { autoClose: 800 });
//   };

//   const resetAllToDefaults = () => {
//     setPerServiceSettings({});
//     setGlobalDims({
//       width: DEFAULT_BUTTON_WIDTH,
//       height: DEFAULT_BUTTON_HEIGHT,
//       hAlign: "center",
//       vAlign: "center",
//     });
//     setUseFixedOnMobile(false);
//     setSelectedServiceId(null);
//     toast.info("Đã khôi phục về mặc định.", { autoClose: 800 });
//   };

//   // DRAG + SNAPPING
//   const startDrag = (e, serviceId, buttonEl) => {
//     // only primary button
//     if (e.button && e.button !== 0) return;
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const canvasRect = canvas.getBoundingClientRect();
//     const elRect = buttonEl.getBoundingClientRect();

//     const origX = elRect.left - canvasRect.left;
//     const origY = elRect.top - canvasRect.top;

//     dragRef.current = {
//       active: true,
//       serviceId,
//       startX: e.clientX,
//       startY: e.clientY,
//       origX,
//       origY,
//     };

//     // ensure perServiceSettings has x/y initially so overlay rendering will show it
//     setPerServiceSettings((prev) => {
//       const cur = prev[serviceId] || {};
//       if (Number.isFinite(cur.x) && Number.isFinite(cur.y)) {
//         return prev;
//       }
//       return {
//         ...prev,
//         [serviceId]: { ...cur, x: Math.round(origX), y: Math.round(origY) },
//       };
//     });

//     // attach listeners to document for pointer move/up
//     const onPointerMove = (ev) => {
//       if (!dragRef.current.active) return;
//       const { startX, startY, origX, origY, serviceId: id } = dragRef.current;
//       const rect = canvas.getBoundingClientRect();
//       const dx = ev.clientX - startX;
//       const dy = ev.clientY - startY;
//       let nx = origX + dx;
//       let ny = origY + dy;

//       // clamp within canvas area
//       nx = clamp(nx, 0, Math.max(0, rect.width - 20));
//       ny = clamp(ny, 0, Math.max(0, rect.height - 20));

//       // SNAP: compute candidate snap positions (left, center, right) for x
//       const s = getSettingsFor(id);
//       const buttonW = s.width;
//       const leftEdge = 8;
//       const rightEdge = Math.max(8, rect.width - buttonW - 8);
//       const centerX = Math.round((rect.width - buttonW) / 2);

//       // gather other positioned buttons x positions to snap to
//       const otherXs = [];
//       Object.entries(perServiceSettings).forEach(([k, v]) => {
//         if (k === id) return;
//         if (Number.isFinite(v.x)) {
//           otherXs.push(Math.round(v.x));
//         }
//       });

//       let snappedX = nx;
//       let chosenHAlign = null;

//       // helper to check and possibly snap
//       const trySnapX = (candidateX, alignName) => {
//         if (Math.abs(nx - candidateX) <= SNAP_THRESHOLD) {
//           snappedX = candidateX;
//           chosenHAlign = alignName;
//         }
//       };

//       trySnapX(leftEdge, "left");
//       trySnapX(centerX, "center");
//       trySnapX(rightEdge, "right");
//       // try snapping to other buttons' x
//       for (const ox of otherXs) {
//         if (Math.abs(nx - ox) <= SNAP_THRESHOLD) {
//           snappedX = ox;
//           chosenHAlign = "custom"; // aligned to other button (keep custom)
//           break;
//         }
//       }

//       // V-SNAPPING: top/center/bottom
//       const topY = 8;
//       const bottomY = Math.max(8, rect.height - s.height - 8);
//       const centerY = Math.round((rect.height - s.height) / 2);

//       let snappedY = ny;
//       let chosenVAlign = null;
//       if (Math.abs(ny - topY) <= SNAP_THRESHOLD) {
//         snappedY = topY;
//         chosenVAlign = "top";
//       } else if (Math.abs(ny - centerY) <= SNAP_THRESHOLD) {
//         snappedY = centerY;
//         chosenVAlign = "center";
//       } else if (Math.abs(ny - bottomY) <= SNAP_THRESHOLD) {
//         snappedY = bottomY;
//         chosenVAlign = "bottom";
//       }

//       // apply snapped positions to state (live)
//       setPerServiceSettings((prev) => {
//         const cur = prev[id] || {};
//         const next = {
//           ...prev,
//           [id]: {
//             ...cur,
//             x: Math.round(snappedX),
//             y: Math.round(snappedY),
//           },
//         };
//         // if a semantic align was selected, store it too (helps UX later)
//         if (chosenHAlign) next[id].hAlign = chosenHAlign;
//         if (chosenVAlign) next[id].vAlign = chosenVAlign;
//         return next;
//       });

//       setDragTick((t) => t + 1);
//       ev.preventDefault();
//     };

//     const onPointerUp = (ev) => {
//       if (!dragRef.current.active) return;
//       // finalize position already applied into perServiceSettings in move handler
//       // but also convert 'custom' hAlign to 'left/center/right' if it's close to those canonical spots
//       const id = dragRef.current.serviceId;
//       const rect = canvas.getBoundingClientRect();

//       setPerServiceSettings((prev) => {
//         const cur = prev[id] || {};
//         if (!Number.isFinite(cur.x) || !Number.isFinite(cur.y)) return prev;
//         const x = cur.x;
//         const y = cur.y;
//         const buttonW = Number.isFinite(cur.width)
//           ? cur.width
//           : getSettingsFor(id).width;

//         const leftEdge = 8;
//         const rightEdge = Math.max(8, rect.width - buttonW - 8);
//         const centerX = Math.round((rect.width - buttonW) / 2);

//         const topY = 8;
//         const bottomY = Math.max(
//           8,
//           rect.height -
//             (Number.isFinite(cur.height)
//               ? cur.height
//               : getSettingsFor(id).height) -
//             8
//         );
//         const centerY = Math.round(
//           (rect.height -
//             (Number.isFinite(cur.height)
//               ? cur.height
//               : getSettingsFor(id).height)) /
//             2
//         );

//         let finalHAlign = cur.hAlign || getSettingsFor(id).hAlign;
//         if (Math.abs(x - leftEdge) <= SNAP_THRESHOLD) finalHAlign = "left";
//         else if (Math.abs(x - centerX) <= SNAP_THRESHOLD)
//           finalHAlign = "center";
//         else if (Math.abs(x - rightEdge) <= SNAP_THRESHOLD)
//           finalHAlign = "right";
//         else if (finalHAlign === "custom") {
//           // keep custom but no semantic change
//         }

//         let finalVAlign = cur.vAlign || getSettingsFor(id).vAlign;
//         if (Math.abs(y - topY) <= SNAP_THRESHOLD) finalVAlign = "top";
//         else if (Math.abs(y - centerY) <= SNAP_THRESHOLD)
//           finalVAlign = "center";
//         else if (Math.abs(y - bottomY) <= SNAP_THRESHOLD)
//           finalVAlign = "bottom";

//         return {
//           ...prev,
//           [id]: {
//             ...cur,
//             x: Math.round(x),
//             y: Math.round(y),
//             hAlign: finalHAlign,
//             vAlign: finalVAlign,
//           },
//         };
//       });

//       dragRef.current = {
//         active: false,
//         serviceId: null,
//         startX: 0,
//         startY: 0,
//         origX: 0,
//         origY: 0,
//       };
//       document.removeEventListener("pointermove", onPointerMove);
//       document.removeEventListener("pointerup", onPointerUp);
//       document.removeEventListener("pointercancel", onPointerUp);
//       ev.preventDefault();
//     };

//     document.addEventListener("pointermove", onPointerMove);
//     document.addEventListener("pointerup", onPointerUp);
//     document.addEventListener("pointercancel", onPointerUp);

//     // prevent default to avoid text selection
//     e.preventDefault();
//   };

//   const clearPosition = (serviceId) => {
//     setPerServiceSettings((prev) => {
//       const cur = prev[serviceId] || {};
//       const next = { ...prev };
//       if (next[serviceId]) {
//         delete next[serviceId].x;
//         delete next[serviceId].y;
//         delete next[serviceId].hAlign;
//         delete next[serviceId].vAlign;
//         // remove key entirely if empty
//         if (Object.keys(next[serviceId]).length === 0) delete next[serviceId];
//       }
//       return next;
//     });
//     toast.info("Đã xóa vị trí tuỳ chỉnh.", { autoClose: 700 });
//   };

//   // ControlsPanel: shows global / selected controls
//   const ControlsPanel = () => {
//     const display = selectedServiceId
//       ? getSettingsFor(selectedServiceId)
//       : globalDims;
//     const selectedName = selectedServiceId
//       ? services.find((s) => s.id === selectedServiceId)?.name ??
//         selectedServiceId
//       : null;

//     return (
//       <div
//         className="absolute top-2 right-2 bg-white/95 rounded-xl p-3 shadow-md flex flex-col gap-2 text-sm"
//         style={{ zIndex: 200, minWidth: 300 }}
//       >
//         <div className="flex items-center justify-between">
//           <div>
//             <div className="font-semibold text-xs">
//               Chỉnh kích thước / vị trí nút
//             </div>
//             <div className="text-xs text-gray-600">
//               {selectedServiceId
//                 ? `Đang chỉnh: ${selectedName}`
//                 : "Không chọn (chỉnh toàn cục)"}
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               title="Áp dụng cài đặt đã chọn cho tất cả dịch vụ"
//               onClick={applySelectedToAll}
//               disabled={!selectedServiceId}
//               className={`px-2 py-1 rounded text-xs ${
//                 selectedServiceId
//                   ? "bg-blue-50 text-blue-700"
//                   : "bg-gray-100 text-gray-400 cursor-not-allowed"
//               }`}
//             >
//               Áp dụng cho tất cả
//             </button>
//             <button
//               title="Khôi phục mặc định"
//               onClick={resetAllToDefaults}
//               className="px-2 py-1 rounded bg-red-50 text-red-700 text-xs"
//             >
//               Reset
//             </button>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <div className="text-xs">W:</div>
//           <button
//             onClick={() => changeSelectedWidth(-40)}
//             className="px-2 py-1 rounded bg-gray-100"
//           >
//             -
//           </button>
//           <div className="px-2 text-sm font-medium">{display.width}px</div>
//           <button
//             onClick={() => changeSelectedWidth(40)}
//             className="px-2 py-1 rounded bg-gray-100"
//           >
//             +
//           </button>

//           <div className="ml-3 text-xs">H:</div>
//           <button
//             onClick={() => changeSelectedHeight(-8)}
//             className="px-2 py-1 rounded bg-gray-100"
//           >
//             -
//           </button>
//           <div className="px-2 text-sm font-medium">{display.height}px</div>
//           <button
//             onClick={() => changeSelectedHeight(8)}
//             className="px-2 py-1 rounded bg-gray-100"
//           >
//             +
//           </button>
//         </div>

//         <div className="flex items-center gap-2">
//           <div className="text-xs">Căn ngang:</div>
//           <button
//             onClick={() => setSelectedHAlign("left")}
//             className={`px-2 py-1 rounded text-xs ${
//               display.hAlign === "left"
//                 ? "bg-green-50 text-green-700"
//                 : "bg-gray-100"
//             }`}
//           >
//             Trái
//           </button>
//           <button
//             onClick={() => setSelectedHAlign("center")}
//             className={`px-2 py-1 rounded text-xs ${
//               display.hAlign === "center"
//                 ? "bg-green-50 text-green-700"
//                 : "bg-gray-100"
//             }`}
//           >
//             Giữa
//           </button>
//           <button
//             onClick={() => setSelectedHAlign("right")}
//             className={`px-2 py-1 rounded text-xs ${
//               display.hAlign === "right"
//                 ? "bg-green-50 text-green-700"
//                 : "bg-gray-100"
//             }`}
//           >
//             Phải
//           </button>
//         </div>

//         <div className="flex items-center gap-2">
//           <div className="text-xs">Căn dọc:</div>
//           <button
//             onClick={() => setSelectedVAlign("top")}
//             className={`px-2 py-1 rounded text-xs ${
//               display.vAlign === "top"
//                 ? "bg-green-50 text-green-700"
//                 : "bg-gray-100"
//             }`}
//           >
//             Trên
//           </button>
//           <button
//             onClick={() => setSelectedVAlign("center")}
//             className={`px-2 py-1 rounded text-xs ${
//               display.vAlign === "center"
//                 ? "bg-green-50 text-green-700"
//                 : "bg-gray-100"
//             }`}
//           >
//             Giữa
//           </button>
//           <button
//             onClick={() => setSelectedVAlign("bottom")}
//             className={`px-2 py-1 rounded text-xs ${
//               display.vAlign === "bottom"
//                 ? "bg-green-50 text-green-700"
//                 : "bg-gray-100"
//             }`}
//           >
//             Dưới
//           </button>
//         </div>

//         <div className="flex items-center justify-between gap-2">
//           <label className="inline-flex items-center gap-1 text-xs">
//             <input
//               type="checkbox"
//               checked={useFixedOnMobile}
//               onChange={(e) => setUseFixedOnMobile(e.target.checked)}
//               className="w-4 h-4"
//             />
//             Áp dụng kích thước cố định trên di động
//           </label>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={resetSelected}
//               className="px-2 py-1 rounded bg-gray-100 text-xs"
//             >
//               Bỏ chọn
//             </button>
//             <button
//               onClick={() => {
//                 setGlobalDims({
//                   width: DEFAULT_BUTTON_WIDTH,
//                   height: DEFAULT_BUTTON_HEIGHT,
//                   hAlign: "center",
//                   vAlign: "center",
//                 });
//                 setPerServiceSettings({});
//                 toast.info("Đặt lại kích thước mặc định.", { autoClose: 700 });
//               }}
//               className="px-2 py-1 rounded bg-yellow-50 text-yellow-800 text-xs"
//             >
//               Mặc định
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gray-50 justify-between overflow-hidden relative">
//       <header
//         className="w-full flex-none flex flex-col items-center mb-2 justify-center px-10  py-1"
//         style={{ backgroundColor: headerBg }}
//       >
//         <ControlsPanel />

//         <img
//           src={logoSrc}
//           alt="Header Logo"
//           className="h-20 w-96 mb-2 object-contain"
//         />
//         <div
//           className="text-lg font-semibold text-center uppercase"
//           style={{ color: headerTextColor }}
//         >
//           {loadingConfig ? "Đang tải cấu hình..." : config?.text_top ?? ""}
//         </div>
//       </header>

//       <main
//         className="flex-1 p-4 sm:px-6 md:px-8 overflow-auto"
//         style={{ position: "relative" }}
//       >
//         {isLoadingAll ? (
//           <div className="text-center text-gray-300">Đang tải...</div>
//         ) : !services.length ? (
//           <div className="text-center text-gray-300">
//             Không tìm thấy dịch vụ.
//           </div>
//         ) : (
//           // Columns: group services into columns of max 5 items each
//           <div
//             className="w-full max-w-7xl mx-auto h-full relative"
//             style={{
//               minHeight: "60vh",
//               height: "100%",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//             ref={canvasRef}
//           >
//             <div
//               className="flex gap-6 w-full"
//               style={{
//                 justifyContent: "center",
//                 alignItems: "flex-start",
//                 flexWrap: "wrap",
//               }}
//             >
//               {chunkArray(services, 5).map((col, colIndex) => (
//                 <div
//                   key={`col-${colIndex}`}
//                   className="flex flex-col gap-4"
//                   style={{
//                     width: isMobile ? "100%" : "auto",
//                     minWidth: isMobile ? undefined : 220,
//                     alignItems: "center",
//                   }}
//                 >
//                   {col.map((service) => {
//                     const s = getSettingsFor(service.id);
//                     const hasSavedPos =
//                       Number.isFinite(s.x) && Number.isFinite(s.y);
//                     // If service has saved position, skip rendering in column (it will be rendered in overlay)
//                     if (hasSavedPos) return null;

//                     const isRegistering = Boolean(registering[service.id]);
//                     const applyFixed = !isMobile || useFixedOnMobile;
//                     const buttonWidthStyle = applyFixed
//                       ? `${s.width}px`
//                       : "100%";

//                     // horizontal alignment inside column (based on s.hAlign)
//                     let alignItems = "center";
//                     if (!applyFixed) {
//                       alignItems = "stretch"; // when full width, stretch
//                     } else {
//                       if (s.hAlign === "left") alignItems = "flex-start";
//                       else if (s.hAlign === "right") alignItems = "flex-end";
//                       else alignItems = "center";
//                     }

//                     const wrapperStyle = {
//                       width: applyFixed ? "auto" : "100%",
//                       display: "flex",
//                       justifyContent: "center",
//                       alignItems: "center",
//                       position: "relative",
//                     };

//                     const buttonStyle = {
//                       width: buttonWidthStyle,
//                       maxWidth: "100%",
//                       height: `${s.height}px`,
//                       backgroundColor:
//                         safeColor(service.color, null) || DEFAULT_BUTTON_BG,
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       textAlign: "center",
//                       padding: "0 12px",
//                       boxSizing: "border-box",
//                       border: "none",
//                       cursor: "grab",
//                     };

//                     const selected = selectedServiceId === service.id;

//                     return (
//                       <div
//                         key={service.id}
//                         className="w-full"
//                         style={{
//                           display: "flex",
//                           justifyContent: alignItems,
//                         }}
//                       >
//                         <div style={wrapperStyle}>
//                           {/* gear/select button (positioned relative to wrapper) */}
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setSelectedServiceId((prev) =>
//                                 prev === service.id ? null : service.id
//                               );
//                             }}
//                             title={
//                               selected
//                                 ? "Bỏ chọn để chỉnh toàn cục"
//                                 : "Chọn nút để chỉnh"
//                             }
//                             className={`absolute top-1 right-1 z-20 px-1 py-0.5 rounded text-xs border bg-white/80 ${
//                               selected ? "ring-2 ring-indigo-300" : ""
//                             }`}
//                             style={{ transform: "translate(0,0)" }}
//                             onDoubleClick={(ev) => {
//                               ev.stopPropagation();
//                               // clear any saved position (no-op here)
//                               clearPosition(service.id);
//                             }}
//                           >
//                             ⚙
//                           </button>

//                           <button
//                             ref={(el) => {
//                               /* store element ref only if needed later (startDrag receives buttonEl) */
//                             }}
//                             disabled={isRegistering}
//                             onPointerDown={(ev) => {
//                               // start dragging from the button itself
//                               const target = ev.currentTarget;
//                               startDrag(ev, service.id, target);
//                             }}
//                             onClick={() => handleRegister(service.id)}
//                             className={`
//                               rounded text-white shadow transition uppercase font-semibold text-xl sm:text-2xl md:text-2xl
//                               flex items-center justify-center whitespace-normal break-words leading-tight
//                               ${
//                                 isRegistering
//                                   ? "opacity-60 cursor-not-allowed"
//                                   : "hover:brightness-90"
//                               }
//                               ${selected ? "ring-4 ring-indigo-200" : ""}
//                             `}
//                             style={buttonStyle}
//                           >
//                             <span
//                               className="block"
//                               style={{
//                                 display: "-webkit-box",
//                                 WebkitLineClamp: 2,
//                                 WebkitBoxOrient: "vertical",
//                                 overflow: "hidden",
//                                 textOverflow: "ellipsis",
//                                 width: "100%",
//                               }}
//                             >
//                               {service.name}
//                             </span>
//                           </button>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               ))}
//             </div>

//             {/* Overlay layer: render any services that have saved x/y positions (or are being dragged) */}
//             <div
//               className="absolute inset-0 pointer-events-none"
//               style={{ zIndex: 150 }}
//             >
//               {services.map((service) => {
//                 const s = getSettingsFor(service.id);
//                 const hasPos = Number.isFinite(s.x) && Number.isFinite(s.y);
//                 if (!hasPos) return null;

//                 const isRegistering = Boolean(registering[service.id]);
//                 const buttonStyle = {
//                   width: `${s.width}px`,
//                   maxWidth: "100%",
//                   height: `${s.height}px`,
//                   backgroundColor:
//                     safeColor(service.color, null) || DEFAULT_BUTTON_BG,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   textAlign: "center",
//                   padding: "0 12px",
//                   boxSizing: "border-box",
//                   border: "none",
//                   cursor: "grab",
//                 };

//                 const wrapperStyle = {
//                   position: "absolute",
//                   left: s.x,
//                   top: s.y,
//                   pointerEvents: "auto", // allow interaction here
//                 };

//                 const selected = selectedServiceId === service.id;

//                 return (
//                   <div key={`pos-${service.id}`} style={wrapperStyle}>
//                     <div style={{ position: "relative" }}>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setSelectedServiceId((prev) =>
//                             prev === service.id ? null : service.id
//                           );
//                         }}
//                         onDoubleClick={(ev) => {
//                           ev.stopPropagation();
//                           clearPosition(service.id);
//                         }}
//                         title={
//                           selected
//                             ? "Bỏ chọn để chỉnh toàn cục"
//                             : "Chọn nút để chỉnh"
//                         }
//                         className={`absolute -top-3 -right-3 z-30 px-1 py-0.5 rounded text-xs border bg-white/90 ${
//                           selected ? "ring-2 ring-indigo-300" : ""
//                         }`}
//                       >
//                         ⚙
//                       </button>

//                       <button
//                         disabled={isRegistering}
//                         onPointerDown={(ev) => {
//                           // start drag from overlay button
//                           const target = ev.currentTarget;
//                           startDrag(ev, service.id, target);
//                         }}
//                         onClick={() => handleRegister(service.id)}
//                         className={`
//                           rounded text-white shadow transition uppercase font-semibold text-xl sm:text-2xl md:text-2xl
//                           flex items-center justify-center whitespace-normal break-words leading-tight
//                           ${
//                             isRegistering
//                               ? "opacity-60 cursor-not-allowed"
//                               : "hover:brightness-90"
//                           }
//                           ${selected ? "ring-4 ring-indigo-200" : ""}
//                         `}
//                         style={buttonStyle}
//                       >
//                         <span
//                           className="block"
//                           style={{
//                             display: "-webkit-box",
//                             WebkitLineClamp: 2,
//                             WebkitBoxOrient: "vertical",
//                             overflow: "hidden",
//                             textOverflow: "ellipsis",
//                             width: "100%",
//                           }}
//                         >
//                           {service.name}
//                         </span>
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}
//       </main>

//       <footer
//         className="w-full mt-2 flex-none flex flex-col justify-center items-center py-4"
//         style={{ backgroundColor: footerBg }}
//       >
//         <div
//           className="text-lg font-bold text-center uppercase"
//           style={{
//             display: "inline-block",
//             animation: "marquee 10s linear infinite",
//             color: footerTextColor,
//           }}
//         >
//           {loadingConfig ? "Đang tải cấu hình..." : config?.text_bottom ?? ""}
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default TicketCreate;
// src/pages/TicketDisplay.jsx

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

/**
 * Parse layout từ API config/buttons
 * Expect dạng:
 * {
 *   global: { width, height, h_align, v_align, use_fixed_on_mobile },
 *   services: [
 *     { service_id, width, height, h_align, v_align, x, y },
 *     ...
 *   ]
 * }
 */
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
