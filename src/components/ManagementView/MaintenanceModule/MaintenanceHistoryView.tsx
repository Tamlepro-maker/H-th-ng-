import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Calendar, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  Gauge, 
  Thermometer, 
  ChevronRight,
  Filter,
  Camera
} from 'lucide-react';
import { MaintenanceHistoryRecord } from '../../../types';

interface MaintenanceHistoryViewProps {
  historyRecords: MaintenanceHistoryRecord[];
  onSelectRecord: (record: MaintenanceHistoryRecord) => void;
  onOpenLookupForEquipment: (equipmentCode: string) => void;
}

export const MaintenanceHistoryView: React.FC<MaintenanceHistoryViewProps> = ({
  historyRecords,
  onSelectRecord,
  onOpenLookupForEquipment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState<'ALL' | 'DAT_TIEU_CHUAN' | 'CAN_THEO_DOI' | 'KHONG_DAT'>('ALL');

  const filteredRecords = useMemo(() => {
    return historyRecords.filter((rec) => {
      if (resultFilter !== 'ALL' && rec.result !== resultFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = rec.equipmentCode.toLowerCase().includes(q);
        const matchName = rec.equipmentName.toLowerCase().includes(q);
        const matchTech = rec.technicianName.toLowerCase().includes(q);
        const matchId = rec.id.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchTech && !matchId) return false;
      }
      return true;
    });
  }, [historyRecords, resultFilter, searchQuery]);

  return (
    <div className="space-y-3 text-xs text-slate-700">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <History className="w-4 h-4 text-emerald-600" /> Nhật Ký & Lịch Sử Bảo Trì ({historyRecords.length})
          </h4>
          <span className="text-[10px] text-slate-500">Biên bản nghiệm thu kỹ thuật định kỳ thiết bị</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã thiết bị, tên, KTV thực hiện..."
            className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[10px]">
          <button
            onClick={() => setResultFilter('ALL')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
              resultFilter === 'ALL'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({historyRecords.length})
          </button>

          <button
            onClick={() => setResultFilter('DAT_TIEU_CHUAN')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
              resultFilter === 'DAT_TIEU_CHUAN'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            ✓ Đạt chuẩn
          </button>

          <button
            onClick={() => setResultFilter('CAN_THEO_DOI')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
              resultFilter === 'CAN_THEO_DOI'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            ⚠️ Cần theo dõi
          </button>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-2.5">
        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-[11px] bg-white rounded-2xl border border-slate-200">
            Không tìm thấy lịch sử bảo trì phù hợp.
          </div>
        ) : (
          filteredRecords.map((record) => {
            const passCount = record.checklistResults.filter(i => i.passed).length;
            const totalChecklist = record.checklistResults.length;

            return (
              <div
                key={record.id}
                onClick={() => onSelectRecord(record)}
                className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-400 transition-all cursor-pointer group space-y-2"
              >
                {/* Header ID, Equipment Code & Result */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-500">
                      {record.id}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenLookupForEquipment(record.equipmentCode);
                      }}
                      className="font-mono text-xs font-extrabold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-1.5 py-0.2 rounded border border-cyan-200 cursor-pointer"
                      title="Bấm để tra cứu riêng thiết bị này"
                    >
                      {record.equipmentCode}
                    </button>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 ${
                    record.result === 'DAT_TIEU_CHUAN'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : record.result === 'CAN_THEO_DOI'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {record.result === 'DAT_TIEU_CHUAN' && <CheckCircle2 className="w-2.5 h-2.5" />}
                    {record.result === 'CAN_THEO_DOI' && <AlertTriangle className="w-2.5 h-2.5" />}
                    <span>{record.result === 'DAT_TIEU_CHUAN' ? 'Đạt chuẩn' : 'Cần theo dõi'}</span>
                  </span>
                </div>

                {/* Name */}
                <div>
                  <h5 className="font-bold text-slate-900 text-xs group-hover:text-emerald-700 transition-colors">
                    {record.equipmentName}
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">{record.location}</p>
                </div>

                {/* Notes if any */}
                {record.notes && (
                  <p className="text-[11px] text-slate-600 italic line-clamp-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    "{record.notes}"
                  </p>
                )}

                {/* Measured Parameters Pills */}
                <div className="grid grid-cols-3 gap-1 text-[10px] text-center font-mono">
                  <div className="p-1 rounded bg-blue-50/70 border border-blue-100 text-blue-900">
                    <span className="text-[8px] text-blue-600 block">Dòng điện</span>
                    {record.measuredCurrent !== undefined ? `${record.measuredCurrent}A` : '-'}
                  </div>
                  <div className="p-1 rounded bg-cyan-50/70 border border-cyan-100 text-cyan-900">
                    <span className="text-[8px] text-cyan-600 block">Áp suất</span>
                    {record.measuredPressure !== undefined ? `${record.measuredPressure}Bar` : '-'}
                  </div>
                  <div className="p-1 rounded bg-amber-50/70 border border-amber-100 text-amber-900">
                    <span className="text-[8px] text-amber-600 block">Nhiệt độ</span>
                    {record.measuredTemp !== undefined ? `${record.measuredTemp}°C` : '-'}
                  </div>
                </div>

                {/* Footer info: KTV, Date, Checklist count */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>KTV: <strong className="text-amber-800">{record.technicianName}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 font-semibold">{passCount}/{totalChecklist} Đạt</span>
                    <span className="font-mono text-slate-600">{record.maintenanceDate}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
