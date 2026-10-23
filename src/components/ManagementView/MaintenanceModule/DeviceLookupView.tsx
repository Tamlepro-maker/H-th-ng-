import React, { useState, useMemo } from 'react';
import { 
  Search, 
  QrCode, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  Gauge, 
  Thermometer, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Building2, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { 
  EquipmentItem, 
  PeriodicMaintenancePlan, 
  MaintenanceHistoryRecord 
} from '../../../types';

interface DeviceLookupViewProps {
  equipments: EquipmentItem[];
  periodicPlans: PeriodicMaintenancePlan[];
  maintenanceHistory: MaintenanceHistoryRecord[];
  onOpenCreatePlanForEquipment: (equipmentCode: string) => void;
  onOpenQrModal: (equipment: EquipmentItem) => void;
  onSelectHistoryRecord: (record: MaintenanceHistoryRecord) => void;
}

export const DeviceLookupView: React.FC<DeviceLookupViewProps> = ({
  equipments,
  periodicPlans,
  maintenanceHistory,
  onOpenCreatePlanForEquipment,
  onOpenQrModal,
  onSelectHistoryRecord,
}) => {
  const [searchCode, setSearchCode] = useState('TM-01-AQUA');

  // Find equipment by code (exact or starts with)
  const matchedEquipment = useMemo(() => {
    if (!searchCode.trim()) return null;
    const clean = searchCode.trim().toLowerCase();
    return (
      equipments.find(e => e.code.toLowerCase() === clean) ||
      equipments.find(e => e.code.toLowerCase().includes(clean)) ||
      null
    );
  }, [searchCode, equipments]);

  // Find active periodic plan for this equipment
  const activePlan = useMemo(() => {
    if (!matchedEquipment) return null;
    return periodicPlans.find(p => p.equipmentCode.toLowerCase() === matchedEquipment.code.toLowerCase());
  }, [matchedEquipment, periodicPlans]);

  // Find maintenance history records for this equipment
  const deviceHistory = useMemo(() => {
    if (!matchedEquipment) return [];
    return maintenanceHistory.filter(
      h => h.equipmentCode.toLowerCase() === matchedEquipment.code.toLowerCase()
    );
  }, [matchedEquipment, maintenanceHistory]);

  // Status badge styling helper
  const renderStatusBadge = (status: EquipmentItem['status']) => {
    switch (status) {
      case 'HOAT_DONG_TOT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">● Hoạt động tốt</span>;
      case 'DEN_HAN_BAO_TRI':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">⚠️ Đến hạn bảo trì</span>;
      case 'DANG_BAO_TRI':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">🔄 Đang bảo dưỡng</span>;
      case 'CAN_SUA_CHUA':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">🔴 Cần sửa chữa</span>;
    }
  };

  return (
    <div className="space-y-3 text-xs text-slate-700">
      
      {/* Search Header Banner */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Search className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Tra Cứu Thông Tin & Lịch Sử Theo Mã Thiết Bị
            </h4>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
            Tòa nhà Aqua
          </span>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Nhập mã thiết bị (ví dụ: TM-01-AQUA, BP-02-B2, TD-01-T1...)"
            className="w-full pl-9 pr-9 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-white/15"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          {searchCode && (
            <button
              onClick={() => setSearchCode('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Click Preset Tags */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1 text-[10px]">
          <span className="text-slate-400 shrink-0">Gợi ý mã:</span>
          {equipments.slice(0, 5).map((eq) => (
            <button
              key={eq.id}
              onClick={() => setSearchCode(eq.code)}
              className={`px-2 py-0.5 rounded-md font-mono transition-colors shrink-0 cursor-pointer ${
                searchCode.toLowerCase() === eq.code.toLowerCase()
                  ? 'bg-cyan-500 text-white font-bold'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {eq.code}
            </button>
          ))}
        </div>
      </div>

      {/* Main Matched Result Container */}
      {matchedEquipment ? (
        <div className="space-y-3 animate-in fade-in duration-200">
          
          {/* 1. Device Profile Card */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                    {matchedEquipment.code}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    {matchedEquipment.category}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                  {matchedEquipment.name}
                </h4>
              </div>

              {renderStatusBadge(matchedEquipment.status)}
            </div>

            {/* Location & Specs */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Vị trí:
                </span>
                <strong className="text-slate-800">{matchedEquipment.location}</strong>
              </div>

              {matchedEquipment.manufacturer && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Hãng sản xuất / Model:</span>
                  <span className="text-slate-700 font-medium">
                    {matchedEquipment.manufacturer} {matchedEquipment.model ? `(${matchedEquipment.model})` : ''}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Chu kỳ quy chuẩn:</span>
                <span className="text-slate-900 font-semibold">{matchedEquipment.cycle}</span>
              </div>

              {matchedEquipment.installDate && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Ngày lắp đặt vận hành:</span>
                  <span className="text-slate-700 font-mono">{matchedEquipment.installDate}</span>
                </div>
              )}
            </div>

            {/* Safety limits reference */}
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
              <div className="p-1.5 rounded-lg bg-blue-50/60 border border-blue-200">
                <div className="text-blue-700 font-semibold flex items-center justify-center gap-0.5">
                  <Zap className="w-3 h-3" /> Dòng điện
                </div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {matchedEquipment.safeCurrentRange ? `${matchedEquipment.safeCurrentRange[0]}-${matchedEquipment.safeCurrentRange[1]}A` : '10-30A'}
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-cyan-50/60 border border-cyan-200">
                <div className="text-cyan-700 font-semibold flex items-center justify-center gap-0.5">
                  <Gauge className="w-3 h-3" /> Áp suất
                </div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {matchedEquipment.safePressureRange ? `${matchedEquipment.safePressureRange[0]}-${matchedEquipment.safePressureRange[1]} Bar` : '0-10 Bar'}
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-amber-50/60 border border-amber-200">
                <div className="text-amber-700 font-semibold flex items-center justify-center gap-0.5">
                  <Thermometer className="w-3 h-3" /> Nhiệt độ
                </div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">
                  {matchedEquipment.safeTempRange ? `≤ ${matchedEquipment.safeTempRange[1]}°C` : '≤ 65°C'}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onOpenQrModal(matchedEquipment)}
                className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold flex items-center justify-center gap-1 border border-slate-200 transition-colors cursor-pointer"
              >
                <QrCode className="w-3 h-3 text-cyan-600" />
                <span>Xem mã QR</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenCreatePlanForEquipment(matchedEquipment.code)}
                className="flex-1 py-1.5 px-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Lập Lịch Bảo Trì Mới</span>
              </button>
            </div>
          </div>

          {/* 2. Next Scheduled Plan Card (if active) */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-600" /> Kế Hoạch Bảo Trì Tiếp Theo
              </h5>
              {activePlan && (
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                  activePlan.status === 'DA_HOAN_THANH'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {activePlan.status === 'DA_HOAN_THANH' ? '✓ Đã hoàn thành đợt này' : '⚠️ Đến hạn'}
                </span>
              )}
            </div>

            {activePlan ? (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Hạn bảo dưỡng tiếp theo:</span>
                  <span className="text-cyan-700 font-mono font-bold text-xs">{activePlan.nextDue}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">KTV phụ trách:</span>
                  <strong className="text-amber-800">{activePlan.assignedKtvName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Biểu mẫu checklist:</span>
                  <span className="text-slate-700 font-medium">{activePlan.checkList.length} hạng mục kiểm tra</span>
                </div>
              </div>
            ) : (
              <div className="p-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-[11px] text-slate-500">Thiết bị này hiện chưa có lịch bảo trì định kỳ sắp tới.</p>
                <button
                  type="button"
                  onClick={() => onOpenCreatePlanForEquipment(matchedEquipment.code)}
                  className="mt-2 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold text-[10px] cursor-pointer"
                >
                  + Thiết lập kế hoạch bảo trì ngay
                </button>
              </div>
            )}
          </div>

          {/* 3. Maintenance History Timeline of this Equipment */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" /> Lịch Sử Các Đợt Bảo Trì ({deviceHistory.length})
              </h5>
              <span className="text-[9px] text-slate-400">Nhật ký bảo dưỡng</span>
            </div>

            {deviceHistory.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-[11px]">
                Chưa có nhật ký bảo trì nào được ghi nhận cho thiết bị này.
              </div>
            ) : (
              <div className="space-y-2">
                {deviceHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectHistoryRecord(item)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50/50 border border-slate-200 hover:border-cyan-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-800">{item.id}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 font-mono">{item.maintenanceDate}</span>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        item.result === 'DAT_TIEU_CHUAN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {item.result === 'DAT_TIEU_CHUAN' ? '✓ Đạt chuẩn' : '⚠️ Cần theo dõi'}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-600 line-clamp-1 italic">
                      "{item.notes}"
                    </p>

                    <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-slate-200/70 text-[10px]">
                      <span className="text-slate-500">
                        KTV: <strong className="text-amber-700">{item.technicianName}</strong>
                      </span>

                      <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-600">
                        <span>{item.measuredCurrent}A</span>
                        <span>•</span>
                        <span>{item.measuredPressure}Bar</span>
                        <span>•</span>
                        <span>{item.measuredTemp}°C</span>
                        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="py-12 px-4 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-700">Không tìm thấy thiết bị "{searchCode}"</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Vui lòng kiểm tra lại mã thiết bị hoặc bấm vào các mã gợi ý ở trên.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
