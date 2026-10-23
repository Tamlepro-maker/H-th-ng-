import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  AlertTriangle, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Plus, 
  QrCode, 
  Calendar, 
  ChevronRight, 
  Inbox,
  UserCheck,
  Tag,
  Zap,
  Flame,
  Phone,
  Compass,
  LogOut,
  User,
  History,
  Building2,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { 
  MaintenanceTicket, 
  UserProfile, 
  PeriodicMaintenancePlan, 
  TicketStatus, 
  Priority, 
  PropertyScope,
  EquipmentItem,
  MaintenanceHistoryRecord
} from '../../types';
import { 
  AVAILABLE_TECHNICIANS, 
  SAMPLE_EQUIPMENTS, 
  SAMPLE_MAINTENANCE_HISTORY 
} from '../../mockData';
import { StatusBadge, PriorityBadge, ScopeBadge } from '../StatusBadge';
import { SlaBadge } from '../SlaBadge';

import { CreateMaintenancePlanModal } from './MaintenanceModule/CreateMaintenancePlanModal';
import { CreateEquipmentModal } from './MaintenanceModule/CreateEquipmentModal';
import { EquipmentQrModal } from './MaintenanceModule/EquipmentQrModal';
import { MaintenanceHistoryDetailModal } from './MaintenanceModule/MaintenanceHistoryDetailModal';
import { DeviceLookupView } from './MaintenanceModule/DeviceLookupView';
import { EquipmentCatalogView } from './MaintenanceModule/EquipmentCatalogView';
import { MaintenanceHistoryView } from './MaintenanceModule/MaintenanceHistoryView';

interface ManagementViewProps {
  currentUser: UserProfile;
  tickets: MaintenanceTicket[];
  periodicPlans: PeriodicMaintenancePlan[];
  equipments?: EquipmentItem[];
  maintenanceHistory?: MaintenanceHistoryRecord[];
  onCreatePeriodicPlan?: (plan: Omit<PeriodicMaintenancePlan, 'id'>) => void;
  onAddEquipment?: (equipment: Omit<EquipmentItem, 'id'>) => void;
  onSelectTicket: (ticket: MaintenanceTicket) => void;
  onOpenClassifyModal: (ticket: MaintenanceTicket) => void;
  onOpenAssignModal: (ticket: MaintenanceTicket) => void;
  onOpenAcceptanceModal: (ticket: MaintenanceTicket) => void;
  onOpenVerifyComplaintModal: (ticket: MaintenanceTicket) => void;
  onOpenSwitchAccount: () => void;
  onLogout: () => void;
}

export const ManagementView: React.FC<ManagementViewProps> = ({
  currentUser,
  tickets,
  periodicPlans,
  equipments,
  maintenanceHistory,
  onCreatePeriodicPlan,
  onAddEquipment,
  onSelectTicket,
  onOpenClassifyModal,
  onOpenAssignModal,
  onOpenAcceptanceModal,
  onOpenVerifyComplaintModal,
  onOpenSwitchAccount,
  onLogout,
}) => {
  // Bottom Tab Bar Menu Modules: Điều Phối, Kĩ Thuật, Bảo Trì, SLA
  const [activeModule, setActiveModule] = useState<'DIEU_PHOI' | 'KI_THUAT' | 'BAO_TRI' | 'SLA'>('DIEU_PHOI');

  // Sub-tabs for "Bảo Trì" (Maintenance): PLANS, EQUIPMENTS, HISTORY, LOOKUP
  const [maintenanceSubTab, setMaintenanceSubTab] = useState<'PLANS' | 'EQUIPMENTS' | 'HISTORY' | 'LOOKUP'>('PLANS');
  
  // Maintenance Modal states
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [preselectedEquipmentCode, setPreselectedEquipmentCode] = useState<string | undefined>(undefined);
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);
  const [activeQrEquipment, setActiveQrEquipment] = useState<EquipmentItem | null>(null);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<MaintenanceHistoryRecord | null>(null);

  // Fallbacks if not provided
  const effectiveEquipments = useMemo(() => equipments || SAMPLE_EQUIPMENTS, [equipments]);
  const effectiveHistory = useMemo(() => maintenanceHistory || SAMPLE_MAINTENANCE_HISTORY, [maintenanceHistory]);

  // Sub-tabs for "Điều Phối": ALL, PENDING, IN_PROGRESS, COMPLAINTS, INSPECTION, HISTORY
  const [dispatchTab, setDispatchTab] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLAINTS' | 'INSPECTION' | 'HISTORY'>('ALL');
  
  // Filters for Điều Phối
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'P1' | 'P2' | 'P3'>('ALL');
  const [scopeFilter, setScopeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Top metric counters
  const pendingCount = tickets.filter((t) => t.status === 'CHO_DUYET').length;
  const inProgressCount = tickets.filter((t) => t.status === 'DANG_XU_LY' || t.status === 'YEU_CAU_LAM_LAI').length;
  const complaintCount = tickets.filter((t) => t.status === 'CHO_XAC_MINH_KHIEU_NAI').length;
  const inspectionCount = tickets.filter((t) => t.status === 'CHO_NGHIEM_THU').length;
  const closedCount = tickets.filter((t) => t.status === 'DA_NGHIEM_THU').length;

  // SLA calculations
  const nowMs = Date.now();
  const p1EmergencyTickets = tickets.filter((t) => t.priority === 'P1' && t.status !== 'DA_NGHIEM_THU');
  
  const nearDueTickets = tickets.filter((t) => {
    if (t.status === 'DA_NGHIEM_THU') return false;
    const diffMs = new Date(t.slaDeadline).getTime() - nowMs;
    return diffMs > 0 && diffMs <= 30 * 60 * 1000;
  });

  const overdueTickets = tickets.filter((t) => {
    if (t.status === 'DA_NGHIEM_THU') return false;
    const diffMs = new Date(t.slaDeadline).getTime() - nowMs;
    return diffMs <= 0;
  });

  // Filtered tickets in "Điều Phối"
  const dispatchTickets = useMemo(() => {
    let list: MaintenanceTicket[] = [];
    if (dispatchTab === 'ALL') {
      list = statusFilter === 'ALL'
        ? [...tickets]
        : tickets.filter((t) => t.status === statusFilter);
    } else if (dispatchTab === 'PENDING') {
      list = tickets.filter((t) => t.status === 'CHO_DUYET');
    } else if (dispatchTab === 'IN_PROGRESS') {
      list = tickets.filter((t) => t.status === 'DANG_XU_LY' || t.status === 'YEU_CAU_LAM_LAI');
    } else if (dispatchTab === 'COMPLAINTS') {
      list = tickets.filter((t) => t.status === 'CHO_XAC_MINH_KHIEU_NAI');
    } else if (dispatchTab === 'INSPECTION') {
      list = tickets.filter((t) => t.status === 'CHO_NGHIEM_THU');
    } else if (dispatchTab === 'HISTORY') {
      list = tickets.filter((t) => t.status === 'DA_NGHIEM_THU');
    }

    return list.filter((t) => {
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
      if (scopeFilter !== 'ALL' && t.scope !== scopeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchCode = t.code.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
        const matchLoc = t.location.toLowerCase().includes(q);
        const matchResident = t.residentName.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchLoc && !matchResident) return false;
      }
      return true;
    });
  }, [tickets, dispatchTab, statusFilter, priorityFilter, scopeFilter, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 text-slate-900 text-left">
      
      {/* Top Header: BQL Profile & Explicit Logout / Switch Account Button */}
      <div className="px-3.5 pt-2.5 pb-2 bg-white border-b border-slate-200/90 shadow-2xs shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-indigo-700 uppercase font-bold tracking-wider">Ban Quản Lý</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold font-mono">{currentUser.username}</span>
              </div>
              <h2 className="text-xs font-bold text-slate-900">{currentUser.name} • {tickets.length} Phiếu</h2>
            </div>
          </div>

          {/* User requested: BQL can log out or switch account between BQLs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenSwitchAccount}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
              title="Đổi giữa các tài khoản Ban Quản Lý (BQL01, BQL02, BQL03)"
            >
              <User className="w-3 h-3 text-indigo-600" />
              <span>Đổi tài khoản</span>
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
              title="Đăng xuất về Cư dân"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT VIEWPORT (SCROLLS ABOVE BOTTOM TAB BAR) */}
      <div className="flex-1 overflow-y-auto">
        
        {/* MODULE 1: ĐIỀU PHỐI (DISPATCH) */}
        {activeModule === 'DIEU_PHOI' && (
          <div className="flex flex-col min-h-full">
            
            {/* Sub-tabs: Tất cả các phiếu, Chờ phân loại, Đang xử lý, Chờ nghiệm thu, Lịch sử */}
            <div className="px-2 pt-2 bg-white border-b border-slate-200 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 text-xs">
              <button
                onClick={() => setDispatchTab('ALL')}
                className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  dispatchTab === 'ALL'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Tất cả các phiếu</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  dispatchTab === 'ALL' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tickets.length}
                </span>
              </button>

              <button
                onClick={() => setDispatchTab('PENDING')}
                className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  dispatchTab === 'PENDING'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Chờ phân loại</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  dispatchTab === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {pendingCount}
                </span>
              </button>

              <button
                onClick={() => setDispatchTab('IN_PROGRESS')}
                className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  dispatchTab === 'IN_PROGRESS'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Đang xử lý</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  dispatchTab === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {inProgressCount}
                </span>
              </button>

              <button
                onClick={() => setDispatchTab('COMPLAINTS')}
                className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  dispatchTab === 'COMPLAINTS'
                    ? 'border-rose-600 text-rose-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Xác minh khiếu nại</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  complaintCount > 0
                    ? 'bg-rose-500 text-white animate-pulse'
                    : dispatchTab === 'COMPLAINTS'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {complaintCount}
                </span>
              </button>

              <button
                onClick={() => setDispatchTab('INSPECTION')}
                className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  dispatchTab === 'INSPECTION'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Chờ nghiệm thu</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  dispatchTab === 'INSPECTION' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {inspectionCount}
                </span>
              </button>

              <button
                onClick={() => setDispatchTab('HISTORY')}
                className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  dispatchTab === 'HISTORY'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Lịch sử ({closedCount})</span>
              </button>
            </div>

            {/* Priority and Search Filter Toolbar */}
            <div className="p-2.5 bg-slate-100/80 border-b border-slate-200 space-y-1.5 shrink-0 text-xs">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm mã phiếu (#PA-01), căn hộ, vị trí..."
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              {/* Priority and Scope Filters */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar text-[10px]">
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-slate-500 font-semibold mr-0.5">Ưu tiên:</span>
                  
                  <button
                    onClick={() => setPriorityFilter('ALL')}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer font-semibold ${
                      priorityFilter === 'ALL'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    Tất cả
                  </button>

                  <button
                    onClick={() => setPriorityFilter('P1')}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer font-bold ${
                      priorityFilter === 'P1'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    P1 Khẩn cấp
                  </button>

                  <button
                    onClick={() => setPriorityFilter('P2')}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer font-semibold ${
                      priorityFilter === 'P2'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    P2 Cần sớm
                  </button>

                  <button
                    onClick={() => setPriorityFilter('P3')}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer font-semibold ${
                      priorityFilter === 'P3'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                    }`}
                  >
                    P3 Tiêu chuẩn
                  </button>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Status filter if on ALL tab */}
                  {dispatchTab === 'ALL' && (
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-white border border-slate-200 text-[10px] text-slate-700 rounded-md px-1.5 py-0.5 focus:outline-none shrink-0"
                    >
                      <option value="ALL">Mọi trạng thái</option>
                      <option value="CHO_DUYET">Chờ phân loại</option>
                      <option value="DANG_XU_LY">Đang xử lý</option>
                      <option value="CHO_NGHIEM_THU">Chờ nghiệm thu</option>
                      <option value="YEU_CAU_LAM_LAI">Yêu cầu làm lại</option>
                      <option value="DA_NGHIEM_THU">Đã nghiệm thu</option>
                    </select>
                  )}

                  {/* Scope filter */}
                  <select
                    value={scopeFilter}
                    onChange={(e) => setScopeFilter(e.target.value)}
                    className="bg-white border border-slate-200 text-[10px] text-slate-700 rounded-md px-1.5 py-0.5 focus:outline-none"
                  >
                    <option value="ALL">Mọi sở hữu</option>
                    <option value="SO_HUU_RIENG">Sở hữu riêng</option>
                    <option value="SO_HUU_CHUNG">Sở hữu chung</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ticket Cards List */}
            <div className="p-2.5 space-y-2.5 pb-20">
              {dispatchTickets.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 mx-auto flex items-center justify-center shadow-xs">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Không có phiếu nào trong mục này</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {dispatchTab === 'ALL'
                        ? 'Chưa có phiếu phản ánh nào trong hệ thống.'
                        : dispatchTab === 'PENDING'
                        ? 'Hiện không có phiếu chờ phân loại mới từ cư dân.'
                        : dispatchTab === 'IN_PROGRESS'
                        ? 'Không có phiếu đang được xử lý kỹ thuật.'
                        : dispatchTab === 'INSPECTION'
                        ? 'Không có phiếu chờ nghiệm thu.'
                        : 'Chưa có lịch sử phiếu đã đóng.'}
                    </p>
                  </div>
                </div>
              ) : (
                dispatchTickets.map((ticket) => {
                  const isPending = ticket.status === 'CHO_DUYET';
                  const isCommonInspection = ticket.status === 'CHO_NGHIEM_THU' && ticket.scope === 'SO_HUU_CHUNG';

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => onSelectTicket(ticket)}
                      className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 transition-all cursor-pointer group shadow-xs"
                    >
                      {/* Top Code, Priority, Scope, Status */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-extrabold text-indigo-700">
                            {ticket.id}
                          </span>
                          <PriorityBadge priority={ticket.priority} />
                          <ScopeBadge scope={ticket.scope} />
                        </div>
                        <StatusBadge status={ticket.status} size="sm" />
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {ticket.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {ticket.location} • Căn: <strong className="text-slate-700">{ticket.apartmentCode}</strong> ({ticket.residentName})
                      </p>

                      {ticket.technicalDept && (
                        <div className="mt-1 text-[10px] text-indigo-700 flex items-center gap-1 font-medium">
                          <span>🔧 Bộ phận:</span> <strong>{ticket.technicalDept}</strong>
                        </div>
                      )}

                      {/* SLA and Tech */}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[10px]">
                        <SlaBadge
                          deadline={ticket.slaDeadline}
                          priority={ticket.priority}
                          status={ticket.status}
                        />

                        {ticket.assignedTechnicianName ? (
                          <span className="text-slate-600 font-medium">
                            KTV: <strong className="text-amber-700 font-semibold">{ticket.assignedTechnicianName}</strong>
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold">Chưa giao KTV</span>
                        )}
                      </div>

                      {/* Phân loại sự cố & Giao KTV Actions */}
                      {isPending && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenClassifyModal(ticket);
                            }}
                            className="py-1.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Tag className="w-3 h-3 text-amber-600" />
                            <span>Phân Loại Ưu Tiên</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAssignModal(ticket);
                            }}
                            className="py-1.5 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Giao KTV →</span>
                          </button>
                        </div>
                      )}

                      {/* Common property inspection */}
                      {isCommonInspection && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-purple-700 font-semibold">
                            🏢 Tài sản chung cần BQL nghiệm thu:
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAcceptanceModal(ticket);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <span>Nghiệm Thu Ngay →</span>
                          </button>
                        </div>
                      )}

                      {/* Resident Complaint verification action */}
                      {ticket.status === 'CHO_XAC_MINH_KHIEU_NAI' && (
                        <div className="mt-2.5 pt-2 border-t border-rose-200 bg-rose-50/80 -mx-3 -mb-3 p-3 rounded-b-2xl">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-rose-800 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              Cư dân khiếu nại chưa đạt ({ticket.apartmentCode})
                            </span>
                            <span className="text-[9px] text-slate-500 font-medium">{ticket.residentName}</span>
                          </div>
                          <p className="text-[11px] text-slate-800 italic mb-2 line-clamp-2">
                            "{ticket.complaint?.reason || ticket.rejectionReason}"
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenVerifyComplaintModal(ticket);
                            }}
                            className="w-full py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Xác Minh Khiếu Nại & Điều Phối KTV →</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* MODULE 2: KĨ THUẬT (TECHNICIAN WORKFORCE) */}
        {activeModule === 'KI_THUAT' && (
          <div className="p-3 space-y-3 pb-20 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-600" /> Quản Lý Đội Ngũ Kỹ Thuật Viên
              </h4>
              <span className="text-[10px] text-emerald-700 font-semibold">● 3 KTV Đang Trực Ca</span>
            </div>

            <div className="space-y-2.5">
              {AVAILABLE_TECHNICIANS.map((tech) => {
                const activeCount = tickets.filter(
                  (t) => t.assignedTechnicianId === tech.id && t.status !== 'DA_NGHIEM_THU'
                ).length;

                return (
                  <div key={tech.id} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-amber-700">
                          {tech.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-bold text-slate-900 text-xs">{tech.name}</h5>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono font-bold">
                              {tech.id === 'usr_ktv01' ? 'KTV01' : 'KTV'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">{tech.specialty}</div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {tech.status}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] flex items-center justify-between">
                      <div>
                        <span className="text-slate-500">Số điện thoại:</span>{' '}
                        <strong className="text-slate-800 font-mono">{tech.phone}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Tải công việc:</span>{' '}
                        <strong className={activeCount > 2 ? 'text-rose-600 font-bold' : 'text-blue-700 font-bold'}>
                          {activeCount} việc đang phụ trách
                        </strong>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => alert(`Mô phỏng gọi liên lạc trực tiếp KTV ${tech.name}: ${tech.phone}`)}
                        className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>Gọi KTV</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveModule('DIEU_PHOI');
                          setDispatchTab('PENDING');
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Giao Việc Mới →</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Department Teams */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                Các Tổ Kỹ Thuật Chuyên Môn
              </h5>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>⚡ Tổ Cơ Điện & Nước (MEP)</span>
                  <span className="text-emerald-700 font-semibold">2 KTV sẵn sàng</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>❄️ Tổ Điện Lạnh & Thông Gió (HVAC)</span>
                  <span className="text-emerald-700 font-semibold">1 KTV sẵn sàng</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>🛗 Tổ Vận Hành Thang Máy</span>
                  <span className="text-slate-500">Đối tác ủy quyền</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>🧯 Tổ An Toàn & Thiết Bị PCCC</span>
                  <span className="text-emerald-700 font-semibold">Trực 24/7</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 3: BẢO TRÌ (PERIODIC MAINTENANCE, EQUIPMENT CATALOG, HISTORY & LOOKUP) */}
        {activeModule === 'BAO_TRI' && (
          <div className="flex flex-col min-h-full">
            
            {/* Top Sub-tabs Bar for BAO_TRI */}
            <div className="px-2 pt-2 bg-white border-b border-slate-200 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 text-xs">
              {/* Subtab 1: Kế hoạch bảo trì */}
              <button
                onClick={() => setMaintenanceSubTab('PLANS')}
                className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  maintenanceSubTab === 'PLANS'
                    ? 'border-cyan-600 text-cyan-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Kế hoạch bảo trì</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  maintenanceSubTab === 'PLANS' ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {periodicPlans.length}
                </span>
              </button>

              {/* Subtab 2: Danh mục thiết bị */}
              <button
                onClick={() => setMaintenanceSubTab('EQUIPMENTS')}
                className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  maintenanceSubTab === 'EQUIPMENTS'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Danh mục thiết bị</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  maintenanceSubTab === 'EQUIPMENTS' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {effectiveEquipments.length}
                </span>
              </button>

              {/* Subtab 3: Lịch sử bảo trì */}
              <button
                onClick={() => setMaintenanceSubTab('HISTORY')}
                className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  maintenanceSubTab === 'HISTORY'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Lịch sử bảo trì</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  maintenanceSubTab === 'HISTORY' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {effectiveHistory.length}
                </span>
              </button>

              {/* Subtab 4: Tra cứu theo mã TB */}
              <button
                onClick={() => setMaintenanceSubTab('LOOKUP')}
                className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  maintenanceSubTab === 'LOOKUP'
                    ? 'border-cyan-600 text-cyan-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-cyan-600" />
                <span>Tra cứu mã TB</span>
              </button>
            </div>

            {/* Sub-view Content */}
            <div className="p-3 space-y-3 pb-20 text-xs text-slate-700">
              
              {/* SUB-VIEW 1: PLANS */}
              {maintenanceSubTab === 'PLANS' && (
                <div className="space-y-3">
                  {/* Top Bar with "+ Lập Kế Hoạch Mới" */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-cyan-600" /> Kế Hoạch Bảo Trì Định Kỳ ({periodicPlans.length})
                      </h4>
                      <span className="text-[10px] text-slate-500">Chu kỳ tự động & phân công KTV trực ca</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPreselectedEquipmentCode(undefined);
                        setIsCreatePlanOpen(true);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Lập Kế Hoạch</span>
                    </button>
                  </div>

                  {/* Summary Metric Chips */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <div className="text-slate-500">Tổng kế hoạch</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">{periodicPlans.length}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs">
                      <div className="text-amber-800 font-semibold">⚠️ Đến hạn</div>
                      <div className="text-sm font-extrabold text-amber-900 mt-0.5">
                        {periodicPlans.filter(p => p.status === 'DEN_HAN').length}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs">
                      <div className="text-emerald-800 font-semibold">✓ Đã bảo dưỡng</div>
                      <div className="text-sm font-extrabold text-emerald-900 mt-0.5">
                        {periodicPlans.filter(p => p.status === 'DA_HOAN_THANH').length}
                      </div>
                    </div>
                  </div>

                  {/* Plans list */}
                  <div className="space-y-2.5">
                    {periodicPlans.map((plan) => {
                      const matchedEq = effectiveEquipments.find(e => e.code === plan.equipmentCode);

                      return (
                        <div key={plan.id} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                setMaintenanceSubTab('LOOKUP');
                              }}
                              className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-2 py-0.5 rounded-md border border-cyan-200 cursor-pointer flex items-center gap-1"
                              title="Bấm để tra cứu hồ sơ thiết bị này"
                            >
                              <span>{plan.equipmentCode}</span>
                              <ChevronRight className="w-3 h-3 text-cyan-500" />
                            </button>

                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                plan.status === 'DA_HOAN_THANH'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                              }`}
                            >
                              {plan.status === 'DA_HOAN_THANH' ? '✓ Đã hoàn tất đợt này' : '⚠️ Đến hạn kiểm tra'}
                            </span>
                          </div>

                          <h5 className="font-bold text-slate-900 text-xs">{plan.equipmentName}</h5>
                          <p className="text-[11px] text-slate-500">Vị trí: <strong className="text-slate-700">{plan.location}</strong></p>

                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Chu kỳ kiểm tra:</span>
                              <strong className="text-slate-700">{plan.cycle}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">KTV phụ trách:</span>
                              <strong className="text-amber-700">{plan.assignedKtvName}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Hạn bảo dưỡng tiếp theo:</span>
                              <span className="text-slate-900 font-mono font-semibold">{plan.nextDue}</span>
                            </div>
                          </div>

                          {/* Checklist preview */}
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">
                                Biểu mẫu checklist ({plan.checkList.length} hạng mục):
                              </span>
                              <span className="text-[9px] text-cyan-700 font-semibold">Tiêu chuẩn kỹ thuật</span>
                            </div>
                            {plan.checkList.map((c, i) => (
                              <div key={i} className="text-[10px] flex items-center justify-between text-slate-600 py-0.5 border-b border-slate-100">
                                <span>• {c.title}</span>
                                <span className="text-slate-400 text-[9px] max-w-[45%] text-right truncate">{c.standard}</span>
                              </div>
                            ))}
                          </div>

                          {/* Quick Card Action Buttons */}
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                            {matchedEq && (
                              <button
                                type="button"
                                onClick={() => setActiveQrEquipment(matchedEq)}
                                className="flex-1 py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold flex items-center justify-center gap-1 border border-slate-200 cursor-pointer"
                              >
                                <QrCode className="w-3 h-3 text-cyan-600" />
                                <span>Xem mã QR</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setMaintenanceSubTab('LOOKUP');
                              }}
                              className="flex-1 py-1 px-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Search className="w-3 h-3 text-cyan-600" />
                              <span>Tra cứu thiết bị</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUB-VIEW 2: EQUIPMENTS CATALOG */}
              {maintenanceSubTab === 'EQUIPMENTS' && (
                <EquipmentCatalogView
                  equipments={effectiveEquipments}
                  onOpenAddEquipmentModal={() => setIsAddEquipmentOpen(true)}
                  onOpenCreatePlanForEquipment={(eqCode) => {
                    setPreselectedEquipmentCode(eqCode);
                    setIsCreatePlanOpen(true);
                  }}
                  onOpenQrModal={(eq) => setActiveQrEquipment(eq)}
                  onOpenLookupForEquipment={(eqCode) => {
                    setMaintenanceSubTab('LOOKUP');
                  }}
                />
              )}

              {/* SUB-VIEW 3: HISTORY */}
              {maintenanceSubTab === 'HISTORY' && (
                <MaintenanceHistoryView
                  historyRecords={effectiveHistory}
                  onSelectRecord={(rec) => setSelectedHistoryRecord(rec)}
                  onOpenLookupForEquipment={(eqCode) => {
                    setMaintenanceSubTab('LOOKUP');
                  }}
                />
              )}

              {/* SUB-VIEW 4: LOOKUP BY EQUIPMENT CODE */}
              {maintenanceSubTab === 'LOOKUP' && (
                <DeviceLookupView
                  equipments={effectiveEquipments}
                  periodicPlans={periodicPlans}
                  maintenanceHistory={effectiveHistory}
                  onOpenCreatePlanForEquipment={(eqCode) => {
                    setPreselectedEquipmentCode(eqCode);
                    setIsCreatePlanOpen(true);
                  }}
                  onOpenQrModal={(eq) => setActiveQrEquipment(eq)}
                  onSelectHistoryRecord={(rec) => setSelectedHistoryRecord(rec)}
                />
              )}

            </div>
          </div>
        )}

        {/* MODULE 4: SLA (SLA OPERATIONAL MONITOR & KPI ANALYTICS - BF-5) */}
        {activeModule === 'SLA' && (
          <div className="p-3 space-y-3 pb-20 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-600" /> Bảng Giám Sát SLA & Chỉ Số Vận Hành (BF-5)
              </h4>
              <span className="text-[10px] text-slate-400">Thời gian thực</span>
            </div>

            {/* 3 Main KPI Metrics Cards from SRS */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
                <div className="text-[10px] text-slate-500 font-medium">Tỷ lệ tuân thủ SLA</div>
                <div className="text-sm font-extrabold text-emerald-600 font-mono mt-1">97.4%</div>
                <div className="text-[8px] text-emerald-600/80 mt-0.5">Mục tiêu ≥ 95%</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
                <div className="text-[10px] text-slate-500 font-medium">MTTR trung bình</div>
                <div className="text-sm font-extrabold text-blue-600 font-mono mt-1">1.8h</div>
                <div className="text-[8px] text-blue-600/80 mt-0.5">Thời gian sửa chữa</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
                <div className="text-[10px] text-slate-500 font-medium">CSAT Cư dân</div>
                <div className="text-sm font-extrabold text-amber-600 font-mono mt-1">4.9/5 ⭐</div>
                <div className="text-[8px] text-amber-600/80 mt-0.5">Hài lòng dịch vụ</div>
              </div>
            </div>

            {/* Dedicated Section: P1 Khẩn Cấp (SLA 2h) */}
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-600" /> Giám sát sự cố khẩn cấp P1 ({p1EmergencyTickets.length})
                </span>
                <span className="text-[10px] text-rose-700 font-mono font-bold">SLA: 2 Giờ</span>
              </div>
              
              {p1EmergencyTickets.length > 0 ? (
                <div className="space-y-1.5">
                  {p1EmergencyTickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTicket(t)}
                      className="p-2 rounded-xl bg-white border border-rose-200 flex items-center justify-between cursor-pointer hover:bg-rose-50/50 shadow-2xs"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{t.id}: {t.title}</div>
                        <div className="text-[10px] text-slate-500">{t.location} • KTV: {t.assignedTechnicianName || 'Chưa gán'}</div>
                      </div>
                      <SlaBadge deadline={t.slaDeadline} priority={t.priority} status={t.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 text-center text-slate-500 text-[11px]">
                  ✓ Hiện không có sự cố khẩn cấp P1 nào đang mở.
                </div>
              )}
            </div>

            {/* Warning: Near-due & Overdue Tickets */}
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Phiếu cận hạn hoặc đã quá hạn ({nearDueTickets.length + overdueTickets.length})
                </span>
                <span className="text-[10px] text-amber-700 font-mono font-semibold">Cần đôn đốc</span>
              </div>

              {nearDueTickets.length + overdueTickets.length > 0 ? (
                <div className="space-y-1.5">
                  {[...overdueTickets, ...nearDueTickets].map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTicket(t)}
                      className="p-2 rounded-xl bg-white border border-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-50/50 shadow-2xs"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{t.id}: {t.title}</div>
                        <div className="text-[10px] text-slate-500">{t.location} • {t.assignedTechnicianName}</div>
                      </div>
                      <SlaBadge deadline={t.slaDeadline} priority={t.priority} status={t.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 text-center text-slate-500 text-[11px]">
                  ✓ Tất cả các phiếu đều đang trong ngưỡng thời gian an toàn.
                </div>
              )}
            </div>

            {/* SLA Rule Reference Table */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                Quy chuẩn cam kết thời hạn SLA tòa nhà
              </h5>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-rose-600 font-semibold">🔴 P1 - Khẩn cấp:</span>
                  <span className="text-slate-800 font-mono">Phản hồi 15p • Xử lý ≤ 2 giờ</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-amber-700 font-semibold">🟡 P2 - Cần sớm:</span>
                  <span className="text-slate-800 font-mono">Phản hồi 30p • Xử lý ≤ 6 giờ</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-blue-700 font-semibold">🔵 P3 - Tiêu chuẩn:</span>
                  <span className="text-slate-800 font-mono">Phản hồi 1h • Xử lý ≤ 24 giờ</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* USER REQUESTED: FUNCTIONAL MENU AT THE VERY BOTTOM (ĐIỀU PHỐI, KĨ THUẬT, BẢO TRÌ, SLA) */}
      <nav className="absolute inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-1.5 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-4 gap-1">
          {/* Tab 1: Điều Phối */}
          <button
            onClick={() => setActiveModule('DIEU_PHOI')}
            className={`py-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
              activeModule === 'DIEU_PHOI'
                ? 'text-indigo-600 font-bold'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <Compass className={`w-4 h-4 ${activeModule === 'DIEU_PHOI' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Điều phối</span>
            {(pendingCount > 0 || complaintCount > 0) && (
              <span className={`absolute top-0.5 right-4 w-3.5 h-3.5 rounded-full text-white text-[8px] font-black flex items-center justify-center ${
                complaintCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
              }`}>
                {pendingCount + complaintCount}
              </span>
            )}
          </button>

          {/* Tab 2: Kĩ Thuật */}
          <button
            onClick={() => setActiveModule('KI_THUAT')}
            className={`py-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeModule === 'KI_THUAT'
                ? 'text-amber-600 font-bold'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <Wrench className={`w-4 h-4 ${activeModule === 'KI_THUAT' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Kĩ thuật</span>
          </button>

          {/* Tab 3: Bảo Trì */}
          <button
            onClick={() => setActiveModule('BAO_TRI')}
            className={`py-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeModule === 'BAO_TRI'
                ? 'text-cyan-600 font-bold'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeModule === 'BAO_TRI' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Bảo trì</span>
          </button>

          {/* Tab 4: SLA */}
          <button
            onClick={() => setActiveModule('SLA')}
            className={`py-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
              activeModule === 'SLA'
                ? 'text-rose-600 font-bold'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <Clock className={`w-4 h-4 ${activeModule === 'SLA' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">SLA</span>
            {(p1EmergencyTickets.length > 0 || overdueTickets.length > 0) && (
              <span className="absolute top-0.5 right-4 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>
        </div>
      </nav>

      {/* Maintenance Modals */}
      {isCreatePlanOpen && (
        <CreateMaintenancePlanModal
          isOpen={isCreatePlanOpen}
          onClose={() => {
            setIsCreatePlanOpen(false);
            setPreselectedEquipmentCode(undefined);
          }}
          equipments={effectiveEquipments}
          preselectedEquipmentCode={preselectedEquipmentCode}
          onSubmit={(planData) => {
            if (onCreatePeriodicPlan) {
              onCreatePeriodicPlan(planData);
            }
          }}
        />
      )}

      {isAddEquipmentOpen && (
        <CreateEquipmentModal
          isOpen={isAddEquipmentOpen}
          onClose={() => setIsAddEquipmentOpen(false)}
          onSubmit={(eqData) => {
            if (onAddEquipment) {
              onAddEquipment(eqData);
            }
          }}
        />
      )}

      {activeQrEquipment && (
        <EquipmentQrModal
          isOpen={Boolean(activeQrEquipment)}
          onClose={() => setActiveQrEquipment(null)}
          equipment={activeQrEquipment}
        />
      )}

      {selectedHistoryRecord && (
        <MaintenanceHistoryDetailModal
          isOpen={Boolean(selectedHistoryRecord)}
          onClose={() => setSelectedHistoryRecord(null)}
          record={selectedHistoryRecord}
        />
      )}

    </div>
  );
};
