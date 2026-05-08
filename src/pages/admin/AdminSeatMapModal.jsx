import React, { useState, useEffect } from 'react';
import { X, Save, Eraser } from 'lucide-react';
import { seatApi } from '../../api/seatApi';

export default function AdminSeatMapModal({ hall, onClose }) {
  const [seatTypes, setSeatTypes] = useState([]);
  const [seatMap, setSeatMap] = useState({}); 
  const [activePaintType, setActivePaintType] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);

  const rows = Array.from({ length: hall.totalRows }, (_, i) => String.fromCharCode(65 + i));
  const cols = Array.from({ length: hall.totalCols }, (_, i) => i + 1);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const typesRes = await seatApi.getSeatTypes();
        // Nâng cấp: Tự động kiểm tra xem dữ liệu đã là mảng chưa
        const typesData = Array.isArray(typesRes) ? typesRes : (typesRes?.data?.data || typesRes?.data || []);
        setSeatTypes(typesData);
        if (typesData.length > 0) setActivePaintType(typesData[0].id);

        const seatsRes = await seatApi.getSeatsByHall(hall.id);
        const savedSeats = Array.isArray(seatsRes) ? seatsRes : (seatsRes?.data?.data || seatsRes?.data || []);
        
        const mapObj = {};
        savedSeats.forEach(s => {
          mapObj[`${s.rowLabel}-${s.colNumber}`] = {
            seatTypeId: s.seatType.id,
            isActive: s.isActive
          };
        });
        setSeatMap(mapObj);
      } catch (err) {
        console.error("Lỗi tải dữ liệu ghế:", err);
      }
    };
    fetchInitialData();
  }, [hall]);

  // --- TÔ MÀU 1 GHẾ ---
  const handleSeatClick = (row, col) => {
    const key = `${row}-${col}`;
    if (activePaintType === 'ERASER') {
      setSeatMap(prev => ({ ...prev, [key]: { ...prev[key], isActive: false } }));
    } else {
      setSeatMap(prev => ({ ...prev, [key]: { seatTypeId: activePaintType, isActive: true } }));
    }
  };

  // --- TÔ MÀU TOÀN BỘ 1 HÀNG (Tính năng mới) ---
  const handleRowClick = (row) => {
    if (!activePaintType) return;
    setSeatMap(prev => {
      const newMap = { ...prev };
      cols.forEach(col => {
        const key = `${row}-${col}`;
        if (activePaintType === 'ERASER') {
          newMap[key] = { ...newMap[key], isActive: false }; // Tẩy cả hàng
        } else {
          newMap[key] = { seatTypeId: activePaintType, isActive: true }; // Tô cả hàng
        }
      });
      return newMap;
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    const bulkData = [];
    rows.forEach(row => {
      cols.forEach(col => {
        const seatData = seatMap[`${row}-${col}`];
        if (seatData) {
          bulkData.push({
            rowLabel: row,
            colNumber: col,
            seatTypeId: seatData.seatTypeId,
            isActive: seatData.isActive
          });
        }
      });
    });

    try {
      await seatApi.saveSeatMap(hall.id, bulkData);
      alert("Đã lưu Sơ đồ ghế thành công!");
      onClose();
    } catch (err) {
      alert("Có lỗi khi lưu sơ đồ ghế.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Cấu hình Sơ đồ Ghế</h2>
            <p className="text-sm text-gray-500">Phòng: <b>{hall.name}</b> ({hall.totalRows} hàng x {hall.totalCols} cột)</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full"><X size={20} /></button>
        </div>

        {/* Bảng Màu (Toolbar Bút tô) */}
        <div className="p-4 border-b flex gap-4 items-center justify-center bg-white shadow-sm z-10">
          <span className="font-semibold text-sm text-gray-600 mr-2">Công cụ vẽ:</span>
          
          {seatTypes.map(type => (
            <button 
              key={type.id} 
              onClick={() => setActivePaintType(type.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all ${activePaintType === type.id ? 'border-blue-600 shadow-md transform scale-105' : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <div className="w-5 h-5 rounded" style={{ backgroundColor: type.colorCode || '#ccc' }}></div>
              {type.name}
            </button>
          ))}
          
          {/* Cục tẩy (Nâng cấp: Bấm lại để tắt và quay về màu mặc định) */}
          <button 
            onClick={() => setActivePaintType(activePaintType === 'ERASER' ? (seatTypes[0]?.id || null) : 'ERASER')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all ${activePaintType === 'ERASER' ? 'border-red-600 shadow-md transform scale-105 text-red-600' : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Eraser size={20} /> Lối đi / Bỏ trống
          </button>
        </div>

        {/* Khung Vẽ Ma Trận Ghế */}
        <div className="p-6 overflow-auto bg-gray-100 flex-1 flex flex-col items-center">
          <div className="w-2/3 h-8 bg-gray-300 rounded-t-3xl mb-12 shadow-inner border-b-4 border-gray-400 text-center text-gray-500 text-sm font-bold flex items-end justify-center pb-1 uppercase tracking-widest">
            Màn Hình Chiếu
          </div>

          <div className="flex flex-col gap-3">
            {rows.map(row => (
              <div key={row} className="flex gap-3 items-center">
                {/* Tên hàng trái (Bấm để tô cả hàng) */}
                <button 
                  onClick={() => handleRowClick(row)} 
                  className="w-8 h-8 font-bold text-gray-500 text-center hover:bg-gray-300 rounded cursor-pointer transition-colors" 
                  title={`Tô toàn bộ hàng ${row}`}
                >
                  {row}
                </button>
                
                {/* Các ghế trong hàng */}
                <div className="flex gap-2">
                  {cols.map(col => {
                    const seatData = seatMap[`${row}-${col}`];
                    const typeInfo = seatData && seatData.isActive ? seatTypes.find(t => t.id === seatData.seatTypeId) : null;
                    const bgColor = typeInfo ? typeInfo.colorCode : 'transparent';
                    const isCorridor = !seatData || !seatData.isActive;

                    return (
                      <button
                        key={`${row}-${col}`}
                        onClick={() => handleSeatClick(row, col)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-t-lg rounded-b-sm border shadow-sm transition-transform hover:scale-110 flex items-center justify-center text-xs font-medium
                          ${isCorridor ? 'border-dashed border-gray-400 opacity-30 hover:opacity-100 hover:bg-gray-200' : 'border-gray-800 text-white'}`}
                        style={{ backgroundColor: bgColor }}
                        title={`Ghế ${row}${col}`}
                      >
                        {!isCorridor && `${row}${col}`}
                      </button>
                    );
                  })}
                </div>
                
                {/* Tên hàng phải (Bấm để tô cả hàng) */}
                <button 
                  onClick={() => handleRowClick(row)} 
                  className="w-8 h-8 font-bold text-gray-500 text-center hover:bg-gray-300 rounded cursor-pointer transition-colors" 
                  title={`Tô toàn bộ hàng ${row}`}
                >
                  {row}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300">Hủy bỏ</button>
          <button onClick={handleSave} disabled={isLoading} className="px-6 py-2 flex items-center gap-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-red-400">
            <Save size={20} /> {isLoading ? 'Đang lưu...' : 'Lưu Sơ Đồ Ghế'}
          </button>
        </div>

      </div>
    </div>
  );
}