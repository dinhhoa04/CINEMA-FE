import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer'; // Tí nữa mình tạo file này

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-dark text-text-light flex flex-col font-sans">
      <Navbar />
      
      {/* Bỏ class "container mx-auto p-4" ở đây để các trang con được phép tràn viền */}
      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}