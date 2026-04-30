import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Pages
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import MovieDetailPage from './pages/public/MovieDetailPage';
// BỔ SUNG DÒNG IMPORT NÀY:
import BookingPage from './pages/public/BookingPage'; 
import FoodSelectionPage from './pages/public/FoodSelectionPage';
import CheckoutPage from './pages/public/CheckoutPage';

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
</Route>

        {/* Nhóm 2: Các trang KHÔNG CẦN Navbar (phủ kín màn hình) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Đã xóa dòng MovieDetailPage bị dư thừa ở khu vực này */}
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;