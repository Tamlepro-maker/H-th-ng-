import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  UserCheck, 
  Wrench, 
  Image as ImageIcon,
  Clock,
  MessageSquare
} from 'lucide-react';
import { MaintenanceTicket, UserProfile, TicketMedia } from '../../types';
import { AVAILABLE_TECHNICIANS } from '../../mockData';

interface VerifyComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: MaintenanceTicket;
  onVerifyComplaint: (ticketId: string, isValid: boolean, decisionNote: string, reassignedKtvId?: string) => void;
}

export const VerifyComplaintModal: React.FC<VerifyComplaintModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onVerifyComplaint,
}) => {
  const [decision, setDecision] = useState<'VALID' | 'INVALID'>('VALID');
  const [selectedKtvId, setSelectedKtvId] = useState<string>(
    ticket.assignedTechnicianId || AVAILABLE_TECHNICIANS[0].id
  );
  const [directionNote, setDirectionNote] = useState<string>(
    'Yêu cầu kiểm tra lại kỹ thuật, xử lý dứt điểm khiếu nại của cư dân trong hôm nay.'
  );
  const [invalidReason, setInvalidReason] = useState<string>(
    'Thiết bị đã được kiểm tra đạt quy chuẩn kỹ thuật tòa nhà. Hiện tượng phản ánh nằm ngoài phạm vi bảo hành hoặc do yếu tố ngoại cảnh.'
  );
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (decision === 'VALID') {
      if (!directionNote.trim()) {
        setErrorMsg('Vui lòng nhập chỉ đạo xử lý cho kỹ thuật viên');
        return;
      }
      onVerifyComplaint(ticket.id, true, directionNote.trim(), selectedKtvId);
    } else {
      if (!invalidReason.trim()) {
        setErrorMsg('Vui lòng nêu rõ lý do khiếu nại không hợp lệ để phản hồi cho cư dân');
        return;
      }
      onVerifyComplaint(ticket.id, false, invalidReason.trim());
    }
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex flex-col text-left">
      <div className="bg-white h-full flex flex-col">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-2xs">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                {ticket.id}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Xác minh khiếu nại
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Ban Quản Lý thẩm tra kết quả sửa chữa và ý kiến của cư dân</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2 text-xs text-slate-800">
          
          {/* Resident complaint details alert */}
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Ý kiến khiếu nại của Cư dân
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Căn hộ {ticket.apartmentCode}
              </span>
            </div>

            <div className="bg-white p-2 rounded-lg border border-rose-200 text-slate-800 text-[11px] leading-relaxed">
              <p className="font-semibold text-rose-950">
                "{ticket.complaint?.reason || ticket.rejectionReason || 'Chưa đạt yêu cầu kỹ thuật'}"
              </p>
              <div className="text-[9px] text-slate-500 flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                <span>Người gửi: <strong>{ticket.residentName}</strong> ({ticket.residentPhone})</span>
                <span>{ticket.complaint?.submittedAt ? new Date(ticket.complaint.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
              </div>
            </div>

            {/* Complaint photos if any */}
            {ticket.complaint?.photos && ticket.complaint.photos.length > 0 && (
              <div>
                <span className="text-[9px] font-bold text-slate-600 uppercase block mb-1">Ảnh chụp lỗi:</span>
                <div className="flex gap-1.5">
                  {ticket.complaint.photos.map((p) => (
                    <img key={p.id} src={p.url} alt="Fault" className="w-12 h-12 object-cover rounded-lg border border-rose-300" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Repair Work Summary for Cross-Verification */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-blue-600" /> Đối chiếu kết quả sửa chữa của KTV
            </h5>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-600 block">Trước (Before):</span>
                <div className="relative h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                  {ticket.beforePhotos && ticket.beforePhotos[0] ? (
                    <img src={ticket.beforePhotos[0].url} alt="Before" className="w-full h-full object-cover" />
                  ) : ticket.initialMedia && ticket.initialMedia[0] ? (
                    <img src={ticket.initialMedia[0].url} alt="Initial" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-[9px] text-slate-400">Không có ảnh</div>
                  )}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-emerald-700 block">Sau (After):</span>
                <div className="relative h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                  {ticket.afterPhotos && ticket.afterPhotos[0] ? (
                    <img src={ticket.afterPhotos[0].url} alt="After" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-[9px] text-slate-400">Không có ảnh After</div>
                  )}
                </div>
              </div>
            </div>

            {ticket.technicianNotes && (
              <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-[10px] text-slate-700">
                <span className="font-bold text-slate-500 uppercase block text-[9px]">Ghi chú KTV ({ticket.assignedTechnicianName}):</span>
                <p className="italic">"{ticket.technicianNotes}"</p>
              </div>
            )}
          </div>

          {/* Verification Decision Tabs */}
          <div>
            <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
              Kết luận thẩm tra của Ban Quản Lý:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 mb-3">
              <button
                type="button"
                onClick={() => {
                  setDecision('VALID');
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  decision === 'VALID'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Khiếu nại HỢP LỆ
              </button>

              <button
                type="button"
                onClick={() => {
                  setDecision('INVALID');
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  decision === 'INVALID'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <X className="w-3.5 h-3.5" /> Không hợp lệ
              </button>
            </div>

            {decision === 'VALID' ? (
              <div className="space-y-3 p-3 rounded-2xl bg-rose-50/70 border border-rose-200">
                <p className="text-[11px] text-rose-900 font-medium">
                  ✓ Khiếu nại được công nhận hợp lệ. Hệ thống sẽ chuyển phiếu về trạng thái <strong>Sửa chữa lại</strong> và điều phối kỹ thuật viên phụ trách khắc phục.
                </p>

                {/* Technician Reassignment */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Điều phối Kỹ thuật viên xử lý lại:
                  </label>
                  <select
                    value={selectedKtvId}
                    onChange={(e) => setSelectedKtvId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-medium"
                  >
                    {AVAILABLE_TECHNICIANS.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name} • {tech.specialty} ({tech.phone}) {tech.id === ticket.assignedTechnicianId ? '(KTV cũ)' : '(KTV mới)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Chỉ đạo kỹ thuật & Biện pháp khắc phục:
                  </label>
                  <textarea
                    rows={2}
                    value={directionNote}
                    onChange={(e) => {
                      setDirectionNote(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Nhập yêu cầu chỉ đạo KTV xử lý dứt điểm sự cố..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-3 rounded-2xl bg-slate-100 border border-slate-200">
                <p className="text-[11px] text-slate-700 font-medium">
                  Kết luận khiếu nại không hợp lệ. Hệ thống sẽ lưu trữ biên bản thẩm tra và gửi văn bản thông báo kết quả xác minh cho cư dân.
                </p>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Căn cứ & Lý do xác minh không hợp lệ:
                  </label>
                  <textarea
                    rows={3}
                    value={invalidReason}
                    onChange={(e) => {
                      setInvalidReason(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Giải thích rõ cơ sở kỹ thuật và quy chế tòa nhà..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-700 resize-none"
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <p className="text-[10px] text-rose-600 font-semibold mt-1.5">{errorMsg}</p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-white shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            className={`w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              decision === 'VALID'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-slate-800 hover:bg-slate-900'
            }`}
          >
            {decision === 'VALID' ? (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Xác Nhận Hợp Lệ & Điều Phối KTV Xử Lý Lại</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                <span>Xác Nhận Không Hợp Lệ & Thông Báo Cư Dân</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
