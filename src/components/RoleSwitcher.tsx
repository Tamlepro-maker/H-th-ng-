import React from 'react';
import { UserRole, UserProfile, MaintenanceTicket, AppNotification } from '../types';
import { Users, User, ShieldCheck, Wrench, RefreshCw, Trash2, LogIn, LogOut, CheckCircle2 } from 'lucide-react';

interface RoleSwitcherProps {
  currentUser: UserProfile;
  tickets: MaintenanceTicket[];
  notifications: AppNotification[];
  onSwitchRole: (role: UserRole) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onResetData: () => void;
  onLoadSampleData: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentUser,
  tickets,
  notifications,
  onSwitchRole,
  onOpenLogin,
  onLogout,
  onResetData,
  onLoadSampleData,
}) => {
  // Count relevant tickets for badges
  const residentActiveCount = tickets.filter(t => t.residentId === 'usr_cd01' && t.status !== 'DA_NGHIEM_THU').length;
  const bqlPendingCount = tickets.filter(t => t.status === 'CHO_DUYET' || (t.scope === 'SO_HUU_CHUNG' && t.status === 'CHO_NGHIEM_THU')).length;
  const ktvAssignedCount = tickets.filter(t => t.assignedTechnicianId === 'usr_ktv01' && (t.status === 'DANG_XU_LY' || t.status === 'CHO_DUYET')).length;

  return (
    <header className="w-full max-w-4xl mx-auto px-3 py-2 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50 rounded-b-2xl shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: App Branding & Real-time Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-sm">
            BT
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-bold text-slate-100 tracking-tight">Hệ Thống Bảo Trì Tòa Nhà</h1>
              <span className="flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Realtime Sync
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Đăng nhập: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.username})
            </p>
          </div>
        </div>

        {/* Center: 3 Quick Role Switcher Buttons */}
        <div className="flex items-center p-1 bg-slate-950/90 rounded-xl border border-slate-800/90 shadow-inner">
          {/* Resident Button */}
          <button
            onClick={() => onSwitchRole('RESIDENT')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentUser.role === 'RESIDENT'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Chuyển sang vai trò Cư Dân"
          >
            <User className="w-3.5 h-3.5" />
            <span>Cư Dân</span>
            <span className="text-[10px] opacity-75 font-mono">
              {currentUser.role === 'RESIDENT' ? currentUser.username : 'CD'}
            </span>
            {residentActiveCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center">
                {residentActiveCount}
              </span>
            )}
          </button>

          {/* BQL Button */}
          <button
            onClick={() => onSwitchRole('BQL')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentUser.role === 'BQL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Chuyển sang vai trò Ban Quản Lý"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ban Quản Lý</span>
            <span className="text-[10px] opacity-75 font-mono">
              {currentUser.role === 'BQL' ? currentUser.username : 'BQL'}
            </span>
            {bqlPendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-bounce">
                {bqlPendingCount}
              </span>
            )}
          </button>

          {/* KTV Button */}
          <button
            onClick={() => onSwitchRole('KTV')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentUser.role === 'KTV'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Chuyển sang vai trò Kỹ Thuật Viên"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Kỹ Thuật Viên</span>
            <span className="text-[10px] opacity-75 font-mono">
              {currentUser.role === 'KTV' ? currentUser.username : 'KTV'}
            </span>
            {ktvAssignedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold flex items-center justify-center">
                {ktvAssignedCount}
              </span>
            )}
          </button>
        </div>

        {/* Right: Actions (Clean Slate, Sample Data, Auth) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onResetData}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-colors"
            title="Xóa trắng dữ liệu để thử nghiệm tạo phiếu mới từ đầu"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Làm trắng</span>
          </button>

          <button
            onClick={onLoadSampleData}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Nạp 2 phiếu mẫu để thử nghiệm nhanh"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Dữ liệu mẫu</span>
          </button>

          <button
            onClick={onOpenLogin}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-300 hover:text-white bg-blue-500/10 hover:bg-blue-600 border border-blue-500/30 transition-colors"
            title="Đăng nhập hoặc nhập mật khẩu kiểm tra"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đăng nhập</span>
          </button>
        </div>
      </div>
    </header>
  );
};
