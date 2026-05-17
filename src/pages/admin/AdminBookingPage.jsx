import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, QrCode, Ticket, MapPin, Calendar, Clock, User, Phone } from 'lucide-react';
import { bookingApi } from '../../api/bookingApi';
import toast from 'react-hot-toast';

export default function AdminBookingPage() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States cho Bộ lọc & Tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cinemaFilter, setCinemaFilter] = useState('ALL');
  const [cinemaList, setCinemaList] = useState([]);

  // States cho Modal Chi tiết
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Gọi API lấy danh sách vé
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getAllBookingsAdmin();
      const data = response.data || [];
      setBookings(data);
      setFilteredBookings(data);
      
      // Tự động trích xuất danh sách các Cụm rạp từ dữ liệu vé để làm bộ lọc
      const uniqueCinemas = [...new Set(data.map(b => b.cinemaName))];
      setCinemaList(uniqueCinemas.filter(Boolean)); // Lọc bỏ giá trị null
    } catch (error) {
      toast.error('Không thể tải danh sách vé!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Logic Lọc & Tìm kiếm động
  useEffect(() => {
    let result = bookings;

    // 1. Lọc theo chữ tìm kiếm (Mã vé, Tên KH, SĐT)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(b => 
        (b.bookingCode && b.bookingCode.toLowerCase().includes(term)) ||
        (b.customerName && b.customerName.toLowerCase().includes(term)) ||
        (b.customerPhone && b.customerPhone.includes(term))
      );
    }

    // 2. Lọc theo Trạng thái
    if (statusFilter !== 'ALL') {
      result = result.filter(b => b.status === statusFilter);
    }

    // 3. Lọc theo Cụm rạp
    if (cinemaFilter !== 'ALL') {
      result = result.filter(b => b.cinemaName === cinemaFilter);
    }

    setFilteredBookings(result);
  }, [searchTerm, statusFilter, cinemaFilter, bookings]);

  // Hàm định dạng tiền tệ VNĐ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Render màu sắc cho Badge Trạng thái
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PAID': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Đã thanh toán</span>;
      case 'CHECKED_IN': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Đã soát vé</span>;
      case 'PENDING': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Chờ thanh toán</span>;
      case 'CANCELLED': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Đã hủy</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  // Mở Modal xem chi tiết
  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  // Hàm xử lý khi bấm nút Xác nhận soát vé
  const handleCheckIn = async (bookingCode) => {
    // Hỏi lại cho chắc chắn tránh nhân viên bấm nhầm
    if (!window.confirm(`Bạn có chắc chắn muốn soát vé mã ${bookingCode} không?`)) return;

    try {
      await bookingApi.checkInTicket(bookingCode);
      toast.success('Xác nhận soát vé thành công!');
      setIsModalOpen(false); // Đóng modal
      fetchBookings(); // Tải lại bảng dữ liệu để cập nhật màu sắc huy hiệu
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi soát vé!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Quản lý Đơn vé</h2>
          <p className="text-gray-500 mt-1">Quản lý đặt vé, soát vé và lịch sử giao dịch</p>
        </div>
        <button onClick={fetchBookings} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
          Làm mới dữ liệu
        </button>
      </div>

      {/* Thanh Công cụ: Tìm kiếm & Lọc */}
      <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col md:flex-row gap-4">
        {/* Tìm kiếm */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm theo Mã vé, Tên KH, SĐT..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Lọc Trạng thái */}
        <div className="w-full md:w-48 relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="CHECKED_IN">Đã soát vé</option>
            <option value="PENDING">Chờ thanh toán</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        {/* Lọc Cụm Rạp */}
        <div className="w-full md:w-64 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <select 
            value={cinemaFilter}
            onChange={(e) => setCinemaFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả Cụm rạp</option>
            {cinemaList.map((cinema, idx) => (
              <option key={idx} value={cinema}>{cinema}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bảng Dữ Liệu */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold">Mã vé</th>
                <th className="p-4 font-semibold">Khách hàng</th>
                <th className="p-4 font-semibold">Phim & Suất chiếu</th>
                <th className="p-4 font-semibold">Rạp & Ghế</th>
                <th className="p-4 font-semibold">Tổng tiền</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="text-center p-8 text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan="7" className="text-center p-8 text-gray-500">Không tìm thấy đơn vé nào!</td></tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-blue-600">{booking.bookingCode}</td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{booking.customerName}</div>
                      <div className="text-sm text-gray-500">{booking.customerPhone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800 truncate max-w-[200px]" title={booking.movieTitle}>{booking.movieTitle}</div>
                      <div className="text-sm text-gray-500">{booking.showTime}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{booking.cinemaName}</div>
                      <div className="text-sm text-gray-500">Phòng: {booking.hallName} | Ghế: <span className="font-bold text-red-500">{booking.seatNames}</span></div>
                    </td>
                    <td className="p-4 font-bold text-gray-800">{formatCurrency(booking.finalAmount)}</td>
                    <td className="p-4">{renderStatusBadge(booking.status)}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleViewDetail(booking)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                        title="Xem chi tiết"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Chi Tiết Vé & QR Code */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in-up">
            {/* Modal Header */}
            <div className="bg-red-600 p-4 flex justify-between items-center text-white">
              <h3 className="text-xl font-bold flex items-center gap-2"><Ticket size={24}/> Chi tiết Đơn vé</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-gray-200 transition"><XCircle size={28} /></button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 flex flex-col md:flex-row gap-6">
              {/* Cột trái: QR Code */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center border-r border-gray-100 pr-0 md:pr-6">
                <div className="w-48 h-48 bg-gray-100 rounded-lg p-2 flex items-center justify-center border-2 border-dashed border-gray-300">
                  {selectedBooking.qrCodeUrl ? (
                    <img src={selectedBooking.qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <QrCode size={48} className="mx-auto mb-2 opacity-50" />
                      <span className="text-sm">Chưa có mã QR</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 uppercase tracking-widest">MÃ VÉ</p>
                  <p className="text-2xl font-black text-gray-900 tracking-wider">{selectedBooking.bookingCode}</p>
                </div>
                <div className="mt-4 w-full">
                  {renderStatusBadge(selectedBooking.status)}
                </div>
              </div>

              {/* Cột phải: Thông tin text */}
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-800 leading-tight">{selectedBooking.movieTitle}</h4>
                  <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm">
                    <MapPin size={16} /> <span>{selectedBooking.cinemaName} ({selectedBooking.hallName})</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 mt-1 text-sm">
                    <Clock size={16} /> <span>{selectedBooking.showTime}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600"><User size={18}/> Khách hàng:</span>
                    <span className="font-semibold text-gray-800">{selectedBooking.customerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600"><Phone size={18}/> Điện thoại:</span>
                    <span className="font-semibold text-gray-800">{selectedBooking.customerPhone}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-600">Ghế ngồi:</span>
                    <span className="font-bold text-red-600 text-lg">{selectedBooking.seatNames}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-600">Tổng thanh toán:</span>
                    <span className="font-bold text-gray-900 text-xl">{formatCurrency(selectedBooking.finalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                Đóng
              </button>
              {selectedBooking.status === 'PAID' && (
                <button 
                  onClick={() => handleCheckIn(selectedBooking.bookingCode)}
                  className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <CheckCircle size={20} /> Xác nhận Soát vé (Check-in)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}