import { useState, useEffect } from 'react';
import { DollarSign, Ticket, Film, Users, TrendingUp, Building } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { dashboardApi } from '../../api/dashboardApi';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState('WEEK');
  const [loading, setLoading] = useState(true);

  // States chứa dữ liệu thật từ Backend
  const [stats, setStats] = useState({ totalRevenue: 0, totalTickets: 0, activeMovies: 0, totalUsers: 0 });
  const [topMovies, setTopMovies] = useState([]);
  const [topCinemas, setTopCinemas] = useState([]);
  const [revenueData, setRevenueData] = useState({ TODAY: [], WEEK: [], MONTH: [], YEAR: [] });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getOverview();
      const data = response.data; // Bóc tách từ ApiResponse

      setStats(data.stats);
      setTopMovies(data.topMovies);
      setTopCinemas(data.topCinemas);
      setRevenueData(data.revenueDataByTime);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu thống kê!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

  const StatCard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition hover:shadow-md">
      <div className={`p-5 rounded-full ${bg} ${color}`}>
        <Icon size={32} />
      </div>
      <div>
        <p className="text-lg font-semibold text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-gray-900">{value}</h3>
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex h-[80vh] items-center justify-center text-2xl font-bold text-gray-400">Đang tải dữ liệu Tổng quan...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-extrabold text-gray-800">Tổng quan Hệ thống</h2>
        <p className="text-xl text-gray-500 mt-2">Theo dõi doanh thu và hoạt động kinh doanh của cụm rạp</p>
      </div>

      {/* 4 Thẻ Thống Kê Nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Tổng Doanh Thu" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} color="text-green-600" bg="bg-green-100" />
        <StatCard title="Vé Đã Bán" value={`${stats.totalTickets} vé`} icon={Ticket} color="text-blue-600" bg="bg-blue-100" />
        <StatCard title="Phim Đang Chiếu" value={`${stats.activeMovies} phim`} icon={Film} color="text-purple-600" bg="bg-purple-100" />
        <StatCard title="Khách Hàng" value={`${stats.totalUsers} người`} icon={Users} color="text-orange-600" bg="bg-orange-100" />
      </div>

      {/* Biểu đồ Doanh thu */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp size={28} className="text-green-500"/> Doanh thu theo thời gian
          </h3>
          
          <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
            {[
              { key: 'TODAY', label: 'Hôm nay' },
              { key: 'WEEK', label: 'Tuần' },
              { key: 'MONTH', label: 'Tháng' },
              { key: 'YEAR', label: 'Năm' }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setTimeRange(item.key)}
                className={`px-5 py-2 rounded-lg text-lg font-bold transition-all ${
                  timeRange === item.key 
                    ? 'bg-white text-blue-600 shadow-md' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData[timeRange] || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 14, fontWeight: 600}} dy={10} />
              <YAxis 
                axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 14, fontWeight: 600}} dx={-10}
                tickFormatter={(value) => value >= 1000000 ? `${value / 1000000}M` : `${value / 1000}K`}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={5} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 10 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Phim & Top Rạp */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Film size={28} className="text-blue-500"/> Top Phim Bán Chạy Nhất
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMovies} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#1f2937', fontSize: 15, fontWeight: 700}} width={140} />
                <Tooltip formatter={(value) => [`${value} vé`, "Đã bán"]} contentStyle={{ borderRadius: '8px', border: 'none' }}/>
                <Bar dataKey="tickets" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Building size={28} className="text-amber-500"/> Top Rạp Doanh Thu Cao
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCinemas} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(val) => `${val/1000000}M`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#1f2937', fontSize: 15, fontWeight: 700}} width={140} />
                <Tooltip formatter={(value) => [formatCurrency(value), "Doanh thu"]} contentStyle={{ borderRadius: '8px', border: 'none' }}/>
                <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}