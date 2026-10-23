import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  CheckCircle2, 
  RotateCcw, 
  Star, 
  AlertTriangle, 
  Wrench, 
  Clock, 
  Camera, 
  Upload, 
  Image as ImageIcon,
  ShieldAlert,
  ArrowRight,
  Info,
  Check,
  FastForward
} from 'lucide-react';
import { MaintenanceTicket, TicketMedia, UserProfile } from '../../types';

interface AcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: MaintenanceTicket;
  currentUser: UserProfile;
  onApprove: (ticketId: string, rating?: number, feedback?: string) => void;
  onReject: (ticketId: string, reason: string, faultPhotos: TicketMedia[]) => void;
  onAutoCloseSimulation?: (ticketId: string) => void;
}

export const AcceptanceModal: React.FC<AcceptanceModalProps> = ({
  isOpen,
  onClose,
  ticket,
  currentUser,
  onApprove,
  onReject,
  onAutoCloseSimulation,
}) => {
  const [activeTab, setActiveTab] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState('Kỹ thuật viên xử lý nhanh, tác phong chuyên nghiệp, vệ sinh sạch sẽ.');
  
  const [rejectReason, setRejectReason] = useState('');
  const [rejectPhotos, setRejectPhotos] = useState<TicketMedia[]>([]);
  const [rejectError, setRejectError] = useState('');
  const [saveError, setSaveError] = useState('');

  // 48h Countdown Calculation for SO_HUU_RIENG
  const [remainingTime, setRemainingTime] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 48,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  const isPrivate = ticket.scope === 'SO_HUU_RIENG';
  const isCommon = ticket.scope === 'SO_HUU_CHUNG';
  const isBql = currentUser.role === 'BQL';
  const isResident = currentUser.role === 'RESIDENT';
  const isKtv = currentUser.role === 'KTV';

  // Permission Verification (E1: Không có quyền truy cập)
  const permissionError = useMemo(() => {
    if (isKtv) {
      return 'Kỹ thuật viên không có quyền nghiệm thu phiếu. Chỉ cư dân sở hữu căn hộ hoặc Ban Quản Lý mới có thẩm quyền này.';
    }
    if (isCommon && isResident) {
      return 'Tài sản chung thuộc thẩm quyền kiểm tra và nghiệm thu của Ban Quản Lý tòa nhà. Cư dân không có thẩm quyền đóng phiếu này.';
    }
    if (isPrivate && isResident && currentUser.apartmentCode && ticket.apartmentCode !== currentUser.apartmentCode) {
      return `Bạn không có quyền nghiệm thu sự cố của căn hộ ${ticket.apartmentCode}. Vui lòng đăng nhập đúng tài khoản sở hữu căn hộ.`;
    }
    return null;
  }, [isKtv, isCommon, isResident, currentUser, ticket]);

  // Missing Repair Data Verification (E2: Thiếu thông tin sửa chữa)
  const isMissingRepairData = useMemo(() => {
    const hasPhotos = ticket.afterPhotos && ticket.afterPhotos.length > 0;
    const hasNotes = ticket.technicianNotes && ticket.technicianNotes.trim().length > 0;
    return !hasPhotos && !hasNotes;
  }, [ticket]);

  // Real-time 48h countdown calculation
  useEffect(() => {
    if (!isPrivate || !isOpen) return;

    const calculateRemaining = () => {
      // Calculate target time: 48h from submittedAt or fallback to 48h from now
      const submittedTime = ticket.submittedAt ? new Date(ticket.submittedAt).getTime() : Date.now();
      const targetTime = ticket.autoCloseAt 
        ? new Date(ticket.autoCloseAt).getTime() 
        : submittedTime + 48 * 3600 * 1000;

      const diffMs = targetTime - Date.now();

      if (diffMs <= 0) {
        setRemainingTime({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const totalSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setRemainingTime({ hours, minutes, seconds, isExpired: false });
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [isPrivate, ticket.submittedAt, ticket.autoCloseAt, isOpen]);

  if (!isOpen) return null;

  const totalMaterialCost = ticket.materialsUsed?.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) || 0;

  // Handle Approve with optional Rating (or Skip rating for Resident; BQL never rates)
  const handleApproveWithRating = () => {
    try {
      setSaveError('');
      if (isPrivate) {
        onApprove(ticket.id, rating, feedback);
      } else {
        // Tài sản chung: Ban quản lý không cần đánh giá
        onApprove(ticket.id, undefined, '');
      }
      onClose();
    } catch (err) {
      setSaveError('Lưu kết quả thất bại. Vui lòng thử lại sau.');
    }
  };

  const handleApproveSkipRating = () => {
    try {
      setSaveError('');
      // Resident explicitly skips rating
      onApprove(ticket.id, undefined, '');
      onClose();
    } catch (err) {
      setSaveError('Lưu kết quả thất bại. Vui lòng thử lại sau.');
    }
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      setRejectError(
        isPrivate 
          ? 'Vui lòng nêu rõ lý do chưa đạt để Ban Quản Lý xác minh khiếu nại' 
          : 'Vui lòng ghi nhận lý do chưa đạt để KTV sửa chữa lại'
      );
      return;
    }
    try {
      setSaveError('');
      onReject(ticket.id, rejectReason.trim(), rejectPhotos);
      onClose();
    } catch (err) {
      setSaveError('Lưu phản hồi thất bại. Vui lòng thử lại sau.');
    }
  };

  const handleRejectPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos: TicketMedia[] = Array.from(files).map((f, i) => ({
      id: 'fault_' + Date.now() + '_' + i,
      name: f.name,
      url: URL.createObjectURL(f),
      type: 'image',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }));
    setRejectPhotos((prev) => [...prev, ...newPhotos]);
    e.target.value = '';
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex flex-col text-left">
      <div className="bg-white h-full flex flex-col">
        {/* Header */}
        <div className="p-2.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-2xs">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {ticket.id}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                isCommon 
                  ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' 
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                {isCommon ? 'Nghiệm thu tài sản chung' : 'Nghiệm thu căn hộ'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              {isCommon ? 'Ban Quản Lý kiểm tra & đối chiếu kỹ thuật' : 'Cư dân kiểm tra chất lượng sửa chữa'}
            </p>
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

          {/* PERMISSION ERROR BANNER (E1) */}
          {permissionError && (
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Không có quyền nghiệm thu</span>
              </div>
              <p className="text-[10px] text-rose-700 leading-relaxed">{permissionError}</p>
            </div>
          )}

          {/* 48-HOUR COUNTDOWN BADGE (SO_HUU_RIENG) */}
          {isPrivate && (
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" /> Hạn nghiệm thu (48 Giờ)
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] font-extrabold text-blue-700 bg-white px-1.5 py-0.2 rounded border border-blue-200 shadow-2xs">
                    {remainingTime.hours.toString().padStart(2, '0')}:
                    {remainingTime.minutes.toString().padStart(2, '0')}:
                    {remainingTime.seconds.toString().padStart(2, '0')}
                  </span>
                  {onAutoCloseSimulation && (
                    <button
                      type="button"
                      onClick={() => {
                        onAutoCloseSimulation(ticket.id);
                        onClose();
                      }}
                      className="px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] cursor-pointer"
                      title="Mô phỏng tự động đóng phiếu sau 48h"
                    >
                      Giả lập 48h
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">
                Tự động đóng phiếu sau 48h nếu không có phản hồi nghiệm thu hoặc khiếu nại.
              </p>
            </div>
          )}

          {/* MISSING DATA WARNING BANNER (E2) */}
          {isMissingRepairData && (
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-0.5">
              <div className="flex items-center gap-1 font-bold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Dữ liệu chưa đầy đủ để nghiệm thu</span>
              </div>
              <p className="text-[10px] text-amber-800 leading-relaxed">
                Kỹ thuật viên chưa tải lên ảnh đối chứng sau xử lý.
              </p>
            </div>
          )}

          {/* SAVE ERROR (E3) */}
          {saveError && (
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs">
              {saveError}
            </div>
          )}
          
          {/* Summary */}
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs">{ticket.title}</h4>
            <div className="flex items-center justify-between text-[10px] text-slate-600 mt-0.5">
              <span>Vị trí: <strong className="text-slate-800">{ticket.location}</strong></span>
              <span>KTV: <strong className="text-amber-800">{ticket.assignedTechnicianName || 'Lê Kỹ Thuật'}</strong></span>
            </div>
          </div>

          {/* Before vs After Photos */}
          <div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-rose-700 block">1. Trước (Before):</span>
                <div className="relative h-22 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                  {ticket.beforePhotos && ticket.beforePhotos.length > 0 ? (
                    <img
                      src={ticket.beforePhotos[0].url}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                  ) : ticket.initialMedia && ticket.initialMedia.length > 0 ? (
                    <img
                      src={ticket.initialMedia[0].url}
                      alt="Initial"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[9px] text-slate-400">Chưa có ảnh</span>
                  )}
                  <span className="absolute bottom-0.5 left-0.5 px-1 py-0.2 rounded bg-black/70 text-[8px] text-white">
                    {ticket.beforePhotos?.[0]?.watermark ? 'Before (GPS)' : 'Ban đầu'}
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-emerald-700 block">2. Sau (After):</span>
                <div className="relative h-22 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                  {ticket.afterPhotos && ticket.afterPhotos.length > 0 ? (
                    <img
                      src={ticket.afterPhotos[0].url}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[9px] text-slate-400">Chưa có ảnh After</span>
                  )}
                  <span className="absolute bottom-0.5 left-0.5 px-1 py-0.2 rounded bg-black/70 text-[8px] text-emerald-300">
                    Đã hoàn tất
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Technician Notes */}
          {ticket.technicianNotes && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Ghi chú của KTV:</span>
              <p className="text-[11px] text-slate-800 italic leading-relaxed">
                "{ticket.technicianNotes}"
              </p>
            </div>
          )}

          {/* Materials */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Wrench className="w-3 h-3 text-amber-600" /> Vật tư kỹ thuật ({ticket.materialsUsed?.length || 0})
              </h5>
              <span className="text-[10px] font-mono text-emerald-700 font-bold">
                {totalMaterialCost > 0 ? `${totalMaterialCost.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
              </span>
            </div>

            <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 divide-y divide-slate-200 text-[10px] max-h-16 overflow-y-auto">
              {ticket.materialsUsed && ticket.materialsUsed.length > 0 ? (
                ticket.materialsUsed.map((m, idx) => (
                  <div key={idx} className="p-1.5 flex items-center justify-between">
                    <div>
                      <span className="text-slate-900 font-medium">{m.name}</span>
                      <span className="text-[9px] text-slate-500 ml-1">({m.quantity} {m.unit})</span>
                    </div>
                    <div className="font-mono text-slate-900 font-semibold">
                      {(m.unitPrice * m.quantity).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-1.5 text-center text-slate-400 text-[10px]">
                  Không phát sinh vật tư (Chỉ cân chỉnh kỹ thuật)
                </div>
              )}
            </div>
          </div>

          {/* ACTION SECTION: ONLY SHOWN IF PERMISSION GRANTED */}
          {!permissionError && (
            <div className="pt-1">
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 mb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('APPROVE')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'APPROVE'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Nghiệm thu ĐẠT
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('REJECT')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeTab === 'REJECT'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" /> 
                  <span>{isPrivate ? 'Khiếu nại chưa đạt' : 'Ghi nhận chưa đạt'}</span>
                </button>
              </div>

              {/* TAB 1: KẾT QUẢ ĐẠT */}
              {activeTab === 'APPROVE' ? (
                <div className="space-y-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  
                  {/* TÀI SẢN RIÊNG: Cư dân có thể đánh giá dịch vụ hoặc bỏ qua */}
                  {isPrivate ? (
                    <>
                      <div className="text-center">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-emerald-900">
                            Đánh giá chất lượng phục vụ (Tùy chọn)
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium">
                            {rating === 5 && '5⭐ Rất hài lòng'}
                            {rating === 4 && '4⭐ Hài lòng'}
                            {rating === 3 && '3⭐ Bình thường'}
                            {rating <= 2 && '2⭐ Cần cải thiện'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="p-0.5 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <textarea
                          rows={1}
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Ý kiến nhận xét thêm..."
                          className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 resize-none"
                        />
                      </div>

                      {/* 2 options for Resident: Rate & Approve OR Skip rating & Approve */}
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={handleApproveWithRating}
                          className="py-2 px-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đạt & Gửi Đánh Giá</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleApproveSkipRating}
                          className="py-2 px-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-[10px] rounded-lg transition-all cursor-pointer text-center"
                        >
                          <span>Bỏ qua đánh giá & Đóng</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    /* TÀI SẢN CHUNG: Ban Quản Lý KHÔNG CẦN ĐÁNH GIÁ */
                    <div className="space-y-2.5">
                      <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-950 text-[11px] leading-relaxed">
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Xác nhận đạt tiêu chuẩn vận hành tòa nhà</span>
                        </div>
                        <p className="text-slate-600 text-[10px]">
                          Ban Quản Lý trực tiếp thẩm định hiện trường tài sản chung. Sau khi xác nhận đạt, phiếu sự cố sẽ được đóng và chuyển vào cơ sở dữ liệu lịch sử bảo trì.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleApproveWithRating}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Ban Quản Lý Xác Nhận Nghiệm Thu Đạt</span>
                      </button>
                    </div>
                  )}

                  <p className="text-[10px] text-center text-slate-500">
                    Sau khi đóng, phiếu sự cố sẽ được lưu trữ trong mục <strong>"Lịch sử"</strong>.
                  </p>
                </div>
              ) : (
                /* TAB 2: KẾT QUẢ CHƯA ĐẠT (A1) */
                <div className="space-y-3 p-3 rounded-2xl bg-rose-50/70 border border-rose-200">
                  <div className="p-2 rounded-xl bg-white border border-rose-200 text-[11px]">
                    <strong className="text-rose-900 block mb-0.5">
                      {isPrivate ? 'Cư dân gửi khiếu nại chưa đạt:' : 'Ban Quản Lý ghi nhận lý do chưa đạt:'}
                    </strong>
                    <p className="text-slate-600 text-[10px]">
                      {isPrivate 
                        ? 'Khiếu nại sẽ được chuyển đến Ban Quản Lý để xác minh thực tế và điều phối lại kỹ thuật viên.'
                        : 'Hệ thống sẽ chuyển phiếu trực tiếp về kỹ thuật viên phụ trách để khắc phục lại hiện trường.'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-rose-900 mb-1">
                      Lý do chưa đạt yêu cầu <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => {
                        setRejectReason(e.target.value);
                        setRejectError('');
                      }}
                      placeholder={isPrivate ? "Mô tả chi tiết những điểm KTV chưa khắc phục triệt để..." : "Ghi nhận lỗi kỹ thuật còn tồn tại cần xử lý lại..."}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 resize-none"
                    />
                    {rejectError && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{rejectError}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-1">
                      Đính kèm ảnh chụp lỗi (nếu có):
                    </label>
                    <label className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-[10px] rounded-xl text-center cursor-pointer flex items-center justify-center gap-1">
                      <Upload className="w-3 h-3 text-rose-600" /> Tải ảnh lỗi từ máy
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleRejectPhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {rejectPhotos.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {rejectPhotos.map((p) => (
                          <img key={p.id} src={p.url} alt="Fault" className="w-12 h-12 object-cover rounded-lg border border-rose-300" />
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleRejectSubmit}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{isPrivate ? 'Gửi Khiếu Nại Lên Ban Quản Lý' : 'Chuyển Kỹ Thuật Viên Sửa Chữa Lại'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
