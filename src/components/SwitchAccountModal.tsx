import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Wrench, 
  User, 
  CheckCircle2, 
  LogOut, 
  KeyRound, 
  ChevronRight,
  ArrowRightLeft
} from 'lucide-react';
import { UserProfile } from '../types';
import { BQL_ACCOUNTS, KTV_ACCOUNTS, RESIDENT_ACCOUNTS } from '../mockData';

interface SwitchAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSwitchAccount: (username: string) => void;
  onLogin: (username: string, pass: string) => { success: boolean; error?: string };
  onLogout: () => void;
}

export const SwitchAccountModal: React.FC<SwitchAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchAccount,
  onLogin,
  onLogout,
}) => {
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [customUsername, setCustomUsername] = useState('');
  const [customPassword, setCustomPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Select list of accounts matching the current role
  let roleAccounts = RESIDENT_ACCOUNTS;
  let roleTitle = 'Đổi tài khoản Cư Dân';
  let roleSubtitle = 'Chuyển đổi giữa các tài khoản căn hộ cư dân';
  let roleBadgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
  let RoleIcon = User;
  let iconBg = 'bg-blue-50 text-blue-600 border-blue-200';

  if (currentUser.role === 'BQL') {
    roleAccounts = BQL_ACCOUNTS;
    roleTitle = 'Đổi tài khoản Ban Quản Lý';
    roleSubtitle = 'Chuyển đổi giữa các cán bộ & điều phối viên BQL';
    roleBadgeColor = 'bg-indigo-100 text-indigo-800 border-indigo-200';
    RoleIcon = ShieldCheck;
    iconBg = 'bg-indigo-50 text-indigo-600 border-indigo-200';
  } else if (currentUser.role === 'KTV') {
    roleAccounts = KTV_ACCOUNTS;
    roleTitle = 'Đổi tài khoản Kỹ Thuật Viên';
    roleSubtitle = 'Chuyển đổi giữa các kỹ thuật viên các tổ trực ca';
    roleBadgeColor = 'bg-amber-100 text-amber-900 border-amber-200';
    RoleIcon = Wrench;
    iconBg = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  const handleSelectAccount = (username: string) => {
    onSwitchAccount(username);
    onClose();
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!customUsername.trim()) {
      setError('Vui lòng nhập tên tài khoản');
      return;
    }
    const res = onLogin(customUsername.trim(), customPassword);
    if (!res.success) {
      setError(res.error || 'Đăng nhập không thành công');
    } else {
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 text-left">
      <div 
        className="w-full max-w-sm bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl relative animate-in fade-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center font-bold ${iconBg}`}>
            <RoleIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-900">{roleTitle}</h3>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border font-mono ${roleBadgeColor}`}>
                {currentUser.role}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">{roleSubtitle}</p>
          </div>
        </div>

        {error && (
          <div className="mb-2.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-medium">
            {error}
          </div>
        )}

        {/* List of accounts for this specific role */}
        <div className="space-y-2 mb-3">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Danh sách nhân sự cùng vai trò:
          </div>

          {roleAccounts.map((acc) => {
            const isActive = acc.username === currentUser.username;
            return (
              <div
                key={acc.id}
                onClick={() => !isActive && handleSelectAccount(acc.username)}
                className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                  isActive
                    ? 'bg-slate-50/90 border-indigo-400 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 cursor-pointer group'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                    />
                    {isActive && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                        <span className="w-1 h-1 rounded-full bg-white" />
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {acc.name}
                      </h4>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono font-bold">
                        {acc.username}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">
                      {acc.department || acc.apartmentCode || acc.phone}
                    </div>
                  </div>
                </div>

                <div>
                  {isActive ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Đang chọn</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Đổi sang →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Option to login with another custom username of this role */}
        <div className="border-t border-slate-100 pt-2 mb-2">
          {!showManualLogin ? (
            <button
              type="button"
              onClick={() => setShowManualLogin(true)}
              className="w-full text-center py-1 text-[10px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <KeyRound className="w-3 h-3" />
              <span>Đăng nhập mã nhân sự khác</span>
            </button>
          ) : (
            <form onSubmit={handleManualLogin} className="space-y-2 mt-1">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  placeholder={`Mã (VD: ${roleAccounts[0]?.username})`}
                  className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="password"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualLogin(false)}
                  className="flex-1 py-1 text-[10px] font-semibold text-slate-500 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs cursor-pointer"
                >
                  Đăng Nhập
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Bottom Actions: Log out */}
        <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">Mật khẩu mặc định: 123456</span>
          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex items-center gap-1 text-[10px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Đăng xuất</span>
          </button>
        </div>

      </div>
    </div>
  );
};
