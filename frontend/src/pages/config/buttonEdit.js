// src/pages/TicketButtonConfig.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import ServiceService from "../../services/serviceService";
import { useNavigate } from "react-router-dom";
import ConfigService from "../../services/configService";
import { getImageUrl } from "../../services/httpAxios";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import Footer from "../../components/kiosk/footer";

const DEFAULT_BG = "#B3AAAA";
const DEFAULT_HEADER_TEXT_COLOR = "#b10730";
const DEFAULT_BUTTON_BG = "#8B4513";

const DEFAULT_BUTTON_WIDTH = 420;
const DEFAULT_BUTTON_HEIGHT = 90;

const MIN_BUTTON_WIDTH = 80;
const MAX_BUTTON_WIDTH = 1200;
const MIN_BUTTON_HEIGHT = 30;
const MAX_BUTTON_HEIGHT = 800;

const SNAP_THRESHOLD = 16;

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

const serializeLayout = (globalDims, perServiceSettings, useFixedOnMobile) => {
  const services = Object.entries(perServiceSettings || {}).map(
    ([serviceId, s]) => ({
      service_id: Number(serviceId),
      width: s.width,
      height: s.height,
      h_align: s.hAlign,
      v_align: s.vAlign,
      x: s.x,
      y: s.y,
    })
  );

  return {
    global: {
      width: globalDims.width,
      height: globalDims.height,
      h_align: globalDims.hAlign,
      v_align: globalDims.vAlign,
      use_fixed_on_mobile: !!useFixedOnMobile,
    },
    services,
  };
};

/**
 * Parse payload từ API -> state
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

/**
 * TicketButtonConfig - trang cấu hình
 */
const TicketButtonConfig = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [globalDims, setGlobalDims] = useState({
    width: DEFAULT_BUTTON_WIDTH,
    height: DEFAULT_BUTTON_HEIGHT,
    hAlign: "center",
    vAlign: "center",
  });

  const [perServiceSettings, setPerServiceSettings] = useState({});
  const [useFixedOnMobile, setUseFixedOnMobile] = useState(false);

  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [showControls, setShowControls] = useState(true);
  const [saving, setSaving] = useState(false);

  const resizeListenerRef = useRef(null);
  const canvasRef = useRef(null);

  const dragRef = useRef({
    active: false,
    serviceId: null,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  const [, setDragTick] = useState(0);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  /** ------------------- LOAD SERVICES ------------------- */
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

  /** ------------------- LOAD CONFIG HEADER/FOOTER ------------------- */
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

  /** ------------------- LOAD BUTTON LAYOUT FROM DB ------------------- */
  useEffect(() => {
    const loadButtonLayout = async () => {
      try {
        const res = await ConfigService.getButton();
        const data = res?.data || res;
        parseLayoutFromServer(
          data,
          setGlobalDims,
          setPerServiceSettings,
          setUseFixedOnMobile
        );
      } catch (e) {
        console.error("Không tải được button layout:", e);
      }
    };
    loadButtonLayout();
  }, []);

  /** ------------------- AUTO SAVE TO DB (DEBOUNCE) ------------------- */
  const saveLayout = useCallback(
    debounce(
      async (globalDimsArg, perServiceSettingsArg, useFixedOnMobileArg) => {
        try {
          setSaving(true);
          const payload = serializeLayout(
            globalDimsArg,
            perServiceSettingsArg,
            useFixedOnMobileArg
          );
          await ConfigService.saveButton(payload);
        } catch (e) {
          console.error("Lưu cấu hình nút thất bại:", e);
          toast.error("Lưu cấu hình nút thất bại.", { autoClose: 1000 });
        } finally {
          setSaving(false);
        }
      },
      800
    ),
    []
  );

  useEffect(() => {
    // Chỉ save khi đã load dịch vụ (tránh save layout trống lúc đầu)
    if (!services.length) return;
    saveLayout(globalDims, perServiceSettings, useFixedOnMobile);
  }, [
    globalDims,
    perServiceSettings,
    useFixedOnMobile,
    services.length,
    saveLayout,
  ]);

  useEffect(() => {
    return () => {
      saveLayout.cancel?.();
    };
  }, [saveLayout]);

  /** ------------------- HELPERS ------------------- */
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

  const computeAlignedPosition = (serviceId, hAlign, vAlign) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const s = perServiceSettings?.[serviceId] || {};
    const width = Number.isFinite(s.width) ? s.width : globalDims.width;
    const height = Number.isFinite(s.height) ? s.height : globalDims.height;

    const leftEdge = 8;
    const rightEdge = Math.max(8, rect.width - width - 8);
    const centerX = Math.round((rect.width - width) / 2);

    const topY = 8;
    const bottomY = Math.max(8, rect.height - height - 8);
    const centerY = Math.round((rect.height - height) / 2);

    let x;
    if (hAlign === "left") x = leftEdge;
    else if (hAlign === "center") x = centerX;
    else if (hAlign === "right") x = rightEdge;

    let y;
    if (vAlign === "top") y = topY;
    else if (vAlign === "center") y = centerY;
    else if (vAlign === "bottom") y = bottomY;

    if (typeof x === "number") {
      x = Math.max(0, Math.min(x, Math.max(0, rect.width - width)));
    }
    if (typeof y === "number") {
      y = Math.max(0, Math.min(y, Math.max(0, rect.height - height)));
    }
    return { x, y };
  };

  /** ------------------- CHANGE SIZE / ALIGN ------------------- */
  const changeSelectedWidth = (delta) => {
    if (!selectedServiceId) {
      setGlobalDims((prev) => ({
        ...prev,
        width: clamp(prev.width + delta, MIN_BUTTON_WIDTH, MAX_BUTTON_WIDTH),
      }));
      return;
    }
    setPerServiceSettings((prev) => {
      const cur = prev[selectedServiceId] || {};
      const newW = clamp(
        (Number.isFinite(cur.width) ? cur.width : globalDims.width) + delta,
        MIN_BUTTON_WIDTH,
        MAX_BUTTON_WIDTH
      );
      return { ...prev, [selectedServiceId]: { ...cur, width: newW } };
    });
  };

  const changeSelectedHeight = (delta) => {
    if (!selectedServiceId) {
      setGlobalDims((prev) => ({
        ...prev,
        height: clamp(
          prev.height + delta,
          MIN_BUTTON_HEIGHT,
          MAX_BUTTON_HEIGHT
        ),
      }));
      return;
    }
    setPerServiceSettings((prev) => {
      const cur = prev[selectedServiceId] || {};
      const newH = clamp(
        (Number.isFinite(cur.height) ? cur.height : globalDims.height) + delta,
        MIN_BUTTON_HEIGHT,
        MAX_BUTTON_HEIGHT
      );
      return { ...prev, [selectedServiceId]: { ...cur, height: newH } };
    });
  };

  const setSelectedHAlign = (align) => {
    if (!selectedServiceId) {
      setGlobalDims((prev) => ({ ...prev, hAlign: align }));
      return;
    }

    setPerServiceSettings((prev) => {
      const cur = prev[selectedServiceId] || {};
      const next = { ...prev, [selectedServiceId]: { ...cur, hAlign: align } };

      if (Number.isFinite(cur.x) && canvasRef.current) {
        const pos = computeAlignedPosition(
          selectedServiceId,
          align,
          cur.vAlign || globalDims.vAlign
        );
        if (pos && typeof pos.x === "number") {
          next[selectedServiceId].x = Math.round(pos.x);
        }
      }
      return next;
    });
  };

  const setSelectedVAlign = (align) => {
    if (!selectedServiceId) {
      setGlobalDims((prev) => ({ ...prev, vAlign: align }));
      return;
    }
    setPerServiceSettings((prev) => {
      const cur = prev[selectedServiceId] || {};
      const next = { ...prev, [selectedServiceId]: { ...cur, vAlign: align } };

      if (Number.isFinite(cur.y) && canvasRef.current) {
        const pos = computeAlignedPosition(
          selectedServiceId,
          cur.hAlign || globalDims.hAlign,
          align
        );
        if (pos && typeof pos.y === "number") {
          next[selectedServiceId].y = Math.round(pos.y);
        }
      }
      return next;
    });
  };

  const resetSelected = () => {
    setSelectedServiceId(null);
  };

  const applySelectedToAll = () => {
    if (!selectedServiceId) return;
    const sel = getSettingsFor(selectedServiceId);
    const next = {};
    services.forEach((s) => {
      next[s.id] = {
        width: sel.width,
        height: sel.height,
        hAlign: sel.hAlign,
        vAlign: sel.vAlign,
        x: sel.x,
        y: sel.y,
      };
    });
    setPerServiceSettings(next);
    toast.success("Áp dụng cấu hình cho tất cả dịch vụ.", { autoClose: 800 });
  };

  const resetAllToDefaults = () => {
    setPerServiceSettings({});
    setGlobalDims({
      width: DEFAULT_BUTTON_WIDTH,
      height: DEFAULT_BUTTON_HEIGHT,
      hAlign: "center",
      vAlign: "center",
    });
    setUseFixedOnMobile(false);
    setSelectedServiceId(null);
    toast.info("Đã khôi phục về mặc định.", { autoClose: 800 });
  };

  /** ------------------- DRAG + SNAPPING ------------------- */
  const startDrag = (e, serviceId, buttonEl) => {
    if (e.button && e.button !== 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();
    const elRect = buttonEl.getBoundingClientRect();

    const origX = elRect.left - canvasRect.left;
    const origY = elRect.top - canvasRect.top;

    dragRef.current = {
      active: true,
      serviceId,
      startX: e.clientX,
      startY: e.clientY,
      origX,
      origY,
    };

    setPerServiceSettings((prev) => {
      const cur = prev[serviceId] || {};
      if (Number.isFinite(cur.x) && Number.isFinite(cur.y)) {
        return prev;
      }
      return {
        ...prev,
        [serviceId]: { ...cur, x: Math.round(origX), y: Math.round(origY) },
      };
    });

    const onPointerMove = (ev) => {
      if (!dragRef.current.active) return;
      const { startX, startY, origX, origY, serviceId: id } = dragRef.current;
      const rect = canvas.getBoundingClientRect();
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let nx = origX + dx;
      let ny = origY + dy;

      nx = clamp(nx, 0, Math.max(0, rect.width - 20));
      ny = clamp(ny, 0, Math.max(0, rect.height - 20));

      const s = getSettingsFor(id);
      const buttonW = s.width;
      const leftEdge = 8;
      const rightEdge = Math.max(8, rect.width - buttonW - 8);
      const centerX = Math.round((rect.width - buttonW) / 2);

      const otherXs = [];
      Object.entries(perServiceSettings).forEach(([k, v]) => {
        if (k === id) return;
        if (Number.isFinite(v.x)) {
          otherXs.push(Math.round(v.x));
        }
      });

      let snappedX = nx;
      let chosenHAlign = null;

      const trySnapX = (candidateX, alignName) => {
        if (Math.abs(nx - candidateX) <= SNAP_THRESHOLD) {
          snappedX = candidateX;
          chosenHAlign = alignName;
        }
      };

      trySnapX(leftEdge, "left");
      trySnapX(centerX, "center");
      trySnapX(rightEdge, "right");

      for (const ox of otherXs) {
        if (Math.abs(nx - ox) <= SNAP_THRESHOLD) {
          snappedX = ox;
          chosenHAlign = "custom";
          break;
        }
      }

      const topY = 8;
      const bottomY = Math.max(8, rect.height - s.height - 8);
      const centerY = Math.round((rect.height - s.height) / 2);

      let snappedY = ny;
      let chosenVAlign = null;
      if (Math.abs(ny - topY) <= SNAP_THRESHOLD) {
        snappedY = topY;
        chosenVAlign = "top";
      } else if (Math.abs(ny - centerY) <= SNAP_THRESHOLD) {
        snappedY = centerY;
        chosenVAlign = "center";
      } else if (Math.abs(ny - bottomY) <= SNAP_THRESHOLD) {
        snappedY = bottomY;
        chosenVAlign = "bottom";
      }

      setPerServiceSettings((prev) => {
        const cur = prev[id] || {};
        const next = {
          ...prev,
          [id]: {
            ...cur,
            x: Math.round(snappedX),
            y: Math.round(snappedY),
          },
        };
        if (chosenHAlign) next[id].hAlign = chosenHAlign;
        if (chosenVAlign) next[id].vAlign = chosenVAlign;
        return next;
      });

      setDragTick((t) => t + 1);
      ev.preventDefault();
    };

    const onPointerUp = (ev) => {
      if (!dragRef.current.active) return;
      const id = dragRef.current.serviceId;
      const rect = canvas.getBoundingClientRect();

      setPerServiceSettings((prev) => {
        const cur = prev[id] || {};
        if (!Number.isFinite(cur.x) || !Number.isFinite(cur.y)) return prev;
        const x = cur.x;
        const y = cur.y;
        const buttonW = Number.isFinite(cur.width)
          ? cur.width
          : getSettingsFor(id).width;

        const leftEdge = 8;
        const rightEdge = Math.max(8, rect.width - buttonW - 8);
        const centerX = Math.round((rect.width - buttonW) / 2);

        const topY = 8;
        const bottomY = Math.max(
          8,
          rect.height -
            (Number.isFinite(cur.height)
              ? cur.height
              : getSettingsFor(id).height) -
            8
        );
        const centerY = Math.round(
          (rect.height -
            (Number.isFinite(cur.height)
              ? cur.height
              : getSettingsFor(id).height)) /
            2
        );

        let finalHAlign = cur.hAlign || getSettingsFor(id).hAlign;
        if (Math.abs(x - leftEdge) <= SNAP_THRESHOLD) finalHAlign = "left";
        else if (Math.abs(x - centerX) <= SNAP_THRESHOLD)
          finalHAlign = "center";
        else if (Math.abs(x - rightEdge) <= SNAP_THRESHOLD)
          finalHAlign = "right";

        let finalVAlign = cur.vAlign || getSettingsFor(id).vAlign;
        if (Math.abs(y - topY) <= SNAP_THRESHOLD) finalVAlign = "top";
        else if (Math.abs(y - centerY) <= SNAP_THRESHOLD)
          finalVAlign = "center";
        else if (Math.abs(y - bottomY) <= SNAP_THRESHOLD)
          finalVAlign = "bottom";

        return {
          ...prev,
          [id]: {
            ...cur,
            x: Math.round(x),
            y: Math.round(y),
            hAlign: finalHAlign,
            vAlign: finalVAlign,
          },
        };
      });

      dragRef.current = {
        active: false,
        serviceId: null,
        startX: 0,
        startY: 0,
        origX: 0,
        origY: 0,
      };
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
      ev.preventDefault();
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);

    e.preventDefault();
  };

  const clearPosition = (serviceId) => {
    setPerServiceSettings((prev) => {
      const cur = prev[serviceId] || {};
      const next = { ...prev };
      if (next[serviceId]) {
        delete next[serviceId].x;
        delete next[serviceId].y;
        delete next[serviceId].hAlign;
        delete next[serviceId].vAlign;
        if (Object.keys(next[serviceId]).length === 0) delete next[serviceId];
      }
      return next;
    });
    toast.info("Đã xóa vị trí tuỳ chỉnh.", { autoClose: 700 });
  };

  /** ------------------- CONTROLS PANEL ------------------- */
  const ControlsPanel = () => {
    const display = selectedServiceId
      ? getSettingsFor(selectedServiceId)
      : globalDims;
    const selectedName = selectedServiceId
      ? services.find((s) => s.id === selectedServiceId)?.name ??
        selectedServiceId
      : null;

    return (
      <div
        className="absolute top-2 right-2 bg-white/95 rounded-xl p-3 shadow-md flex flex-col gap-2 text-sm"
        style={{ zIndex: 200, minWidth: 300 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-xs">
              Chỉnh kích thước / vị trí nút
            </div>
            <div className="text-xs text-gray-600">
              {selectedServiceId
                ? `Đang chỉnh: ${selectedName}`
                : "Không chọn (chỉnh toàn cục)"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              title="Áp dụng cài đặt đã chọn cho tất cả dịch vụ"
              onClick={applySelectedToAll}
              disabled={!selectedServiceId}
              className={`px-2 py-1 rounded text-xs ${
                selectedServiceId
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Áp dụng cho tất cả
            </button>
            <button
              title="Khôi phục mặc định"
              onClick={resetAllToDefaults}
              className="px-2 py-1 rounded bg-red-50 text-red-700 text-xs"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-2 py-1 rounded bg-green-50 text-green-700 text-xs"
            >
              Quay lại
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs">W:</div>
          <button
            onClick={() => changeSelectedWidth(-40)}
            className="px-2 py-1 rounded bg-gray-100"
          >
            -
          </button>
          <div className="px-2 text-sm font-medium">{display.width}px</div>
          <button
            onClick={() => changeSelectedWidth(40)}
            className="px-2 py-1 rounded bg-gray-100"
          >
            +
          </button>

          <div className="ml-3 text-xs">H:</div>
          <button
            onClick={() => changeSelectedHeight(-8)}
            className="px-2 py-1 rounded bg-gray-100"
          >
            -
          </button>
          <div className="px-2 text-sm font-medium">{display.height}px</div>
          <button
            onClick={() => changeSelectedHeight(8)}
            className="px-2 py-1 rounded bg-gray-100"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs">Căn ngang:</div>
          <button
            onClick={() => setSelectedHAlign("left")}
            className={`px-2 py-1 rounded text-xs ${
              display.hAlign === "left"
                ? "bg-green-50 text-green-700"
                : "bg-gray-100"
            }`}
          >
            Trái
          </button>
          <button
            onClick={() => setSelectedHAlign("center")}
            className={`px-2 py-1 rounded text-xs ${
              display.hAlign === "center"
                ? "bg-green-50 text-green-700"
                : "bg-gray-100"
            }`}
          >
            Giữa
          </button>
          <button
            onClick={() => setSelectedHAlign("right")}
            className={`px-2 py-1 rounded text-xs ${
              display.hAlign === "right"
                ? "bg-green-50 text-green-700"
                : "bg-gray-100"
            }`}
          >
            Phải
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs">Căn dọc:</div>
          <button
            onClick={() => setSelectedVAlign("top")}
            className={`px-2 py-1 rounded text-xs ${
              display.vAlign === "top"
                ? "bg-green-50 text-green-700"
                : "bg-gray-100"
            }`}
          >
            Trên
          </button>
          <button
            onClick={() => setSelectedVAlign("center")}
            className={`px-2 py-1 rounded text-xs ${
              display.vAlign === "center"
                ? "bg-green-50 text-green-700"
                : "bg-gray-100"
            }`}
          >
            Giữa
          </button>
          <button
            onClick={() => setSelectedVAlign("bottom")}
            className={`px-2 py-1 rounded text-xs ${
              display.vAlign === "bottom"
                ? "bg-green-50 text-green-700"
                : "bg-gray-100"
            }`}
          >
            Dưới
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <label className="inline-flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={useFixedOnMobile}
              onChange={(e) => setUseFixedOnMobile(e.target.checked)}
              className="w-4 h-4"
            />
            Áp dụng kích thước cố định trên di động
          </label>
          <div className="flex items-center gap-2">
            <button
              title="Ẩn bảng điều khiển"
              onClick={() => setShowControls(false)} // NEW
              className="px-2 py-1 rounded bg-gray-100 text-xs"
            >
              Ẩn
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetSelected}
              className="px-2 py-1 rounded bg-gray-100 text-xs"
            >
              Bỏ chọn
            </button>
            <button
              onClick={() => {
                setGlobalDims({
                  width: DEFAULT_BUTTON_WIDTH,
                  height: DEFAULT_BUTTON_HEIGHT,
                  hAlign: "center",
                  vAlign: "center",
                });
                setPerServiceSettings({});
                toast.info("Đặt lại kích thước mặc định.", {
                  autoClose: 700,
                });
              }}
              className="px-2 py-1 rounded bg-yellow-50 text-yellow-800 text-xs"
            >
              Mặc định
            </button>
          </div>
        </div>

        <div className="text-right text-[11px] text-gray-400 mt-1">
          {saving ? "Đang lưu cấu hình..." : "Đã lưu"}
        </div>
      </div>
    );
  };

  /** ------------------- RENDER ------------------- */
  return (
    <div className="flex flex-col h-screen bg-gray-50 justify-between overflow-hidden relative">
      <header
        className="w-full flex-none flex flex-col items-center mb-2 justify-center px-10  py-4"
        style={{ backgroundColor: headerBg }}
      >
        {!showControls && (
          <button
            onClick={() => setShowControls(true)}
            className="absolute top-2 right-2 px-2 py-1 rounded bg-white text-xs shadow"
          >
            Hiện bảng điều khiển
          </button>
        )}
        {showControls && <ControlsPanel />}{" "}
        <img
          src={logoSrc}
          alt="Header Logo"
          className="h-20 w-96 object-contain"
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
                    if (hasSavedPos) return null;

                    const applyFixed = !isMobile || useFixedOnMobile;
                    const buttonWidthStyle = applyFixed
                      ? `${s.width}px`
                      : "100%";

                    let alignItems = "center";
                    if (!applyFixed) {
                      alignItems = "stretch";
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
                      cursor: "grab",
                    };

                    const selected = selectedServiceId === service.id;

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
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedServiceId((prev) =>
                                prev === service.id ? null : service.id
                              );
                            }}
                            title={
                              selected
                                ? "Bỏ chọn để chỉnh toàn cục"
                                : "Chọn nút để chỉnh"
                            }
                            className={`absolute top-1 right-1 z-20 px-1 py-0.5 rounded-xl text-xs border bg-white/80 ${
                              selected ? "ring-2 ring-indigo-300" : ""
                            }`}
                            style={{ transform: "translate(0,0)" }}
                            onDoubleClick={(ev) => {
                              ev.stopPropagation();
                              clearPosition(service.id);
                            }}
                          >
                            ⚙
                          </button>

                          <button
                            onPointerDown={(ev) => {
                              const target = ev.currentTarget;
                              startDrag(ev, service.id, target);
                            }}
                            className={`
                              rounded-xl text-white shadow transition uppercase font-semibold text-xl sm:text-2xl md:text-2xl
                              flex items-center justify-center whitespace-normal break-words leading-tight
                      
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

            <div
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 150 }}
            >
              {services.map((service) => {
                const s = getSettingsFor(service.id);
                const hasPos = Number.isFinite(s.x) && Number.isFinite(s.y);
                if (!hasPos) return null;

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
                  cursor: "grab",
                };

                const wrapperStyle = {
                  position: "absolute",
                  left: s.x,
                  top: s.y,
                  pointerEvents: "auto",
                };

                const selected = selectedServiceId === service.id;

                return (
                  <div key={`pos-${service.id}`} style={wrapperStyle}>
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedServiceId((prev) =>
                            prev === service.id ? null : service.id
                          );
                        }}
                        onDoubleClick={(ev) => {
                          ev.stopPropagation();
                          clearPosition(service.id);
                        }}
                        title={
                          selected
                            ? "Bỏ chọn để chỉnh toàn cục"
                            : "Chọn nút để chỉnh"
                        }
                        className={`absolute -top-3 -right-3 z-30 px-1 py-0.5 rounded-xl text-xs border bg-white/90 ${
                          selected ? "ring-2 ring-indigo-300" : ""
                        }`}
                      >
                        ⚙
                      </button>

                      <button
                        onPointerDown={(ev) => {
                          const target = ev.currentTarget;
                          startDrag(ev, service.id, target);
                        }}
                        className={`
                          rounded-xl text-white shadow transition uppercase font-semibold text-xl sm:text-2xl md:text-2xl
                          flex items-center justify-center whitespace-normal break-words leading-tight
                          
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

export default TicketButtonConfig;
