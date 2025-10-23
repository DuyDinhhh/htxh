import React, { useEffect, useState, useCallback } from "react";
import ServiceService from "../../services/serviceService";
import TicketService from "../../services/ticketService";
import { toast } from "react-toastify";
import { debounce } from "lodash";

// Utility to chunk array into arrays of size n
const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const TicketCreate = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState({});

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await ServiceService.list();
        const validServices = (response.services || []).filter(
          (service) =>
            Array.isArray(service.devices) && service.devices.length > 0
        );
        setServices(validServices || []);
      } catch (err) {
        setServices([]);
        toast.error("Lỗi khi tải dịch vụ", { autoClose: 500 });
      }
      setLoading(false);
    };
    fetchServices();
  }, []);

  const debouncedRegister = useCallback(
    debounce(
      async (id) => {
        setRegistering((prev) => ({ ...prev, [id]: true }));
        try {
          const response = await TicketService.register(id);
          toast.success(response?.message || "Lấy số thành công..", {
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
      500,
      { leading: true, trailing: false }
    ),
    []
  );

  const handleRegister = (id) => debouncedRegister(id);

  // Chunk services into groups of 5 (each column holds up to 5)
  const serviceColumns = chunkArray(services, 5);

  return (
    <div className="flex flex-col h-screen bg-gray-50 justify-between overflow-hidden">
      <header className="w-full bg-[#B3AAAA] flex-none flex flex-col justify-center items-center py-2">
        <img
          src="/images/agribank-logo.png"
          alt="Header Logo"
          className="h-20 w-96 object-contain"
        />
        <div className="text-lg text-[#b10730] font-semibold text-center uppercase">
          Ngân hàng Agribank - Chi nhánh Bắc Đồng Nai
        </div>
      </header>

      {/* Center area (no scroll), content centered */}
      <main className="flex-1 flex items-center justify-center px-8">
        {loading ? (
          <div className="text-center text-gray-300">Đang tải dịch vụ...</div>
        ) : !services.length ? (
          <div className="text-center text-gray-300">
            Không tìm thấy dịch vụ.
          </div>
        ) : (
          <div className="flex justify-center gap-8">
            {serviceColumns.map((serviceGroup, colIdx) => (
              <div key={colIdx} className="flex flex-col items-center gap-6">
                {serviceGroup.map((service) => (
                  <button
                    key={service.id}
                    disabled={registering[service.id]}
                    onClick={() => handleRegister(service.id)}
                    className={`p-2 w-96 h-auto flex flex-col justify-center items-center uppercase text-xl font-semibold text-white shadow transition ${
                      registering[service.id]
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:brightness-90"
                    }`}
                    style={{
                      minWidth: "240px",
                      minHeight: "64px",
                      backgroundColor: service.color || "#8B4513",
                    }}
                  >
                    {service.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer pinned at bottom */}
      <footer className="w-full bg-[#B3AAAA] flex-none flex flex-col justify-center items-center py-4">
        <div
          className="text-lg text-[#b10730] font-semibold text-center uppercase"
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
};

export default TicketCreate;
