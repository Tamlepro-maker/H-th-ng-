import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Wrench, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  DollarSign, 
  Send, 
  Image as ImageIcon,
  MapPin,
  Clock
} from 'lucide-react';
import { MaintenanceTicket, TicketMedia, MaterialItem } from '../../types';
import { WAREHOUSE_MATERIALS } from '../../mockData';

interface KtvActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: MaintenanceTicket;
  onAcceptWithBefore: (ticketId: string, beforePhotos: TicketMedia[], note?: string) => void;
  onSubmitCompletion: (ticketId: string, afterPhotos: TicketMedia[], materials: MaterialItem[], notes: string) => void;
}

export const KtvActionModal: React.FC<KtvActionModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onAcceptWithBefore,
  onSubmitCompletion,
}) => {
  const isStepBefore = !ticket.beforePhotos || ticket.beforePhotos.length === 0;

  const [beforePhotos, setBeforePhotos] = useState<TicketMedia[]>([]);
  const [acceptNote, setAcceptNote] = useState('');
  const [beforeError, setBeforeError] = useState('');

  const [afterPhotos, setAfterPhotos] = useState<TicketMedia[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialItem[]>([]);
  const [techNotes, setTechNotes] = useState('Đã hoàn tất khắc phục sự cố, thay linh kiện mới và thử nghiệm tải hoạt động bình thường, không rò rỉ.');
  const [completionError, setCompletionError] = useState('');

  if (!isOpen) return null;

  const addWatermarkedPhoto = (file: File, type: 'before' | 'after') => {
    const url = URL.createObjectURL(file);
    const now = new Date();
    const timestampStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.toLocaleDateString('vi-VN')}`;
    const gpsCoord = 'GPS: 10.7769° N, 106.7009° E';
    const watermark = `${gpsCoord} | ${timestampStr}`;

    const newPhoto: TicketMedia = {
      id: `${type}_` + Date.now() + Math.random().toString(36).substring(2, 5),
      name: file.name,
      url,
      type: 'image',
      timestamp: timestampStr,
      watermark,
    };

    if (type === 'before') {
      setBeforePhotos((prev) => [...prev, newPhoto]);
      setBeforeError('');
    } else {
      setAfterPhotos((prev) => [...prev, newPhoto]);
      setCompletionError('');
    }
  };

  const handleQuickAddDemoBefore = () => {
    const now = new Date();
    const timestampStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.toLocaleDateString('vi-VN')}`;
    setBeforePhotos([
      {
        id: 'b_demo_' + Date.now(),
        name: 'hien_truong_ban_dau.jpg',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
        type: 'image',
        timestamp: timestampStr,
        watermark: `GPS: 10.7769° N, 106.7009° E | ${timestampStr}`,
      },
    ]);
    setBeforeError('');
  };

  const handleQuickAddDemoAfter = () => {
    const now = new Date();
    const timestampStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.toLocaleDateString('vi-VN')}`;
    setAfterPhotos([
      {
        id: 'a_demo_' + Date.now(),
        name: 'sau_khi_sua_chua.jpg',
        url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80',
        type: 'image',
        timestamp: timestampStr,
        watermark: `GPS: 10.7769° N, 106.7009° E | ${timestampStr}`,
      },
    ]);
    setCompletionError('');
  };

  const handleAddMaterial = (matId: string) => {
    const mat = WAREHOUSE_MATERIALS.find((m) => m.id === matId);
    if (!mat) return;
    const existingIndex = selectedMaterials.findIndex((m) => m.id === matId);
    if (existingIndex >= 0) {
      setSelectedMaterials((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setSelectedMaterials((prev) => [...prev, { ...mat, quantity: 1 }]);
    }
  };

  const handleRemoveMaterial = (matId: string) => {
    setSelectedMaterials((prev) => prev.filter((m) => m.id !== matId));
  };

  const handleBeforeSubmit = () => {
    if (beforePhotos.length === 0) {
      setBeforeError('SRS bắt buộc: KTV phải chụp/tải ít nhất 01 ảnh Before khi đến hiện trường');
      return;
    }
    onAcceptWithBefore(ticket.id, beforePhotos, acceptNote);
    onClose();
  };

  const handleCompletionSubmit = () => {
    if (afterPhotos.length === 0) {
      setCompletionError('SRS bắt buộc: KTV phải chụp/tải ít nhất 01 ảnh After sau khi sửa xong');
      return;
    }
    if (!techNotes.trim()) {
      setCompletionError('Vui lòng nhập ghi chú kỹ thuật tóm tắt công việc đã làm');
      return;
    }
    onSubmitCompletion(ticket.id, afterPhotos, selectedMaterials, techNotes);
    onClose();
  };

  const totalCost = selectedMaterials.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex flex-col text-left">
      <div className="bg-white h-full flex flex-col">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-2xs">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-amber-700">{ticket.id}</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {isStepBefore ? 'Bước 1: Tiếp nhận & Ảnh Before' : 'Bước 2: Cập nhật sửa chữa & Nghiệm thu'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Quy trình UC03: Cập nhật xử lý kỹ thuật KTV</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs text-slate-800">
          
          {/* Header Brief */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs">{ticket.title}</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Vị trí: <strong className="text-slate-700">{ticket.location}</strong></p>
            <p className="text-[11px] text-slate-500">Căn hộ: <strong className="text-blue-700">{ticket.apartmentCode}</strong> ({ticket.residentName})</p>
          </div>

          {isStepBefore ? (
            /* STEP 1: BEFORE PHOTO UPLOAD WITH WATERMARK */
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <strong className="text-xs font-bold block flex items-center gap-1.5 text-amber-800">
                  <Camera className="w-4 h-4 text-amber-600" /> Chụp ảnh hiện trường ban đầu (Before)
                </strong>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Hệ thống sẽ tự động đóng dấu <strong>Tọa độ GPS</strong> và <strong>Thời gian thực</strong> vào ảnh để làm căn cứ đối chứng.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <label className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-center cursor-pointer flex flex-col items-center justify-center gap-1 text-[11px] text-slate-800 font-semibold shadow-2xs">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Chụp ảnh thực tế</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => e.target.files?.[0] && addWatermarkedPhoto(e.target.files[0], 'before')}
                      className="hidden"
                    />
                  </label>

                  <label className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-center cursor-pointer flex flex-col items-center justify-center gap-1 text-[11px] text-slate-800 font-semibold shadow-2xs">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>Tải ảnh từ máy</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && addWatermarkedPhoto(e.target.files[0], 'before')}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleQuickAddDemoBefore}
                  className="w-full py-2 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>⚡ Nạp nhanh ảnh Before mẫu có GPS & Giờ</span>
                </button>
              </div>

              {/* Previews */}
              {beforePhotos.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Ảnh Before đã chụp:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {beforePhotos.map((p) => (
                      <div key={p.id} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                        <img src={p.url} alt="Before preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 p-1 bg-black/75 text-[8px] text-amber-300 font-mono leading-tight">
                          {p.watermark}
                        </div>
                        <button
                          type="button"
                          onClick={() => setBeforePhotos((prev) => prev.filter((item) => item.id !== p.id))}
                          className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {beforeError && <p className="text-[10px] text-rose-600 font-medium">{beforeError}</p>}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ghi chú tiếp nhận (Tùy chọn):
                </label>
                <textarea
                  rows={2}
                  value={acceptNote}
                  onChange={(e) => setAcceptNote(e.target.value)}
                  placeholder="VD: Đã tiếp cận hiện trường lúc 14:15, tiến hành khóa van tổng..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleBeforeSubmit}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tiếp Nhận Hiện Trường & Bắt Đầu Sửa Chữa</span>
              </button>
            </div>
          ) : (
            /* STEP 2: REPAIR IN-PROGRESS */
            <div className="space-y-3.5">
              
              {/* Materials */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" /> Vật tư xuất kho sử dụng:
                  </label>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">
                    Tổng: {totalCost.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <div className="flex gap-1.5 mb-2">
                  <select
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddMaterial(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">+ Chọn vật tư xuất kho...</option>
                    {WAREHOUSE_MATERIALS.map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        {mat.name} ({mat.unitPrice.toLocaleString('vi-VN')} đ/{mat.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedMaterials.length > 0 ? (
                  <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-2">
                    {selectedMaterials.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-1 border-b border-slate-200 last:border-0 text-[11px]">
                        <div>
                          <span className="text-slate-900 font-medium">{item.name}</span>
                          <div className="text-[10px] text-slate-500">{item.unitPrice.toLocaleString('vi-VN')} đ / {item.unit}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-900 font-semibold">
                            {(item.unitPrice * item.quantity).toLocaleString('vi-VN')} đ
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterial(item.id)}
                            className="w-4 h-4 rounded text-rose-600 hover:text-rose-700 flex items-center justify-center font-bold"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-400 text-center">
                    Chưa chọn vật tư thay thế nào (Nếu không thay, bỏ qua)
                  </div>
                )}
              </div>

              {/* After Photo */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> Ảnh sau khi sửa chữa (After) <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Chụp linh kiện mới/cũ</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <label className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-center cursor-pointer flex items-center justify-center gap-1 text-[11px] text-slate-800 font-semibold shadow-2xs">
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chụp ảnh After</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => e.target.files?.[0] && addWatermarkedPhoto(e.target.files[0], 'after')}
                      className="hidden"
                    />
                  </label>

                  <label className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-center cursor-pointer flex items-center justify-center gap-1 text-[11px] text-slate-800 font-semibold shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tải từ máy</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && addWatermarkedPhoto(e.target.files[0], 'after')}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleQuickAddDemoAfter}
                  className="w-full py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>⚡ Nạp nhanh ảnh After hoàn thiện mẫu</span>
                </button>

                {afterPhotos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {afterPhotos.map((p) => (
                      <div key={p.id} className="relative rounded-xl overflow-hidden border border-emerald-300 aspect-video bg-slate-100">
                        <img src={p.url} alt="After preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 p-1 bg-black/75 text-[8px] text-emerald-300 font-mono leading-tight">
                          {p.watermark}
                        </div>
                        <button
                          type="button"
                          onClick={() => setAfterPhotos((prev) => prev.filter((item) => item.id !== p.id))}
                          className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-900 mb-1">
                  Ghi chú kỹ thuật & Kết quả xử lý <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={techNotes}
                  onChange={(e) => {
                    setTechNotes(e.target.value);
                    setCompletionError('');
                  }}
                  placeholder="Mô tả các thao tác đã thực hiện..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {completionError && <p className="text-[10px] text-rose-600 font-medium">{completionError}</p>}

              <button
                type="button"
                onClick={handleCompletionSubmit}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Gửi Báo Cáo Hoàn Thành (Chờ Nghiệm Thu)</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
