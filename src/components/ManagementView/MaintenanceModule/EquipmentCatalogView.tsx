import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  QrCode, 
  Calendar, 
  Wrench, 
  Filter, 
  MapPin, 
  Zap, 
  Gauge, 
  Thermometer, 
  History,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { EquipmentItem, EquipmentCategory, EquipmentStatus } from '../../../types';

interface EquipmentCatalogViewProps {
  equipments: EquipmentItem[];
  onOpenAddEquipmentModal: () => void;
  onOpenCreatePlanForEquipment: (equipmentCode: string) => void;
  onOpenQrModal: (equipment: EquipmentItem) => void;
  onOpenLookupForEquipment: (equipmentCode: string) => void;
}

export const EquipmentCatalogView: React.FC<EquipmentCatalogViewProps> = ({
  equipments,
  onOpenAddEquipmentModal,
  onOpenCreatePlanForEquipment,
  onOpenQrModal,
  onOpenLookupForEquipment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredEquipments = useMemo(() => {
    return equipments.filter((eq) => {
      if (categoryFilter !== 'ALL' && eq.category !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && eq.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = eq.code.toLowerCase().includes(q);
        const matchName = eq.name.toLowerCase().includes(q);
        const matchLoc = eq.location.toLowerCase().includes(q);
        const matchMfg = eq.manufacturer?.toLowerCase().includes(q) || false;
        if (!matchCode && !matchName && !matchLoc && !matchMfg) return false;
      }
      return true;
    });
  }, [equipments, categoryFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-3 text-xs text-slate-700">
      
      {/* Top Banner and Add Action */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-600" /> Danh Mục Thiết Bị Tòa Nhà ({equipments.length})
          </h4>
          <span className="text-[10px] text-slate-500">Quản lý hồ sơ kỹ thuật & tài sản dùng chung</span>
        </div>

        <button
          onClick={onOpenAddEquipmentModal}
          className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm Thiết Bị</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã thiết bị, tên, vị trí, hãng sản xuất..."
            className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[10px]">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
              categoryFilter === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({equipments.length})
          </button>
          <button
            onClick={() => setCategoryFilter('ThangMay')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
              categoryFilter === 'ThangMay'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            🛗 Thang máy
          </button>
          <button
            onClick={() => setCategoryFilter('Nuoc')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
              categoryFilter === 'Nuoc'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            💧 Bơm & Nước
          </button>
          <button
            onClick={() => setCategoryFilter('CoDien')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
              categoryFilter === 'CoDien'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ Cơ điện MEP
          </button>
          <button
            onClick={() => setCategoryFilter('PCCC')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
              categoryFilter === 'PCCC'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            🧯 PCCC
          </button>
          <button
            onClick={() => setCategoryFilter('HVAC')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
              categoryFilter === 'HVAC'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            ❄️ HVAC
          </button>
          <button
            onClick={() => setCategoryFilter('MayPhatDien')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
              categoryFilter === 'MayPhatDien'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            🔋 Máy phát điện
          </button>
        </div>
      </div>

      {/* Equipment Cards List */}
      <div className="space-y-2.5">
        {filteredEquipments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-[11px] bg-white rounded-2xl border border-slate-200">
            Không tìm thấy thiết bị nào phù hợp với bộ lọc.
          </div>
        ) : (
          filteredEquipments.map((eq) => {
            return (
              <div
                key={eq.id}
                className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-indigo-300 transition-all"
              >
                {/* Header: Code & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                      {eq.code}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">
                      {eq.category}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    eq.status === 'HOAT_DONG_TOT'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : eq.status === 'DEN_HAN_BAO_TRI'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                      : eq.status === 'DANG_BAO_TRI'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {eq.status === 'HOAT_DONG_TOT' && '● Tốt'}
                    {eq.status === 'DEN_HAN_BAO_TRI' && '⚠️ Đến hạn'}
                    {eq.status === 'DANG_BAO_TRI' && '🔄 Bảo dưỡng'}
                    {eq.status === 'CAN_SUA_CHUA' && '🔴 Cần sửa'}
                  </span>
                </div>

                {/* Name & Location */}
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">{eq.name}</h5>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{eq.location}</span>
                  </p>
                </div>

                {/* Manufacturer & Cycle meta */}
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] flex items-center justify-between">
                  <div>
                    <span className="text-slate-500">Hãng/Model:</span>{' '}
                    <strong className="text-slate-700">{eq.manufacturer || 'Tiêu chuẩn'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Chu kỳ:</span>{' '}
                    <strong className="text-indigo-700">{eq.cycle}</strong>
                  </div>
                </div>

                {/* Actions: Xem QR, Lập lịch bảo trì, Tra cứu lịch sử */}
                <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onOpenQrModal(eq)}
                    className="py-1 px-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold flex items-center justify-center gap-1 border border-slate-200 transition-colors cursor-pointer"
                  >
                    <QrCode className="w-3 h-3 text-cyan-600" />
                    <span>Mã QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenLookupForEquipment(eq.code)}
                    className="py-1 px-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <History className="w-3 h-3 text-indigo-600" />
                    <span>Lịch sử</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenCreatePlanForEquipment(eq.code)}
                    className="py-1 px-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>Lập Lịch</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
