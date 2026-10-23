import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Tag, 
  Clock, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  Flame,
  AlertCircle
} from 'lucide-react';
import { MaintenanceTicket, Priority } from '../../types';

interface ClassifyTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: MaintenanceTicket;
  onSaveClassification: (
    ticketId: string,
    priority: Priority,
    responsibilityScope?: 'CAN_HO' | 'BAN_QUAN_LY' | 'CHU_DAU_TU',
    technicalDept?: string,
    note?: string
  ) => void;
  onProceedToAssign?: (ticket: MaintenanceTicket) => void;
}

export const ClassifyTicketModal: React.FC<ClassifyTicketModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onSaveClassification,
  onProceedToAssign,
}) => {
  const [priority, setPriority] = useState<Priority>(ticket.priority || 'P2');
  const [responsibility, setResponsibility] = useState<'CAN_HO' | 'BAN_QUAN_LY' | 'CHU_DAU_TU'>(
    ticket.responsibilityScope || (ticket.scope === 'SO_HUU_RIENG' ? 'CAN_HO' : 'BAN_QUAN_LY')
  );
  const [technicalDept, setTechnicalDept] = useState<string>(
    ticket.technicalDept || (
      ticket.category === 'Dien' ? 'Bộ phận Điện (MEP)' :
      ticket.category === 'Nuoc' ? 'Bộ phận Cấp Thoát Nước (Plumbing)' :
      ticket.category === 'DieuHoa' ? 'Bộ phận Điện Lạnh (HVAC)' :
      ticket.category === 'ThangMay' ? 'Đội Vận Hành Thang Máy' :
      ticket.category === 'PCCC' ? 'Đội Kỹ Thuật PCCC' : 'Tổ Kỹ Thuật Tổng Hợp'
    )
  );
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSaveOnly = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveClassification(ticket.id, priority, responsibility, technicalDept, note);
    onClose();
  };

  const handleSaveAndAssign = () => {
    onSaveClassification(ticket.id, priority, responsibility, technicalDept, note);
    onClose();
    if (onProceedToAssign) {
      onProceedToAssign({
        ...ticket,
        priority,
        responsibilityScope: responsibility,
        technicalDept,
      });
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex flex-col text-left">
      {/* Container inside iPhone screen */}
      <div className="bg-white h-full flex flex-col">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-2xs">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-amber-700">{ticket.id}</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-600" /> Phân loại sự cố & SLA
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Quy trình FR02.03: Đánh giá trách nhiệm & Mức ưu tiên</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSaveOnly} className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs text-slate-800">
          
          {/* Resident Request Info */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <h4 className="text-xs font-bold text-slate-900">{ticket.title}</h4>
            <p className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200 leading-relaxed">
              {ticket.description}
            </p>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
              <span>Vị trí: <strong className="text-slate-800">{ticket.location}</strong></span>
              <span>Căn hộ: <strong className="text-blue-700">{ticket.apartmentCode}</strong></span>
            </div>
          </div>

          {/* 1. Mức độ ưu tiên (P1, P2, P3) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>Phân loại mức độ ưu tiên & Thời hạn SLA:</span>
              </label>
              <span className="text-[10px] text-amber-800 font-semibold font-mono">Bắt buộc theo URD</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {/* P1 */}
              <button
                type="button"
                onClick={() => setPriority('P1')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  priority === 'P1'
                    ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] font-bold text-rose-700 flex items-center justify-between">
                  <span>P1 - Khẩn cấp</span>
                  {priority === 'P1' && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />}
                </div>
                <div className="text-[10px] text-rose-800 font-semibold mt-0.5">SLA: 2 giờ</div>
                <div className="text-[9px] text-slate-500 mt-1 line-clamp-2">Cháy nổ, ngập tràn, kẹt thang, đe dọa an toàn</div>
              </button>

              {/* P2 */}
              <button
                type="button"
                onClick={() => setPriority('P2')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  priority === 'P2'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] font-bold text-amber-800 flex items-center justify-between">
                  <span>P2 - Cần sớm</span>
                  {priority === 'P2' && <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />}
                </div>
                <div className="text-[10px] text-amber-900 font-semibold mt-0.5">SLA: 6 giờ</div>
                <div className="text-[9px] text-slate-500 mt-1 line-clamp-2">Hỏng điều hòa, rò rỉ van nước, mất điện phòng</div>
              </button>

              {/* P3 */}
              <button
                type="button"
                onClick={() => setPriority('P3')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                  priority === 'P3'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] font-bold text-blue-700 flex items-center justify-between">
                  <span>P3 - Tiêu chuẩn</span>
                  {priority === 'P3' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </div>
                <div className="text-[10px] text-blue-800 font-semibold mt-0.5">SLA: 24 giờ</div>
                <div className="text-[9px] text-slate-500 mt-1 line-clamp-2">Thấm ố nhẹ, ổ khóa kẹt, kiểm tra định kỳ</div>
              </button>
            </div>
          </div>

          {/* 2. Phân loại trách nhiệm */}
          <div>
            <label className="block text-[11px] font-bold text-slate-900 mb-1.5">
              Phân định trách nhiệm xử lý & Chi phí:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setResponsibility('CAN_HO')}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  responsibility === 'CAN_HO'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] text-indigo-700">Căn hộ chi trả</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Tài sản riêng</div>
              </button>

              <button
                type="button"
                onClick={() => setResponsibility('BAN_QUAN_LY')}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  responsibility === 'BAN_QUAN_LY'
                    ? 'bg-cyan-50 border-cyan-300 text-cyan-900 font-bold ring-2 ring-cyan-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] text-cyan-800">Ban Quản Lý</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Quỹ bảo trì chung</div>
              </button>

              <button
                type="button"
                onClick={() => setResponsibility('CHU_DAU_TU')}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  responsibility === 'CHU_DAU_TU'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] text-emerald-800">Bảo hành CĐT</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Hạn bảo hành tòa</div>
              </button>
            </div>
          </div>

          {/* 3. Bộ phận kỹ thuật chuyên trách */}
          <div>
            <label className="block text-[11px] font-bold text-slate-900 mb-1">
              Bộ phận kỹ thuật tiếp nhận xử lý:
            </label>
            <select
              value={technicalDept}
              onChange={(e) => setTechnicalDept(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            >
              <option value="Bộ phận Điện (MEP)">⚡ Bộ phận Điện (MEP Team)</option>
              <option value="Bộ phận Cấp Thoát Nước (Plumbing)">💧 Bộ phận Cấp Thoát Nước (Plumbing Team)</option>
              <option value="Bộ phận Điện Lạnh (HVAC)">❄️ Bộ phận Điện Lạnh & Thông Gió (HVAC)</option>
              <option value="Đội Vận Hành Thang Máy">🛗 Đội Vận Hành & Bảo Trì Thang Máy</option>
              <option value="Đội Kỹ Thuật PCCC">🧯 Đội Kỹ Thuật PCCC & An Toàn Tòa Nhà</option>
              <option value="Tổ Xây Dựng Hoàn Thiện">🧱 Tổ Xây Dựng & Thấm Dột Hoàn Thiện</option>
              <option value="Tổ Kỹ Thuật Tổng Hợp">🔧 Tổ Kỹ Thuật Vận Hành Chung</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Ghi chú phân loại của BQL (Tùy chọn):
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú đánh giá nguyên nhân, chỉ đạo kỹ thuật..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleSaveAndAssign}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Lưu Phân Loại & Chuyển Phân Công KTV →</span>
            </button>

            <button
              type="submit"
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 border border-slate-200"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chỉ Lưu Phân Loại Mức Độ Ưu Tiên</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
