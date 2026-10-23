import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  Inbox, 
  Calendar, 
  Wrench, 
  HelpCircle,
  Sparkles,
  PhoneCall,
  User,
  LogOut,
  Layers,
  History,
  FileText,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { MaintenanceTicket, UserProfile, TicketStatus } from '../../types';
import { StatusBadge, PriorityBadge, ScopeBadge } from '../StatusBadge';
import { SlaBadge } from '../SlaBadge';

interface ResidentViewProps {
  currentUser: UserProfile;
  tickets: MaintenanceTicket[];
  onOpenCreateModal: () => void;
  onSelectTicket: (ticket: MaintenanceTicket) => void;
  onOpenAcceptance: (ticket: MaintenanceTicket) => void;
  onOpenSwitchAccount: () => void;
  onLogout: () => void;
}

export const ResidentView: React.FC<ResidentViewProps> = ({
  currentUser,
  tickets,
  onOpenCreateModal,
  onSelectTicket,
  onOpenAcceptance,
  onOpenSwitchAccount,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY' | 'GUIDE'>('ACTIVE');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | 'WEEK'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active tickets for this resident
  const activeTickets = useMemo(() => {
    return tickets.filter((t) => t.status !== 'DA_NGHIEM_THU');
  }, [tickets]);

  // Closed tickets for History tab
  const historyTickets = useMemo(() => {
    return tickets.filter((t) => t.status === 'DA_NGHIEM_THU');
  }, [tickets]);

  const currentList = activeTab === 'ACTIVE' ? activeTickets : historyTickets;

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return currentList.filter((t) => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;

      if (timeFilter !== 'ALL') {
        const ticketDate = new Date(t.createdAt);
        const now = new Date();
        if (timeFilter === 'TODAY') {
          const isToday = ticketDate.toDateString() === now.toDateString();
          if (!isToday) return false;
        } else if (timeFilter === 'WEEK') {
          const diffDays = (now.getTime() - ticketDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7) return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchCode = t.code.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
        const matchLoc = t.location.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchLoc) return false;
      }

      return true;
    });
  }, [currentList, statusFilter, timeFilter, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 text-slate-900 text-left relative">
      
      {/* Resident Header Profile Bar */}
      <div className="px-3.5 pt-2.5 pb-2.5 bg-white border-b border-slate-200/90 shadow-2xs shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-slate-500 font-medium">Căn hộ của bạn:</span>
              <strong className="text-xs text-blue-700 font-bold">{currentUser.apartmentCode || 'P.1204 - Aqua 1'}</strong>
            </div>
            <h2 className="text-xs font-bold text-slate-900 mt-0.5">{currentUser.name}</h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenSwitchAccount}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
              title="Đổi giữa các tài khoản Cư Dân (CD01, CD02)"
            >
              <User className="w-3 h-3 text-blue-600" />
              <span>Đổi tài khoản</span>
            </button>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo Phiếu</span>
            </button>
          </div>
        </div>

        {/* Quick Sub-tab Switcher */}
        <div className="grid grid-cols-3 gap-1 mt-2.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-center">
          <button
            onClick={() => {
              setActiveTab('ACTIVE');
              setStatusFilter('ALL');
            }}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
              activeTab === 'ACTIVE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Đang mở</span>
            {activeTickets.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                {activeTickets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('HISTORY');
              setStatusFilter('ALL');
            }}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
              activeTab === 'HISTORY'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Lịch sử</span>
            {historyTickets.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                {historyTickets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('GUIDE')}
            className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'GUIDE'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Quy chuẩn SLA</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'GUIDE' ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-20 text-xs text-slate-700">
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 text-blue-700">
              <Sparkles className="w-4 h-4 text-blue-600" /> Cam Kết Mức Độ Phục Vụ (SLA)
            </h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
                <strong className="text-rose-700">P1 - Khẩn cấp (2 giờ):</strong>
                <p className="text-slate-600 text-[10px] mt-0.5">Sự cố cháy nổ điện, ngập rò rỉ nước diện rộng, kẹt thang máy.</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                <strong className="text-amber-800">P2 - Cần sớm (6 giờ):</strong>
                <p className="text-slate-600 text-[10px] mt-0.5">Hỏng điều hòa, nghẹt bồn rửa, mất đèn khu vực sinh hoạt.</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                <strong className="text-blue-700">P3 - Tiêu chuẩn (24 giờ):</strong>
                <p className="text-slate-600 text-[10px] mt-0.5">Thấm ố nhẹ, bảo dưỡng ổ khóa, các nhu cầu kiểm tra định kỳ.</p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">Quy Trình Nghiệm Thu & Khiếu Nại</h4>
            <div className="space-y-2 text-[11px] text-slate-600">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-800">Thời hạn phản hồi 48 giờ:</strong>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Khi kỹ thuật viên hoàn tất công việc tại căn hộ, cư dân có 48 giờ để kiểm tra và xác nhận nghiệm thu hoặc gửi khiếu nại. Sau 48 giờ nếu không có phản hồi, hệ thống sẽ tự động đóng phiếu.
                </p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-800">Cơ chế xác minh khiếu nại:</strong>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Nếu kết quả sửa chữa chưa đạt, cư dân gửi khiếu nại kèm ảnh minh chứng. Ban Quản Lý sẽ xác minh thực tế và điều phối kỹ thuật viên xử lý khắc phục lại triệt để.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500">Hotline Kỹ Thuật 24/7</div>
              <div className="text-xs font-bold text-blue-700">1900 8888 (Phím 1)</div>
            </div>
            <button
              onClick={() => alert('Mô phỏng gọi tổng đài kỹ thuật tòa nhà: 1900 8888')}
              className="p-2 rounded-xl bg-blue-600 text-white cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Active or History Tickets */
        <div className="flex-1 flex flex-col overflow-hidden pb-14">
          
          {/* Toolbar */}
          <div className="p-2.5 bg-slate-100 border-b border-slate-200 space-y-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã phiếu (#PA-01), vị trí..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar text-[10px]">
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer font-semibold ${
                    statusFilter === 'ALL'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  Tất cả
                </button>

                {activeTab === 'ACTIVE' && (
                  <>
                    <button
                      onClick={() => setStatusFilter('CHO_DUYET')}
                      className={`px-2 py-1 rounded-md transition-colors cursor-pointer font-semibold ${
                        statusFilter === 'CHO_DUYET'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      Chờ duyệt
                    </button>
                    <button
                      onClick={() => setStatusFilter('DANG_XU_LY')}
                      className={`px-2 py-1 rounded-md transition-colors cursor-pointer font-semibold ${
                        statusFilter === 'DANG_XU_LY'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      Đang xử lý
                    </button>
                    <button
                      onClick={() => setStatusFilter('CHO_NGHIEM_THU')}
                      className={`px-2 py-1 rounded-md transition-colors cursor-pointer font-semibold ${
                        statusFilter === 'CHO_NGHIEM_THU'
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      Chờ nghiệm thu
                    </button>
                  </>
                )}
              </div>

              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="bg-white border border-slate-200 text-[10px] text-slate-700 rounded-md px-2 py-1 focus:outline-none"
              >
                <option value="ALL">Mọi lúc</option>
                <option value="TODAY">Hôm nay</option>
                <option value="WEEK">7 ngày qua</option>
              </select>
            </div>
          </div>

          {/* Ticket Cards List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {filteredTickets.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 mx-auto flex items-center justify-center shadow-xs">
                  <Inbox className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">
                    {activeTab === 'ACTIVE'
                      ? 'Không có phiếu sự cố đang mở'
                      : 'Chưa có lịch sử phiếu đã đóng'}
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                    {activeTab === 'ACTIVE'
                      ? 'Tất cả các phiếu sau khi được nghiệm thu đạt sẽ tự động chuyển vào mục "Lịch sử". Bấm nút bên dưới để tạo phiếu mới.'
                      : 'Các phiếu hoàn tất nghiệm thu sẽ lưu trữ tại đây.'}
                  </p>
                </div>
                {activeTab === 'ACTIVE' && (
                  <button
                    onClick={onOpenCreateModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo phản ánh sự cố ngay</span>
                  </button>
                )}
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isWaitingAcceptance = ticket.status === 'CHO_NGHIEM_THU';
                const isUnderComplaintReview = ticket.status === 'CHO_XAC_MINH_KHIEU_NAI';
                const isReWork = ticket.status === 'YEU_CAU_LAM_LAI';

                return (
                  <div
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className={`p-3 rounded-2xl bg-white border transition-all cursor-pointer hover:border-blue-400 relative group shadow-xs ${
                      isWaitingAcceptance
                        ? 'border-purple-300 ring-2 ring-purple-500/20'
                        : isUnderComplaintReview
                        ? 'border-rose-300 ring-2 ring-rose-500/20'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Header: Code, Priority, Scope, Status */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-extrabold text-blue-700">
                          {ticket.id}
                        </span>
                        <PriorityBadge priority={ticket.priority} />
                        <ScopeBadge scope={ticket.scope} />
                      </div>
                      <StatusBadge status={ticket.status} size="sm" />
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                      {ticket.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {ticket.location} • {ticket.description}
                    </p>

                    {/* Meta info */}
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[10px]">
                      <SlaBadge
                        deadline={ticket.slaDeadline}
                        priority={ticket.priority}
                        status={ticket.status}
                      />

                      {ticket.assignedTechnicianName ? (
                        <span className="text-slate-600 font-medium truncate max-w-[140px]">
                          KTV: <strong className="text-amber-800 font-semibold">{ticket.assignedTechnicianName}</strong>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Đang chờ BQL duyệt</span>
                      )}
                    </div>

                    {/* Highlight CTA for Acceptance with 48h Countdown reminder */}
                    {isWaitingAcceptance && (
                      <div className="mt-2.5 pt-2 border-t border-purple-100 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-purple-700 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                          <span>Chờ bạn nghiệm thu (Hạn 48h):</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAcceptance(ticket);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] shadow-xs cursor-pointer animate-pulse"
                        >
                          Nghiệm Thu Ngay →
                        </button>
                      </div>
                    )}

                    {/* Notice when Resident Complaint is under BQL verification */}
                    {isUnderComplaintReview && (
                      <div className="mt-2.5 pt-2 border-t border-rose-100 p-2 rounded-xl bg-rose-50/70 border border-rose-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Khiếu nại đang chờ Ban Quản Lý xác minh</span>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-0.5 italic">
                          "{ticket.complaint?.reason || ticket.rejectionReason}"
                        </p>
                      </div>
                    )}

                    {/* Notice when Ticket is being re-worked */}
                    {isReWork && (
                      <div className="mt-2.5 pt-2 border-t border-orange-100 flex items-center justify-between text-[10px]">
                        <span className="text-orange-800 font-bold flex items-center gap-1">
                          <RotateCcw className="w-3 h-3 text-orange-600" />
                          <span>KTV đang sửa chữa khắc phục lại</span>
                        </span>
                        <span className="text-slate-500">Phụ trách: {ticket.assignedTechnicianName}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SYNCHRONIZED BOTTOM NAVIGATION BAR FOR RESIDENT VIEW */}
      <nav className="absolute inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-1.5 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-4 gap-1">
          {/* Tab 1: Sự cố */}
          <button
            onClick={() => {
              setActiveTab('ACTIVE');
              setStatusFilter('ALL');
            }}
            className={`py-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'ACTIVE'
                ? 'text-blue-600 font-bold'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <Layers className={`w-4 h-4 ${activeTab === 'ACTIVE' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Sự cố</span>
            {activeTickets.length > 0 && (
              <span className="absolute top-0.5 right-4 w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] font-black flex items-center justify-center">
                {activeTickets.length}
              </span>
            )}
          </button>

          {/* Tab 2: Tạo phiếu */}
          <button
            onClick={onOpenCreateModal}
            className="py-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer text-slate-500 hover:text-blue-600 group"
          >
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-[10px] mt-0.5 text-blue-700 font-bold">Tạo mới</span>
          </button>

          {/* Tab 3: Lịch sử */}
          <button
            onClick={() => {
              setActiveTab('HISTORY');
              setStatusFilter('ALL');
            }}
            className={`py-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeTab === 'HISTORY'
                ? 'text-emerald-600 font-bold'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <History className={`w-4 h-4 ${activeTab === 'HISTORY' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Lịch sử</span>
          </button>

          {/* Tab 4: Quy chuẩn SLA */}
          <button
            onClick={() => setActiveTab('GUIDE')}
            className={`py-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeTab === 'GUIDE'
                ? 'text-purple-600 font-bold'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <Clock className={`w-4 h-4 ${activeTab === 'GUIDE' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Quy chuẩn</span>
          </button>
        </div>
      </nav>

    </div>
  );
};
