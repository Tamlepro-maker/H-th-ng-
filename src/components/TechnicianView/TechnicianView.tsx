import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Search, 
  Clock, 
  CheckCircle2, 
  Camera, 
  QrCode, 
  AlertTriangle, 
  Layers, 
  Inbox, 
  ArrowRight,
  ShieldAlert,
  Zap,
  Gauge,
  Thermometer,
  LogOut,
  User,
  History
} from 'lucide-react';
import { MaintenanceTicket, UserProfile, PeriodicMaintenancePlan, TicketMedia } from '../../types';
import { StatusBadge, PriorityBadge, ScopeBadge } from '../StatusBadge';
import { SlaBadge } from '../SlaBadge';

interface TechnicianViewProps {
  currentUser: UserProfile;
  tickets: MaintenanceTicket[];
  periodicPlans: PeriodicMaintenancePlan[];
  onSelectTicket: (ticket: MaintenanceTicket) => void;
  onOpenKtvAction: (ticket: MaintenanceTicket) => void;
  onCompleteMaintenance: (planId: string, values: { current: number; pressure: number; temp: number }, photo: TicketMedia) => void;
  onOpenSwitchAccount: () => void;
  onLogout: () => void;
}

export const TechnicianView: React.FC<TechnicianViewProps> = ({
  currentUser,
  tickets,
  periodicPlans,
  onSelectTicket,
  onOpenKtvAction,
  onCompleteMaintenance,
  onOpenSwitchAccount,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'NEW' | 'WORKING' | 'SUBMITTED' | 'HISTORY' | 'QR_MAINTENANCE'>('NEW');
  const [searchQuery, setSearchQuery] = useState('');

  // Maintenance QR Modal simulation
  const [activeQrPlan, setActiveQrPlan] = useState<PeriodicMaintenancePlan | null>(null);
  const [measCurrent, setMeasCurrent] = useState('21.5');
  const [measPressure, setMeasPressure] = useState('5.2');
  const [measTemp, setMeasTemp] = useState('48');
  const [qrStep, setQrStep] = useState<'SCAN' | 'CHECKLIST' | 'SUCCESS'>('SCAN');

  // Filter tickets assigned specifically to this technician
  const myTickets = useMemo(() => {
    return tickets.filter((t) => t.assignedTechnicianId === currentUser.id);
  }, [tickets, currentUser.id]);

  // Tab grouping
  const newAssignedTickets = useMemo(() => {
    return myTickets.filter(
      (t) => t.status === 'DANG_XU_LY' && (!t.beforePhotos || t.beforePhotos.length === 0)
    );
  }, [myTickets]);

  const workingTickets = useMemo(() => {
    return myTickets.filter(
      (t) => (t.status === 'DANG_XU_LY' && t.beforePhotos && t.beforePhotos.length > 0) || t.status === 'YEU_CAU_LAM_LAI'
    );
  }, [myTickets]);

  const submittedTickets = useMemo(() => {
    return myTickets.filter((t) => t.status === 'CHO_NGHIEM_THU');
  }, [myTickets]);

  const completedTickets = useMemo(() => {
    return myTickets.filter((t) => t.status === 'DA_NGHIEM_THU');
  }, [myTickets]);

  const currentList = useMemo(() => {
    if (activeTab === 'NEW') return newAssignedTickets;
    if (activeTab === 'WORKING') return workingTickets;
    if (activeTab === 'SUBMITTED') return submittedTickets;
    if (activeTab === 'HISTORY') return completedTickets;
    return [];
  }, [activeTab, newAssignedTickets, workingTickets, submittedTickets, completedTickets]);

  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return currentList;
    const q = searchQuery.toLowerCase();
    return currentList.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q)
    );
  }, [currentList, searchQuery]);

  // QR safety limits
  const isCurrentExceeded = activeQrPlan && (Number(measCurrent) > activeQrPlan.safeCurrentRange[1] || Number(measCurrent) < activeQrPlan.safeCurrentRange[0]);
  const isPressureExceeded = activeQrPlan && (Number(measPressure) > activeQrPlan.safePressureRange[1] || Number(measPressure) < activeQrPlan.safePressureRange[0]);
  const isTempExceeded = activeQrPlan && (Number(measTemp) > activeQrPlan.safeTempRange[1]);

  const handleFinishQrMaintenance = () => {
    if (!activeQrPlan) return;
    const dummyPhoto: TicketMedia = {
      id: 'qr_photo_' + Date.now(),
      name: 'bao_tri_thiet_bi.jpg',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      type: 'image',
      watermark: `GPS: 10.7769° N, 106.7009° E | QR: ${activeQrPlan.equipmentCode}`,
    };
    onCompleteMaintenance(
      activeQrPlan.id,
      { current: Number(measCurrent), pressure: Number(measPressure), temp: Number(measTemp) },
      dummyPhoto
    );
    setQrStep('SUCCESS');
    setTimeout(() => {
      setActiveQrPlan(null);
      setQrStep('SCAN');
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 text-slate-900 text-left">
      
      {/* KTV Header Profile with Explicit Logout / Switch Account */}
      <div className="px-3.5 pt-2.5 pb-2 bg-white border-b border-slate-200 shadow-2xs shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-amber-700 uppercase font-bold tracking-wider">Kỹ Thuật Viên</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-mono font-bold">{currentUser.username}</span>
              </div>
              <h2 className="text-xs font-bold text-slate-900">{currentUser.name}</h2>
            </div>
          </div>

          {/* User requested: KTV can log out or switch account between KTVs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenSwitchAccount}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
              title="Đổi giữa các tài khoản Kỹ Thuật Viên (KTV01, KTV02, KTV03)"
            >
              <User className="w-3 h-3 text-amber-700" />
              <span>Đổi tài khoản</span>
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Summary metric tabs */}
        <div className="grid grid-cols-4 gap-1.5 mt-2.5 pt-2 border-t border-slate-100 text-center">
          <button
            onClick={() => setActiveTab('NEW')}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'NEW'
                ? 'bg-amber-500 text-white font-bold shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className={`text-[10px] ${activeTab === 'NEW' ? 'text-white' : 'text-slate-500'}`}>Mới giao</div>
            <div className={`text-sm font-extrabold font-mono ${activeTab === 'NEW' ? 'text-white' : 'text-amber-700'}`}>
              {newAssignedTickets.length}
            </div>
          </button>

          <button
            onClick={() => setActiveTab('WORKING')}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'WORKING'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className={`text-[10px] ${activeTab === 'WORKING' ? 'text-white' : 'text-slate-500'}`}>Đang sửa</div>
            <div className={`text-sm font-extrabold font-mono ${activeTab === 'WORKING' ? 'text-white' : 'text-blue-700'}`}>
              {workingTickets.length}
            </div>
          </button>

          <button
            onClick={() => setActiveTab('SUBMITTED')}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'SUBMITTED'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className={`text-[10px] ${activeTab === 'SUBMITTED' ? 'text-white' : 'text-slate-500'}`}>Chờ duyệt</div>
            <div className={`text-sm font-extrabold font-mono ${activeTab === 'SUBMITTED' ? 'text-white' : 'text-purple-700'}`}>
              {submittedTickets.length}
            </div>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'HISTORY'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className={`text-[10px] ${activeTab === 'HISTORY' ? 'text-white' : 'text-slate-500'}`}>Đã xong</div>
            <div className={`text-sm font-extrabold font-mono ${activeTab === 'HISTORY' ? 'text-white' : 'text-emerald-700'}`}>
              {completedTickets.length}
            </div>
          </button>
        </div>
      </div>

      {/* Sub Tab Bar */}
      <div className="px-2 pt-2 bg-white border-b border-slate-200 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 text-xs">
        <button
          onClick={() => setActiveTab('NEW')}
          className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'NEW'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Chờ tiếp nhận ({newAssignedTickets.length})
        </button>

        <button
          onClick={() => setActiveTab('WORKING')}
          className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'WORKING'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Đang thực hiện ({workingTickets.length})
        </button>

        <button
          onClick={() => setActiveTab('SUBMITTED')}
          className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'SUBMITTED'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Chờ nghiệm thu ({submittedTickets.length})
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'HISTORY'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Lịch sử ({completedTickets.length})
        </button>

        <button
          onClick={() => setActiveTab('QR_MAINTENANCE')}
          className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'QR_MAINTENANCE'
              ? 'border-cyan-600 text-cyan-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Bảo trì QR (UC05)
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'QR_MAINTENANCE' ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
          <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-900 space-y-1">
            <h4 className="font-bold text-xs flex items-center gap-1.5 text-cyan-800">
              <QrCode className="w-4 h-4 text-cyan-600" /> Quét QR & Đo Thông Số Thiết Bị (UC05)
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              KTV đến hiện trường, quét mã dán trên thiết bị để mở Checklist kỹ thuật và nhập các thông số thực tế.
            </p>
          </div>

          <div className="space-y-2.5">
            {periodicPlans.map((plan) => (
              <div key={plan.id} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                    {plan.equipmentCode}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      plan.status === 'DA_HOAN_THANH'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                    }`}
                  >
                    {plan.status === 'DA_HOAN_THANH' ? '✓ Đã hoàn tất' : '⚠️ Cần kiểm tra'}
                  </span>
                </div>

                <h5 className="font-bold text-slate-900 text-xs">{plan.equipmentName}</h5>
                <p className="text-[11px] text-slate-500">Vị trí: <strong className="text-slate-700">{plan.location}</strong></p>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveQrPlan(plan);
                      setQrStep('CHECKLIST');
                    }}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Mở Checklist Kiểm Tra Thiết Bị (Quét QR)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search bar */}
          <div className="p-2 bg-slate-100 border-b border-slate-200 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã phiếu, vị trí..."
                className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 pb-20">
            {filteredTickets.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 mx-auto flex items-center justify-center shadow-xs">
                  <Inbox className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Không có công việc nào</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {activeTab === 'NEW'
                      ? 'Chưa có phiếu phân công mới từ BQL.'
                      : activeTab === 'WORKING'
                      ? 'Không có phiếu đang trong quá trình sửa chữa.'
                      : activeTab === 'SUBMITTED'
                      ? 'Chưa có phiếu nào gửi nghiệm thu.'
                      : 'Lịch sử phiếu đã hoàn tất.'}
                  </p>
                </div>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isNeedBefore = activeTab === 'NEW';
                const isWorking = activeTab === 'WORKING';

                return (
                  <div
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 transition-all cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-amber-700">
                          {ticket.id}
                        </span>
                        <PriorityBadge priority={ticket.priority} />
                        <ScopeBadge scope={ticket.scope} />
                      </div>
                      <StatusBadge status={ticket.status} size="sm" />
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                      {ticket.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {ticket.location} • Căn: <strong className="text-slate-700">{ticket.apartmentCode}</strong> ({ticket.residentName} - {ticket.residentPhone})
                    </p>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[10px]">
                      <SlaBadge
                        deadline={ticket.slaDeadline}
                        priority={ticket.priority}
                        status={ticket.status}
                      />
                      <span className="text-slate-500 font-mono">
                        Tạo lúc: {new Date(ticket.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Quick CTA */}
                    {isNeedBefore && (
                      <div className="mt-2.5 pt-2 border-t border-amber-100 flex items-center justify-between">
                        <span className="text-[10px] text-amber-800 font-semibold">
                          ⚡ Đến hiện trường & chụp Before:
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenKtvAction(ticket);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <Camera className="w-3 h-3" />
                          <span>Tiếp Nhận & Chụp Ảnh →</span>
                        </button>
                      </div>
                    )}

                    {isWorking && (
                      <div className="mt-2.5 pt-2 border-t border-blue-100 flex items-center justify-between">
                        <span className="text-[10px] text-blue-700 font-semibold">
                          🔧 Đang sửa chữa (Thêm vật tư & chụp After):
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenKtvAction(ticket);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <span>Gửi Nghiệm Thu →</span>
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

      {/* QR Checklist Modal */}
      {activeQrPlan && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex flex-col text-left p-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 flex flex-col max-h-full">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <div>
                <span className="font-mono text-xs font-bold text-cyan-700">{activeQrPlan.equipmentCode}</span>
                <h4 className="text-xs font-bold text-slate-900">{activeQrPlan.equipmentName}</h4>
              </div>
              <button
                onClick={() => setActiveQrPlan(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Checklist kỹ thuật đã kiểm tra:
                </span>
                {activeQrPlan.checkList.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700 py-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>

              {/* Measurements with alert */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-600 block">
                  Nhập thông số kỹ thuật thực tế:
                </span>

                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-700 flex items-center gap-1 text-[11px] font-medium">
                      <Zap className="w-3 h-3 text-amber-600" /> Dòng điện (Ampe):
                    </span>
                    <span className="text-[10px] text-slate-500">Chuẩn: {activeQrPlan.safeCurrentRange[0]} - {activeQrPlan.safeCurrentRange[1]} A</span>
                  </div>
                  <input
                    type="number"
                    value={measCurrent}
                    onChange={(e) => setMeasCurrent(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                  {isCurrentExceeded && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1">
                      ⚠️ Cảnh báo đỏ: Dòng điện vượt ngưỡng an toàn!
                    </p>
                  )}
                </div>

                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-700 flex items-center gap-1 text-[11px] font-medium">
                      <Gauge className="w-3 h-3 text-cyan-600" /> Áp suất (Bar):
                    </span>
                    <span className="text-[10px] text-slate-500">Chuẩn: {activeQrPlan.safePressureRange[0]} - {activeQrPlan.safePressureRange[1]} Bar</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={measPressure}
                    onChange={(e) => setMeasPressure(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                  {isPressureExceeded && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1">
                      ⚠️ Cảnh báo đỏ: Áp suất bất thường!
                    </p>
                  )}
                </div>

                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-700 flex items-center gap-1 text-[11px] font-medium">
                      <Thermometer className="w-3 h-3 text-rose-600" /> Nhiệt độ (°C):
                    </span>
                    <span className="text-[10px] text-slate-500">Tối đa: {activeQrPlan.safeTempRange[1]}°C</span>
                  </div>
                  <input
                    type="number"
                    value={measTemp}
                    onChange={(e) => setMeasTemp(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                  {isTempExceeded && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1">
                      ⚠️ Cảnh báo đỏ: Nhiệt độ vượt ngưỡng cho phép!
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinishQrMaintenance}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Lưu Lý Lịch Thiết Bị & Đóng Phiếu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SYNCHRONIZED BOTTOM NAVIGATION BAR FOR TECHNICIAN VIEW */}
      <nav className="absolute inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-1.5 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-4 gap-1">
          {/* Tab 1: Mới giao */}
          <button
            onClick={() => setActiveTab('NEW')}
            className={`py-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'NEW'
                ? 'text-amber-600 font-bold'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <Wrench className={`w-4 h-4 ${activeTab === 'NEW' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Tiếp nhận</span>
            {newAssignedTickets.length > 0 && (
              <span className="absolute top-0.5 right-4 w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[8px] font-black flex items-center justify-center animate-pulse">
                {newAssignedTickets.length}
              </span>
            )}
          </button>

          {/* Tab 2: Đang sửa */}
          <button
            onClick={() => setActiveTab('WORKING')}
            className={`py-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'WORKING'
                ? 'text-blue-600 font-bold'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <Layers className={`w-4 h-4 ${activeTab === 'WORKING' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Đang làm</span>
            {workingTickets.length > 0 && (
              <span className="absolute top-0.5 right-4 w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] font-black flex items-center justify-center">
                {workingTickets.length}
              </span>
            )}
          </button>

          {/* Tab 3: Bảo trì QR */}
          <button
            onClick={() => setActiveTab('QR_MAINTENANCE')}
            className={`py-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeTab === 'QR_MAINTENANCE'
                ? 'text-cyan-600 font-bold'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <QrCode className={`w-4 h-4 ${activeTab === 'QR_MAINTENANCE' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Bảo trì QR</span>
          </button>

          {/* Tab 4: Lịch sử */}
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`py-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeTab === 'HISTORY'
                ? 'text-emerald-600 font-bold'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <History className={`w-4 h-4 ${activeTab === 'HISTORY' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-0.5">Lịch sử</span>
          </button>
        </div>
      </nav>

    </div>
  );
};
