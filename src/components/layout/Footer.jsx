import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-card py-12 mt-20 border-t border-gray-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Cột 1 */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4 tracking-tighter">Cine<span className="text-accent">Book</span></h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Hệ thống đặt vé xem phim trực tuyến hàng đầu Việt Nam. Trải nghiệm điện ảnh đỉnh cao ngay tại nhà.
            </p>
          </div>
          
          {/* Cột 2 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên kết</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="#" className="hover:text-primary transition-colors">Về chúng tôi</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Tuyển dụng</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Tin tức</Link></li>
            </ul>
          </div>

          {/* Cột 3 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><Link to="#" className="hover:text-primary transition-colors">Trợ giúp</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Câu hỏi thường gặp</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Cột 4 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kết nối</h4>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 rounded-full bg-dark flex items-center justify-center text-text-muted hover:text-white hover:bg-primary transition-all">
                FB
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-dark flex items-center justify-center text-text-muted hover:text-white hover:bg-primary transition-all">
                IG
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-dark flex items-center justify-center text-text-muted hover:text-white hover:bg-primary transition-all">
                YT
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-text-muted text-sm flex flex-col md:flex-row justify-between items-center">
          <p>© 2026 CineBook by Cao Đình Hòa. All rights reserved.</p>
          <div className="space-x-4 mt-4 md:mt-0">
            <Link to="#" className="hover:text-white">Điều khoản sử dụng</Link>
            <Link to="#" className="hover:text-white">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}