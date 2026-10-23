import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  User, 
  Phone, 
  Clock, 
  Send, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';
import { MaintenanceTicket, Priority } from '../../types';
import { AVAILABLE_TECHNICIANS } from '../../mockData';

interface AssignTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: MaintenanceTicket;
  onAssign: (
    ticketId: string, 
    priority: Priority, 
    technicianId: string, 
    note?: string,
    responsibilityScope?: 'CAN_HO' | 'BAN_QUAN_LY' | 'CHU_DAU_TU',
    technicalDept?: string
  ) => void;
}

export const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onAssign,
}) => {
  const [priority, setPriority] = useState<Priority>(ticket.priority || 'P2');
  const [selectedTechId, setSelectedTechId] = useState<string>(
    ticket.assignedTechnicianId || AVAILABLE_TECHNICIANS[0].id
  );
  const [responsibility, setResponsibility] = useState<'CAN_HO' | 'BAN_QUAN_LY' | 'CHU_DAU_TU'>(
    ticket.responsibilityScope || (ticket.scope === 'SO_HUU_RIENG' ? 'CAN_HO' : 'BAN_QUAN_LY')
  );
  const [technicalDept, setTechnicalDept] = useState<string>(
    ticket.technicalDept || 'Bộ phận Cơ Điện - Nước (MEP)'
  );
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign(ticket.id, priority, selectedTechId, note, responsibility, technicalDept);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex flex-col text-left">
      <div className="bg-white h-full flex flex-col">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-2xs">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-indigo-700">{ticket.id}</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Phê Duyệt & Phân Công KTV
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Quy trình UC02: Điều phối & Quản lý sự cố</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs text-slate-800">
          
          {/* Resident Request Details */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Nội dung phản ánh từ cư dân:</span>
            <h4 className="text-xs font-bold text-slate-900">{ticket.title}</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200">
              {ticket.description}
            </p>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Vị trí: <strong className="text-slate-800">{ticket.location}</strong></span>
              <span>Căn hộ: <strong className="text-blue-700">{ticket.apartmentCode}</strong></span>
            </div>
          </div>

          {/* Priority Setting */}
          <div>
            <label className="block text-[11px] font-bold text-slate-900 mb-1.5">
              Xác nhận mức độ ưu tiên (SLA):
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPriority('P1')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  priority === 'P1'
                    ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] text-rose-700 font-bold">P1 - Khẩn cấp</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Thời hạn 2h</div>
              </button>

              <button
                type="button"
                onClick={() => setPriority('P2')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  priority === 'P2'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold ring-2 ring-amber-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] text-amber-800 font-bold">P2 - Cần sớm</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Thời hạn 6h</div>
              </button>

              <button
                type="button"
                onClick={() => setPriority('P3')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  priority === 'P3'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] text-blue-700 font-bold">P3 - Tiêu chuẩn</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Thời hạn 24h</div>
              </button>
            </div>
          </div>

          {/* Technician Selection from Roster */}
          <div>
            <label className="block text-[11px] font-bold text-slate-900 mb-1.5">
              Chọn kỹ thuật viên trong ca trực (Chuyên môn phù hợp):
            </label>
            <div className="space-y-1.5">
              {AVAILABLE_TECHNICIANS.map((tech) => {
                const isSelected = selectedTechId === tech.id;
                const isOffDuty = tech.status === 'Nghỉ ca';
                return (
                  <div
                    key={tech.id}
                    onClick={() => !isOffDuty && setSelectedTechId(tech.id)}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                        : isOffDuty
                        ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                        {tech.name[0]}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{tech.name}</span>
                          {isSelected && <span className="text-[10px] text-indigo-700 font-bold">● Đã chọn</span>}
                        </div>
                        <div className="text-[10px] text-slate-500">{tech.specialty} • SĐT: {tech.phone}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                          isOffDuty
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {tech.status}
                      </span>
                      <div className="text-[9px] text-slate-500 mt-0.5">
                        Đang làm: {tech.activeTicketsCount} việc
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dispatch Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-900 mb-1">
              Ghi chú điều phối / Chỉ đạo kỹ thuật:
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Nhớ mang theo van khóa phi 21 và bộ gioăng cao su chịu nhiệt..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Xác Nhận Phê Duyệt & Giao KTV</span>
            </button>
            <p className="text-[10px] text-center text-slate-500 mt-1.5">
              Hệ thống sẽ cập nhật trạng thái "Đang xử lý" và gửi thông báo đẩy đến KTV và Cư dân.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};
