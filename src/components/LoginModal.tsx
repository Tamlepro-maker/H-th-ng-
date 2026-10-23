import React, { useState } from 'react';
import { X, Lock, User, KeyRound, ShieldCheck, Wrench, CheckCircle } from 'lucide-react';
import { UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, pass: string) => { success: boolean; error?: string };
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('CD01');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = onLogin(username, password);
    if (!res.success) {
      setError(res.error || 'Đăng nhập không thành công');
    } else {
      onClose();
    }
  };

  const handleQuickFill = (user: string, pass: string = '123456') => {
    setUsername(user);
    setPassword(pass);
    setError(null);
    const res = onLogin(user, pass);
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Đăng nhập tài khoản</h3>
            <p className="text-[11px] text-slate-500">Chuyển đổi vai trò Cư dân - BQL - KTV</p>
          </div>
        </div>

        {error && (
          <div className="my-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tài khoản</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="VD: CD01, BQL01, KTV01"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mặc định: 123456"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Đăng Nhập
          </button>
        </form>

        {/* Quick 1-tap test credentials */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 max-h-56 overflow-y-auto">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Tài khoản thử nghiệm nhanh (MK: 123456):</p>
          <div className="space-y-1">
            <div className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider px-1">Ban Quản Lý (BQL):</div>
            <button
              type="button"
              onClick={() => handleQuickFill('BQL01', '123456')}
              className="w-full flex items-center justify-between p-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-left transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-bold text-slate-900">BQL01: Trần Ban Quản Lý (Tuấn)</div>
              <span className="text-[10px] text-indigo-600 font-bold">Chọn →</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('BQL02', '123456')}
              className="w-full flex items-center justify-between p-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-left transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-bold text-slate-900">BQL02: Nguyễn Thị Mai (Vận hành)</div>
              <span className="text-[10px] text-indigo-600 font-bold">Chọn →</span>
            </button>

            <div className="text-[9px] font-bold text-amber-700 uppercase tracking-wider px-1 pt-1">Kỹ Thuật Viên (KTV):</div>
            <button
              type="button"
              onClick={() => handleQuickFill('KTV01', '123456')}
              className="w-full flex items-center justify-between p-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 text-left transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-bold text-slate-900">KTV01: Lê Kỹ Thuật (Đội MEP)</div>
              <span className="text-[10px] text-amber-700 font-bold">Chọn →</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('KTV02', '123456')}
              className="w-full flex items-center justify-between p-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 text-left transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-bold text-slate-900">KTV02: Vũ Đức Thịnh (Đội HVAC)</div>
              <span className="text-[10px] text-amber-700 font-bold">Chọn →</span>
            </button>

            <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wider px-1 pt-1">Cư Dân (CD):</div>
            <button
              type="button"
              onClick={() => handleQuickFill('CD01', '123456')}
              className="w-full flex items-center justify-between p-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-bold text-slate-900">CD01: Nguyễn Văn An (P.1204 - Aqua 1)</div>
              <span className="text-[10px] text-blue-600 font-bold">Chọn →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
