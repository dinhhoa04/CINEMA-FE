import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Admin Layout & Pages
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import AdminPromotionsPage from './pages/admin/AdminPromotionsPage';
import AdminFoodPage from './pages/admin/AdminFoodPage';
import AdminCinemaPage from './pages/admin/AdminCinemaPage';
import AdminMoviePage from './pages/admin/AdminMoviePage';
import AdminUserPage from './pages/admin/AdminUserPage';
import AdminBookingPage from './pages/admin/AdminBookingPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

// Layout & Pages
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import MovieDetailPage from './pages/public/MovieDetailPage';
import BookingPage from './pages/public/BookingPage'; 
import FoodSelectionPage from './pages/public/FoodSelectionPage';
import CheckoutPage from './pages/public/CheckoutPage';
import PaymentSuccessPage from './pages/public/PaymentSuccessPage';
import ProfilePage from './pages/public/ProfilePage';
import PromotionsPage from './pages/public/PromotionsPage';
import MoviesListPage from './pages/public/MoviesListPage';
import CinemaPage from './pages/public/CinemaPage';
import CinemaDetailPage from './pages/public/CinemaDetailPage';
import PromotionDetailPage from './pages/public/PromotionDetailPage';
import ProtectedRoute from './components/layout/ProtectedRoute'; // Thêm dòng này ở trên cùng


function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      
      <Routes>
        {/* Nhóm 1: Các trang CÓ Navbar và Footer (được bọc bởi MainLayout) */}
        <Route element={<MainLayout />}>
  <Route path="/" element={<HomePage />} />
  <Route path="/movies/:slug" element={<MovieDetailPage />} />
  <Route path="/booking/:showtimeId" element={<BookingPage />} />
  <Route path="/food" element={<FoodSelectionPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/payment-success" element={<PaymentSuccessPage />} />
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="/promotions" element={<PromotionsPage />} />
  <Route path="/movies" element={<MoviesListPage />} />
  <Route path="/cinemas" element={<CinemaPage />} />
  <Route path="/cinemas/:id" element={<CinemaDetailPage />} />
  <Route path="/promotions/:id" element={<PromotionDetailPage />} />
  
</Route>

        {/* Nhóm 2: Các trang KHÔNG CẦN Navbar (phủ kín màn hình) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Cách viết tạm thời để bypass qua lớp bảo vệ để check giao diện biểu đồ */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} /> {/* Hiện biểu đồ */}
          <Route path="promotions" element={<AdminPromotionsPage />} />
          <Route path="food" element={<AdminFoodPage />} />
          <Route path="cinemas" element={<AdminCinemaPage />} />
          <Route path="movies" element={<AdminMoviePage />} />
          <Route path="users" element={<AdminUserPage />} />
          <Route path="bookings" element={<AdminBookingPage />} />
        </Route>
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;