import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  AlertCircle, 
  Image as ImageIcon, 
  Video, 
  Trash2, 
  Sparkles, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { 
  UserProfile, 
  PropertyScope, 
  IncidentCategory, 
  Priority, 
  TicketMedia, 
  MaintenanceTicket 
} from '../../types';
import { DEMO_PRESET_IMAGES } from '../../mockData';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSubmit: (params: {
    title: string;
    scope: PropertyScope;
    category: IncidentCategory;
    location: string;
    description: string;
    priority: Priority;
    media: TicketMedia[];
  }) => MaintenanceTicket;
  checkForDuplicates: (scope: PropertyScope, location: string, category: IncidentCategory) => MaintenanceTicket | null;
  onFollowExisting: (ticketId: string) => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmit,
  checkForDuplicates,
  onFollowExisting,
}) => {
  const [scope, setScope] = useState<PropertyScope | ''>('');
  const [category, setCategory] = useState<IncidentCategory | ''>('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [mediaList, setMediaList] = useState<TicketMedia[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateFound, setDuplicateFound] = useState<MaintenanceTicket | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newItems: TicketMedia[] = [];
    Array.from(files).forEach((file, index) => {
      const isVideo = file.type.startsWith('video/');
      const url = URL.createObjectURL(file);
      newItems.push({
        id: 'file_' + Date.now() + '_' + index,
        name: file.name,
        url,
        type: isVideo ? 'video' : 'image',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      });
    });

    setMediaList((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleQuickAddRequiredMedia = () => {
    const sampleMedia: TicketMedia[] = [
      {
        id: 'req_1',
        name: 'hien-truong-tong-quan.jpg',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
        type: 'image',
        timestamp: '14:20',
      },
      {
        id: 'req_2',
        name: 'vi-tri-chi-tiet-nut-vo.jpg',
        url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80',
        type: 'image',
        timestamp: '14:21',
      },
      {
        id: 'req_3',
        name: 'khu-vuc-anh-huong-san.jpg',
        url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&auto=format&fit=crop&q=80',
        type: 'image',
        timestamp: '14:22',
      },
      {
        id: 'req_4',
        name: 'video-hien-truong-chay-nuoc.mp4',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        type: 'video',
        timestamp: '14:23',
      },
    ];
    setMediaList(sampleMedia);
  };

  const removeMedia = (id: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== id));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!scope) newErrors.scope = 'Vui lòng chọn phân vùng sở hữu (Riêng hoặc Chung)';
    if (!category) newErrors.category = 'Vui lòng chọn nhóm sự cố';
    if (!location.trim()) newErrors.location = 'Vui lòng nhập vị trí cụ thể';
    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = 'Mô tả cần chi tiết tối thiểu 10 ký tự';
    }
    if (!priority) newErrors.priority = 'Vui lòng chọn mức độ khẩn cấp (P1, P2, P3)';

    const imageCount = mediaList.filter((m) => m.type === 'image').length;
    const videoCount = mediaList.filter((m) => m.type === 'video').length;

    if (imageCount < 3) {
      newErrors.media = `Yêu cầu tối thiểu 3 ảnh hiện trường (Hiện có: ${imageCount} ảnh)`;
    } else if (videoCount < 1) {
      newErrors.media = `Yêu cầu đính kèm 1 video hiện trường (Hiện có: ${videoCount} video)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (scope === 'SO_HUU_CHUNG') {
      const dup = checkForDuplicates('SO_HUU_CHUNG', location, category as IncidentCategory);
      if (dup) {
        setDuplicateFound(dup);
        return;
      }
    }

    onSubmit({
      title: `Sự cố ${category} tại ${location}`,
      scope: scope as PropertyScope,
      category: category as IncidentCategory,
      location,
      description,
      priority: priority as Priority,
      media: mediaList,
    });

    onClose();
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-900/40 backdrop-blur-md flex flex-col text-left">
      <div className="bg-white h-full flex flex-col">
        {/* Top Header */}
        <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-2xs">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tạo Phản Ánh Sự Cố</h3>
            <p className="text-[10px] text-slate-500">Quy trình UC01: Tiếp nhận yêu cầu cư dân</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs text-slate-800">
          
          {/* Readonly Resident Profile Box */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center justify-between">
              <span>Thông tin người gửi (Tự động)</span>
              <span className="text-emerald-700 font-semibold">Đã xác thực</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500">Chủ hộ:</span>{' '}
                <strong className="text-slate-900">{currentUser.name}</strong>
              </div>
              <div>
                <span className="text-slate-500">Căn hộ:</span>{' '}
                <strong className="text-blue-700">{currentUser.apartmentCode || 'P.1204 - Aqua 1'}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">Số điện thoại:</span>{' '}
                <span className="text-slate-700 font-mono">{currentUser.phone}</span>
              </div>
            </div>
          </div>

          {/* Scope Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-900 mb-1">
              Phân vùng sự cố <span className="text-rose-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setScope('SO_HUU_RIENG');
                  setErrors((e) => ({ ...e, scope: '' }));
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  scope === 'SO_HUU_RIENG'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-xs">Sở hữu riêng</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Bên trong căn hộ</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScope('SO_HUU_CHUNG');
                  setErrors((e) => ({ ...e, scope: '' }));
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  scope === 'SO_HUU_CHUNG'
                    ? 'bg-cyan-50 border-cyan-400 text-cyan-900 font-bold ring-2 ring-cyan-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-xs">Sở hữu chung</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Hành lang, thang máy...</div>
              </button>
            </div>
            {errors.scope && <p className="text-[10px] text-rose-600 mt-1">{errors.scope}</p>}
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-900 mb-1">
              Nhóm sự cố <span className="text-rose-600">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as IncidentCategory);
                setErrors((prev) => ({ ...prev, category: '' }));
              }}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Chọn nhóm sự cố cần hỗ trợ --</option>
              <option value="Dien">⚡ Hệ thống Điện (Chập điện, nhảy aptomat, ổ cắm)</option>
              <option value="Nuoc">💧 Hệ thống Cấp thoát nước (Rò rỉ, tắc bồn rửa, van)</option>
              <option value="DieuHoa">❄️ Điều hòa & Thông gió (Không mát, chảy nước)</option>
              <option value="ThangMay">🛗 Thang máy & Cửa tự động</option>
              <option value="ThamDot">🌧️ Thấm dột tường & Trần nhà</option>
              <option value="PCCC">🧯 Báo cháy & Thiết bị PCCC</option>
              <option value="CoKhi">🔧 Cơ khí, khóa cửa & Cửa nhôm kính</option>
              <option value="Khac">📌 Khác</option>
            </select>
            {errors.category && <p className="text-[10px] text-rose-600 mt-1">{errors.category}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-bold text-slate-900 mb-1">
              Vị trí cụ thể <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setErrors((prev) => ({ ...prev, location: '' }));
              }}
              placeholder="VD: Phòng khách gần ban công, Bồn rửa bát bếp, Hành lang tầng 12..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            {errors.location && <p className="text-[10px] text-rose-600 mt-1">{errors.location}</p>}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[11px] font-bold text-slate-900 mb-1">
              Mức độ khẩn cấp (SLA cam kết) <span className="text-rose-600">*</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setPriority('P1');
                  setErrors((e) => ({ ...e, priority: '' }));
                }}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  priority === 'P1'
                    ? 'bg-rose-50 border-rose-400 text-rose-900 font-bold ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] text-rose-700 font-bold">P1 - Khẩn cấp</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Xử lý trong 2h</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPriority('P2');
                  setErrors((e) => ({ ...e, priority: '' }));
                }}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  priority === 'P2'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold ring-2 ring-amber-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] text-amber-800 font-bold">P2 - Cần sớm</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Xử lý trong 6h</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPriority('P3');
                  setErrors((e) => ({ ...e, priority: '' }));
                }}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  priority === 'P3'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="text-[11px] text-blue-700 font-bold">P3 - Tiêu chuẩn</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Xử lý trong 24h</div>
              </button>
            </div>
            {errors.priority && <p className="text-[10px] text-rose-600 mt-1">{errors.priority}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-900 mb-1">
              Mô tả chi tiết sự cố <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: '' }));
              }}
              placeholder="Mô tả cụ thể hiện trạng hư hại, thời điểm phát sinh..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            />
            {errors.description && <p className="text-[10px] text-rose-600 mt-1">{errors.description}</p>}
          </div>

          {/* Media Upload */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-900">
                Minh chứng hiện trường <span className="text-rose-600">*</span>
              </label>
              <span className="text-[10px] text-slate-500 font-medium">
                Tối thiểu 3 ảnh + 1 video
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-[11px] cursor-pointer transition-colors text-center font-semibold shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tải từ máy của bạn</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <label className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-[11px] cursor-pointer transition-colors text-center font-semibold shadow-2xs">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chụp ảnh thực tế</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={handleQuickAddRequiredMedia}
                className="w-full py-1.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Nạp nhanh đủ 3 ảnh & 1 video mẫu để test</span>
              </button>

              {/* Thumbnails */}
              {mediaList.length > 0 && (
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {mediaList.map((item) => (
                    <div key={item.id} className="relative group rounded-xl overflow-hidden border border-slate-300 aspect-square bg-slate-100">
                      {item.type === 'image' ? (
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-purple-600 p-1 text-center">
                          <Video className="w-4 h-4 mb-0.5" />
                          <span className="text-[8px] truncate max-w-full font-semibold">Video</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(item.id)}
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] shadow cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 pt-1">
                <span>Đã chọn: {mediaList.filter((m) => m.type === 'image').length} ảnh, {mediaList.filter((m) => m.type === 'video').length} video</span>
                {mediaList.filter((m) => m.type === 'image').length >= 3 && mediaList.filter((m) => m.type === 'video').length >= 1 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Đủ điều kiện gửi
                  </span>
                ) : (
                  <span className="text-amber-800 font-medium">Chưa đủ 3 ảnh + 1 video</span>
                )}
              </div>
            </div>
            {errors.media && <p className="text-[10px] text-rose-600 mt-1">{errors.media}</p>}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-white shrink-0 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-[2] py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Gửi Phản Ánh Sự Cố</span>
          </button>
        </div>

        {/* Duplicate Alert Popup */}
        {duplicateFound && (
          <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white border border-amber-300 rounded-3xl p-4 text-left max-w-sm shadow-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h4 className="text-xs font-bold text-slate-900">Phát hiện sự cố tương tự (Trong 60 phút)</h4>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Khu vực <strong className="text-slate-900">"{duplicateFound.location}"</strong> vừa được báo sự cố{' '}
                <strong className="text-amber-800">[{duplicateFound.category}]</strong> với mã phiếu{' '}
                <span className="font-mono text-blue-700 font-bold">{duplicateFound.id}</span>.
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onFollowExisting(duplicateFound.id);
                    setDuplicateFound(null);
                    onClose();
                  }}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Theo Dõi Chung
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDuplicateFound(null);
                    onSubmit({
                      title: `Sự cố ${category} tại ${location}`,
                      scope: scope as PropertyScope,
                      category: category as IncidentCategory,
                      location,
                      description,
                      priority: priority as Priority,
                      media: mediaList,
                    });
                    onClose();
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl cursor-pointer"
                >
                  Vẫn tạo mới
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
