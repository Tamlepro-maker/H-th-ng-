import React from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, Calendar, User, MapPin, Gauge, Zap, Thermometer, ShieldCheck } from 'lucide-react';
import { MaintenanceHistoryRecord } from '../../../types';

interface MaintenanceHistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MaintenanceHistoryRecord;
}

export const MaintenanceHistoryDetailModal: React.FC<MaintenanceHistoryDetailModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-3 text-left">
      <div className="w-full max-h-[90%] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                {record.id}
              </span>
              <span className="text-[10px] text-slate-300 font-mono">Mã TB: {record.equipmentCode}</span>
            </div>
            <h3 className="text-xs font-bold mt-1 text-white line-clamp-1">{record.equipmentName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-3.5 space-y-3 overflow-y-auto text-xs text-slate-700">
          
          {/* Status and general info */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Ngày thực hiện:
              </span>
              <strong className="text-slate-900 font-mono">{record.maintenanceDate}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Kỹ thuật viên:
              </span>
              <strong className="text-amber-700">{record.technicianName}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Vị trí thiết bị:
              </span>
              <span className="text-slate-700 font-medium">{record.location}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-500">Kết quả đánh giá:</span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 ${
                record.result === 'DAT_TIEU_CHUAN'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : record.result === 'CAN_THEO_DOI'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {record.result === 'DAT_TIEU_CHUAN' && <CheckCircle2 className="w-3 h-3" />}
                {record.result === 'CAN_THEO_DOI' && <AlertTriangle className="w-3 h-3" />}
                {record.result === 'KHONG_DAT' && <XCircle className="w-3 h-3" />}
                <span>
                  {record.result === 'DAT_TIEU_CHUAN' ? 'Đạt tiêu chuẩn vận hành' : record.result === 'CAN_THEO_DOI' ? 'Cần theo dõi thêm' : 'Không đạt yêu cầu'}
                </span>
              </span>
            </div>
          </div>

          {/* Measured safety parameters */}
          <div className="space-y-1.5">
            <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Thông số đo kiểm thực tế hiện trường
            </h5>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-200 text-center">
                <div className="text-[10px] text-blue-700 flex items-center justify-center gap-0.5 font-semibold">
                  <Zap className="w-3 h-3" /> Dòng điện
                </div>
                <div className="text-xs font-extrabold text-blue-900 font-mono mt-0.5">
                  {record.measuredCurrent !== undefined ? `${record.measuredCurrent} A` : 'N/A'}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-cyan-50/70 border border-cyan-200 text-center">
                <div className="text-[10px] text-cyan-700 flex items-center justify-center gap-0.5 font-semibold">
                  <Gauge className="w-3 h-3" /> Áp suất
                </div>
                <div className="text-xs font-extrabold text-cyan-900 font-mono mt-0.5">
                  {record.measuredPressure !== undefined ? `${record.measuredPressure} Bar` : 'N/A'}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
                <div className="text-[10px] text-amber-700 flex items-center justify-center gap-0.5 font-semibold">
                  <Thermometer className="w-3 h-3" /> Nhiệt độ
                </div>
                <div className="text-xs font-extrabold text-amber-900 font-mono mt-0.5">
                  {record.measuredTemp !== undefined ? `${record.measuredTemp} °C` : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Checklist execution items */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Chi tiết kết quả Checklist ({record.checklistResults.length} mục)
              </h5>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {record.checklistResults.filter(i => i.passed).length}/{record.checklistResults.length} Đạt
              </span>
            </div>

            <div className="space-y-1.5 bg-slate-50/80 p-2 rounded-xl border border-slate-200">
              {record.checklistResults.map((item, idx) => (
                <div key={idx} className="p-1.5 bg-white rounded-lg border border-slate-100 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-800">
                      {idx + 1}. {item.title}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                      item.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.passed ? '✓ Đạt' : '✗ Lỗi'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Chuẩn: {item.standard}</span>
                    {item.actualValue && (
                      <span className="text-slate-700 font-mono italic">Thực tế: {item.actualValue}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technician Notes */}
          {record.notes && (
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-[11px] space-y-0.5">
              <strong className="text-amber-900 font-semibold">Ghi chú & Kiến nghị của Kỹ thuật viên:</strong>
              <p className="text-slate-700 italic">{record.notes}</p>
            </div>
          )}

          {/* Site Inspection Evidence Photo */}
          {record.photoUrl && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Hình ảnh nghiệm thu hiện trường:</span>
              <div className="relative rounded-xl overflow-hidden border border-slate-200">
                <img src={record.photoUrl} alt="Hiện trường" className="w-full h-36 object-cover" />
                {record.watermark && (
                  <div className="absolute inset-x-0 bottom-0 bg-slate-900/85 text-white p-1.5 text-[9px] font-mono leading-tight">
                    {record.watermark}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
