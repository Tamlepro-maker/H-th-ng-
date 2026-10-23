import React from 'react';
import { 
  X, 
  CheckCircle, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Layers, 
  AlertTriangle, 
  Wrench, 
  ArrowRight,
  ShieldAlert,
  Star,
  Tag
} from 'lucide-react';
import { MaintenanceTicket, UserRole } from '../types';
import { StatusBadge, PriorityBadge, ScopeBadge } from './StatusBadge';
import { SlaBadge } from './SlaBadge';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: MaintenanceTicket | null;
  currentUserRole: UserRole;
  onOpenClassify?: (ticket: MaintenanceTicket) => void;
  onOpenAcceptance?: (ticket: MaintenanceTicket) => void;
  onOpenAssign?: (ticket: MaintenanceTicket) => void;
  onOpenVerifyComplaint?: (ticket: MaintenanceTicket) => void;
  onKtvAction?: (ticket: MaintenanceTicket) => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  isOpen,
  onClose,
  ticket,
  currentUserRole,
  onOpenClassify,
  onOpenAcceptance,
  onOpenAssign,
  onOpenVerifyComplaint,
  onKtvAction,
}) => {
  if (!isOpen || !ticket) return null;

  const steps = [
    { num: 1, title: 'Khởi tạo phản ánh', desc: 'Cư dân gửi yêu cầu & minh chứng' },
    { num: 2, title: 'Ban Quản Lý duyệt', desc: 'Phân loại mức độ & giao KTV' },
    { num: 3, title: 'KTV đang xử lý', desc: 'Khảo sát & sửa chữa tại chỗ' },
    { num: 4, title: 'Chờ nghiệm thu', desc: 'Kiểm tra đối chứng Trước/Sau' },
    { num: 5, title: 'Đóng phiếu', desc: 'Nghiệm thu ĐẠT & lưu lịch sử' },
  ];

  let currentStep = 1;
  if (ticket.status === 'CHO_DUYET') currentStep = 1;
  else if (ticket.status === 'DANG_XU_LY') currentStep = ticket.beforePhotos?.length ? 3 : 2;
  else if (ticket.status === 'CHO_NGHIEM_THU') currentStep = 4;
  else if (ticket.status === 'CHO_XAC_MINH_KHIEU_NAI') currentStep = 4;
  else if (ticket.status === 'DA_NGHIEM_THU') currentStep = 5;

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex flex-col text-left">
      <div className="bg-white h-full flex flex-col">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              {ticket.id}
            </span>
            <StatusBadge status={ticket.status} size="sm" />
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs text-slate-800">
          
          {/* Title and metadata */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">{ticket.title}</h3>
            
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <PriorityBadge priority={ticket.priority} />
              <ScopeBadge scope={ticket.scope} />
              <SlaBadge deadline={ticket.slaDeadline} priority={ticket.priority} status={ticket.status} />
            </div>

            <div className="pt-2 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Vị trí:</span>
                <strong className="text-slate-800">{ticket.location}</strong>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500">
                <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Người báo:</span>
                <span className="text-slate-800 font-medium">{ticket.residentName} ({ticket.apartmentCode}) - {ticket.residentPhone}</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Thời điểm tạo:</span>
                <span className="text-slate-700">{new Date(ticket.createdAt).toLocaleString('vi-VN')}</span>
              </div>

              {ticket.technicalDept && (
                <div className="flex items-center gap-1.5 text-indigo-700 pt-0.5">
                  <Wrench className="w-3.5 h-3.5 shrink-0" />
                  <span>Bộ phận kỹ thuật:</span>
                  <strong>{ticket.technicalDept}</strong>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Mô tả sự cố:</span>
              <p className="text-[11px] text-slate-800 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200">
                {ticket.description}
              </p>
            </div>
          </div>

          {/* 48-Hour Auto Close Reminder Banner for SO_HUU_RIENG */}
          {ticket.status === 'CHO_NGHIEM_THU' && ticket.scope === 'SO_HUU_RIENG' && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-blue-900">Thời hạn nghiệm thu tự động (48 Giờ)</div>
                  <div className="text-[10px] text-slate-600">Hệ thống sẽ tự động đóng phiếu sau 48h nếu không có phản hồi</div>
                </div>
              </div>
            </div>
          )}

          {/* Active Complaint Box if under verification */}
          {ticket.status === 'CHO_XAC_MINH_KHIEU_NAI' && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Cư dân gửi khiếu nại chưa đạt
                </span>
                <span className="text-[10px] text-rose-700 font-bold bg-white px-2 py-0.5 rounded-md border border-rose-200">
                  Chờ BQL xác minh
                </span>
              </div>
              <p className="text-[11px] text-slate-800 italic bg-white p-2 rounded-xl border border-rose-200">
                "{ticket.complaint?.reason || ticket.rejectionReason}"
              </p>
            </div>
          )}

          {/* Progress Timeline */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-3">
              Tiến trình xử lý sự cố
            </h4>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {steps.map((st) => {
                const isPast = currentStep > st.num;
                const isCurrent = currentStep === st.num;
                return (
                  <div key={st.num} className="relative">
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                        isPast
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-blue-600 border-blue-500 text-white shadow-xs ring-2 ring-blue-500/20'
                          : 'bg-slate-100 border-slate-300 text-slate-500'
                      }`}
                    >
                      {isPast ? '✓' : st.num}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isCurrent ? 'text-blue-700' : isPast ? 'text-slate-800' : 'text-slate-500'}`}>
                          {st.title}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                            Đang xử lý
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Technician Card */}
          {ticket.assignedTechnicianName && (
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700 font-bold text-xs">
                  KTV
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Kỹ thuật viên phụ trách:</span>
                  <h5 className="text-xs font-bold text-slate-900">{ticket.assignedTechnicianName}</h5>
                  <span className="text-[10px] text-blue-700 font-mono font-medium">{ticket.assignedTechnicianPhone}</span>
                </div>
              </div>

              <a
                href={`tel:${ticket.assignedTechnicianPhone}`}
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Mô phỏng gọi điện thoại đến KTV: ${ticket.assignedTechnicianName} (${ticket.assignedTechnicianPhone})`);
                }}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                title="Gọi KTV"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Evidence Media */}
          {ticket.initialMedia && ticket.initialMedia.length > 0 && (
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-700 uppercase block mb-2">
                Ảnh / Video Cư dân gửi ({ticket.initialMedia.length} tệp)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {ticket.initialMedia.map((m) => (
                  <div key={m.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    {m.type === 'image' ? (
                      <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-purple-700 text-[10px] font-semibold">
                        Video
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Before / After Photos */}
          {(ticket.beforePhotos?.length > 0 || ticket.afterPhotos?.length > 0) && (
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-700 uppercase block">
                Minh chứng KTV cập nhật tại hiện trường
              </span>
              <div className="grid grid-cols-2 gap-2">
                {ticket.beforePhotos?.[0] && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-amber-800 font-semibold">Ảnh Trước (Before):</span>
                    <img src={ticket.beforePhotos[0].url} alt="Before" className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                    {ticket.beforePhotos[0].watermark && (
                      <span className="text-[8px] text-slate-500 block truncate font-mono">{ticket.beforePhotos[0].watermark}</span>
                    )}
                  </div>
                )}
                {ticket.afterPhotos?.[0] && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-emerald-800 font-semibold">Ảnh Sau (After):</span>
                    <img src={ticket.afterPhotos[0].url} alt="After" className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                    <span className="text-[8px] text-emerald-700 block font-semibold">Đã hoàn tất</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rating */}
          {ticket.status === 'DA_NGHIEM_THU' && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-900">Đã nghiệm thu ĐẠT</span>
                <div className="flex text-amber-500">
                  {Array.from({ length: ticket.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
              </div>
              {ticket.ratingFeedback && (
                <p className="text-[10px] text-slate-700 italic">"{ticket.ratingFeedback}"</p>
              )}
            </div>
          )}

          {/* Audit Trail */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Nhật ký xử lý:</span>
            <div className="space-y-2 text-[10px]">
              {ticket.timeline.map((ev, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-700">
                  <span className="text-slate-400 font-mono shrink-0">
                    {new Date(ev.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}:
                  </span>
                  <div>
                    <strong className="text-slate-900">{ev.actor}</strong> ({ev.actorRole}): {ev.title}
                    {ev.note && <div className="text-slate-500 mt-0.5">{ev.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-200 bg-white shrink-0">
          {ticket.status === 'CHO_NGHIEM_THU' && onOpenAcceptance && (
            <button
              type="button"
              onClick={() => {
                onOpenAcceptance(ticket);
                onClose();
              }}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer animate-pulse"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Tiến Hành Nghiệm Thu Ngay</span>
            </button>
          )}

          {ticket.status === 'CHO_XAC_MINH_KHIEU_NAI' && currentUserRole === 'BQL' && onOpenVerifyComplaint && (
            <button
              type="button"
              onClick={() => {
                onOpenVerifyComplaint(ticket);
                onClose();
              }}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer animate-pulse"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Xác Minh Khiếu Nại & Điều Phối KTV</span>
            </button>
          )}

          {ticket.status === 'CHO_DUYET' && currentUserRole === 'BQL' && (
            <div className="grid grid-cols-2 gap-2">
              {onOpenClassify && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenClassify(ticket);
                    onClose();
                  }}
                  className="py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  <span>Phân Loại Ưu Tiên</span>
                </button>
              )}

              {onOpenAssign && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAssign(ticket);
                    onClose();
                  }}
                  className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>Giao KTV</span>
                </button>
              )}
            </div>
          )}

          {ticket.status === 'DANG_XU_LY' && currentUserRole === 'KTV' && onKtvAction && (
            <button
              type="button"
              onClick={() => {
                onKtvAction(ticket);
                onClose();
              }}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>
                {ticket.beforePhotos?.length ? 'Cập Nhật Kết Quả & Gửi Nghiệm Thu' : 'Tiếp Nhận & Chụp Ảnh Before'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
