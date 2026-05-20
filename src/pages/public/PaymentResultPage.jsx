// src/pages/public/PaymentResultPage.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { paymentApi } from '../../api/paymentApi';

export default function PaymentResultPage() {
    const [params] = useSearchParams();
    const navigate  = useNavigate();
    const [status, setStatus] = useState('loading'); // loading | success | failed

    useEffect(() => {
        const check = async () => {
            // Lấy resultCode MoMo gửi về trong URL
            const resultCode  = params.get('resultCode');
            const orderId     = params.get('orderId') || '';
            // orderId có dạng bookingCode_timestamp
            const bookingCode = orderId.includes('_')
                ? orderId.substring(0, orderId.lastIndexOf('_'))
                : orderId;

            if (resultCode === '0') {
                // Chờ 1-2s để IPN xử lý xong rồi kiểm tra lại
                await new Promise(r => setTimeout(r, 2000));
                try {
                    const res = await paymentApi.checkStatus(bookingCode);
                    setStatus(res.data === 'PAID' ? 'success' : 'failed');
                } catch {
                    setStatus(resultCode === '0' ? 'success' : 'failed');
                }
            } else {
                setStatus('failed');
            }
        };
        check();
    }, []);

    if (status === 'loading') return (
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-[#ae2070] border-t-transparent rounded-full animate-spin"/>
            <p className="text-white font-bold text-lg">Đang xác nhận thanh toán...</p>
            <p className="text-gray-500 text-sm">Vui lòng không tắt trang này</p>
        </div>
    );

    if (status === 'success') return (
        <div className="min-h-screen bg-dark flex items-center justify-center px-4">
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-10 max-w-md w-full text-center">
                <div className="text-7xl mb-4">🎉</div>
                <h1 className="text-3xl font-black text-green-400 mb-2">Thanh Toán Thành Công!</h1>
                <p className="text-gray-400 mb-8">Vé của bạn đã được xác nhận. Hẹn gặp bạn tại rạp!</p>
                <div className="bg-[#222] rounded-xl p-4 mb-8 border border-gray-700">
                    <p className="text-gray-500 text-sm">Mã đặt vé</p>
                    <p className="text-2xl font-mono font-black text-accent mt-1">
                        {params.get('orderId')?.split('_')[0]}
                    </p>
                </div>
                <Link to="/"
                    className="block w-full py-3 bg-primary hover:bg-red-700 text-white rounded-xl font-bold transition-colors">
                    Về Trang Chủ
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-dark flex items-center justify-center px-4">
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-10 max-w-md w-full text-center">
                <div className="text-7xl mb-4">❌</div>
                <h1 className="text-3xl font-black text-red-400 mb-2">Thanh Toán Thất Bại</h1>
                <p className="text-gray-400 mb-2">Giao dịch bị huỷ hoặc có lỗi xảy ra.</p>
                <p className="text-gray-600 text-sm mb-8">Ghế đã được giải phóng. Bạn có thể thử lại.</p>
                <Link to="/"
                    className="block w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-colors">
                    Về Trang Chủ
                </Link>
            </div>
        </div>
    );
}