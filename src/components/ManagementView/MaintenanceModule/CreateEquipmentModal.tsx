import React, { useState } from 'react';
import { X, Building2, Plus, ShieldCheck, Tag, MapPin, Wrench } from 'lucide-react';
import { EquipmentItem, EquipmentCategory, EquipmentStatus } from '../../../types';

interface CreateEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (equipment: Omit<EquipmentItem, 'id'>) => void;
}

export const CreateEquipmentModal: React.FC<CreateEquipmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('CoDien');
  const [location, setLocation] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [installDate, setInstallDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [cycle, setCycle] = useState<'Hàng tuần' | 'Hàng tháng' | 'Hàng quý' | 'Hàng năm'>('Hàng tháng');
  const [status, setStatus] = useState<EquipmentStatus>('HOAT_DONG_TOT');
  
  const [safeCurrentMin, setSafeCurrentMin] = useState(10);
  const [safeCurrentMax, setSafeCurrentMax] = useState(30);
  const [safePressureMin, setSafePressureMin] = useState(0);
  const [safePressureMax, setSafePressureMax] = useState(10);
  const [safeTempMin, setSafeTempMin] = useState(20);
  const [safeTempMax, setSafeTempMax] = useState(65);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !location.trim()) {
      alert('Vui lòng điền đầy đủ Mã thiết bị, Tên thiết bị và Vị trí lắp đặt');
      return;
    }

    onSubmit({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category,
      location: location.trim(),
      manufacturer: manufacturer.trim() || undefined,
      model: model.trim() || undefined,
      installDate: installDate || undefined,
      status,
      cycle,
      safeCurrentRange: [Number(safeCurrentMin), Number(safeCurrentMax)],
      safePressureRange: [Number(safePressureMin), Number(safePressureMax)],
      safeTempRange: [Number(safeTempMin), Number(safeTempMax)],
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-3 text-left">
      <div className="w-full max-h-[92%] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Thêm Thiết Bị Mới Vào Danh Mục Tòa Nhà
              </h3>
            </div>
            <p className="text-[10px] text-slate-300 mt-0.5">
              Đăng ký tài sản kỹ thuật, cấp mã QR và cấu hình ngưỡng an toàn vận hành
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs text-slate-700">
          
          {/* Main Info */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                  Mã thiết bị (Định danh duy nhất)*:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: TM-03-AQUA"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-xs text-indigo-700 uppercase focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                  Nhóm hệ thống*:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="CoDien">⚡ Cơ điện (MEP)</option>
                  <option value="Nuoc">💧 Cấp thoát nước</option>
                  <option value="ThangMay">🛗 Thang máy & Thang hàng</option>
                  <option value="PCCC">🧯 Phòng cháy chữa cháy</option>
                  <option value="HVAC">❄️ Thông gió & Điều hòa (HVAC)</option>
                  <option value="MayPhatDien">🔋 Máy phát điện dự phòng</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                Tên thiết bị chi tiết*:
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Máy bơm tăng áp lực nước số 03 tháp Aqua 2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                Vị trí lắp đặt cụ thể*:
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Phòng kỹ thuật nước hầm B2, cụm bơm phía Tây"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Specs & Cycle */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5 text-slate-600" /> Thông Số Kỹ Thuật & Chu Kỳ Bảo Dưỡng
            </h4>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-slate-500">Hãng sản xuất:</span>
                <input
                  type="text"
                  placeholder="Ví dụ: Mitsubishi, Grundfos..."
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <span className="text-slate-500">Model / Thông số công suất:</span>
                <input
                  type="text"
                  placeholder="Ví dụ: NexWay-S 1000kg"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <span className="text-slate-500">Chu kỳ bảo trì quy định:</span>
                <select
                  value={cycle}
                  onChange={(e) => setCycle(e.target.value as any)}
                  className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                >
                  <option value="Hàng tuần">Hàng tuần</option>
                  <option value="Hàng tháng">Hàng tháng</option>
                  <option value="Hàng quý">Hàng quý</option>
                  <option value="Hàng năm">Hàng năm</option>
                </select>
              </div>

              <div>
                <span className="text-slate-500">Tình trạng ban đầu:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                >
                  <option value="HOAT_DONG_TOT">🟢 Hoạt động tốt</option>
                  <option value="DEN_HAN_BAO_TRI">🟡 Đến hạn bảo trì</option>
                  <option value="DANG_BAO_TRI">🔵 Đang bảo trì</option>
                  <option value="CAN_SUA_CHUA">🔴 Cần sửa chữa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Safety Ranges */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
            <h4 className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Ngưỡng An Toàn Định Mức
            </h4>

            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="p-1.5 bg-white rounded-xl border border-indigo-200 text-center">
                <span className="font-semibold text-slate-600">Dòng điện (A)</span>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    value={safeCurrentMin}
                    onChange={(e) => setSafeCurrentMin(Number(e.target.value))}
                    className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-center font-mono"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={safeCurrentMax}
                    onChange={(e) => setSafeCurrentMax(Number(e.target.value))}
                    className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-center font-mono font-bold text-blue-700"
                  />
                </div>
              </div>

              <div className="p-1.5 bg-white rounded-xl border border-indigo-200 text-center">
                <span className="font-semibold text-slate-600">Áp suất (Bar)</span>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    step="0.5"
                    value={safePressureMin}
                    onChange={(e) => setSafePressureMin(Number(e.target.value))}
                    className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-center font-mono"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    step="0.5"
                    value={safePressureMax}
                    onChange={(e) => setSafePressureMax(Number(e.target.value))}
                    className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-center font-mono font-bold text-cyan-700"
                  />
                </div>
              </div>

              <div className="p-1.5 bg-white rounded-xl border border-indigo-200 text-center">
                <span className="font-semibold text-slate-600">Nhiệt độ (°C)</span>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    value={safeTempMin}
                    onChange={(e) => setSafeTempMin(Number(e.target.value))}
                    className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-center font-mono"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={safeTempMax}
                    onChange={(e) => setSafeTempMax(Number(e.target.value))}
                    className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-center font-mono font-bold text-amber-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
              Ghi chú vận hành / Hướng dẫn đặc biệt:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú về bảo hành, đơn vị ủy quyền hoặc lưu ý an toàn..."
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Thiết Bị Vào Danh Mục</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
