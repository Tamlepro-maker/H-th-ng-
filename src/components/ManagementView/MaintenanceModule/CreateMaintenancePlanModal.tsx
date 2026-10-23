import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  CheckSquare, 
  Plus, 
  Trash2, 
  Wrench, 
  Gauge, 
  Zap, 
  Thermometer, 
  BookOpen, 
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { 
  EquipmentItem, 
  PeriodicMaintenancePlan, 
  ChecklistTemplate 
} from '../../../types';
import { 
  AVAILABLE_TECHNICIANS, 
  CHECKLIST_TEMPLATES 
} from '../../../mockData';

interface CreateMaintenancePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipments: EquipmentItem[];
  preselectedEquipmentCode?: string;
  onSubmit: (plan: Omit<PeriodicMaintenancePlan, 'id'>) => void;
}

export const CreateMaintenancePlanModal: React.FC<CreateMaintenancePlanModalProps> = ({
  isOpen,
  onClose,
  equipments,
  preselectedEquipmentCode,
  onSubmit,
}) => {
  // Preselected equipment setup
  const initialEq = equipments.find(e => e.code === preselectedEquipmentCode) || equipments[0];

  const [selectedEqCode, setSelectedEqCode] = useState<string>(initialEq ? initialEq.code : '');
  const [equipmentName, setEquipmentName] = useState<string>(initialEq ? initialEq.name : '');
  const [location, setLocation] = useState<string>(initialEq ? initialEq.location : '');
  const [cycle, setCycle] = useState<'Hàng tuần' | 'Hàng tháng' | 'Hàng quý' | 'Hàng năm'>(initialEq?.cycle || 'Hàng tháng');
  
  // Default next due date: 1 month from now formatted YYYY-MM-DD
  const [nextDue, setNextDue] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });

  const [assignedKtvId, setAssignedKtvId] = useState<string>(AVAILABLE_TECHNICIANS[0]?.id || 'usr_ktv01');

  // Checklist items configuration
  const defaultChecklist = [
    { title: 'Kiểm tra tình trạng cơ khí và độ ồn rung', standard: 'Không rung lắc, không phát tiếng kêu lạ' },
    { title: 'Đo kiểm tra dòng điện khởi động và điện áp pha', standard: 'Dòng tải nằm trong định mức an toàn' },
    { title: 'Kiểm tra độ kín khít các đầu nối và cách điện', standard: 'Không rò rỉ, tiếp xúc điện chắc chắn' },
    { title: 'Vệ sinh công nghiệp và tra dầu mỡ bảo dưỡng', standard: 'Sạch sẽ bụi bẩn, bôi trơn đúng chủng loại dầu' },
  ];

  const [checkList, setCheckList] = useState<{ title: string; standard: string }[]>(() => {
    const matchedTmpl = CHECKLIST_TEMPLATES.find(t => initialEq && t.category === initialEq.category);
    return matchedTmpl ? matchedTmpl.items : defaultChecklist;
  });

  // Safe measurement range thresholds
  const [safeCurrentMin, setSafeCurrentMin] = useState(initialEq?.safeCurrentRange?.[0] ?? 15);
  const [safeCurrentMax, setSafeCurrentMax] = useState(initialEq?.safeCurrentRange?.[1] ?? 25);
  const [safePressureMin, setSafePressureMin] = useState(initialEq?.safePressureRange?.[0] ?? 0);
  const [safePressureMax, setSafePressureMax] = useState(initialEq?.safePressureRange?.[1] ?? 10);
  const [safeTempMin, setSafeTempMin] = useState(initialEq?.safeTempRange?.[0] ?? 20);
  const [safeTempMax, setSafeTempMax] = useState(initialEq?.safeTempRange?.[1] ?? 60);

  // New checklist item inputs
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemStandard, setNewItemStandard] = useState('');

  if (!isOpen) return null;

  // Handle equipment change
  const handleSelectEquipment = (code: string) => {
    setSelectedEqCode(code);
    const found = equipments.find(e => e.code === code);
    if (found) {
      setEquipmentName(found.name);
      setLocation(found.location);
      setCycle(found.cycle);
      if (found.safeCurrentRange) {
        setSafeCurrentMin(found.safeCurrentRange[0]);
        setSafeCurrentMax(found.safeCurrentRange[1]);
      }
      if (found.safePressureRange) {
        setSafePressureMin(found.safePressureRange[0]);
        setSafePressureMax(found.safePressureRange[1]);
      }
      if (found.safeTempRange) {
        setSafeTempMin(found.safeTempRange[0]);
        setSafeTempMax(found.safeTempRange[1]);
      }

      // Check if matching template exists
      const tmpl = CHECKLIST_TEMPLATES.find(t => t.category === found.category);
      if (tmpl) {
        setCheckList(tmpl.items);
      }
    }
  };

  // Apply a template
  const handleApplyTemplate = (tmpl: ChecklistTemplate) => {
    setCheckList(tmpl.items);
    setSafeCurrentMin(tmpl.defaultCurrentRange[0]);
    setSafeCurrentMax(tmpl.defaultCurrentRange[1]);
    setSafePressureMin(tmpl.defaultPressureRange[0]);
    setSafePressureMax(tmpl.defaultPressureRange[1]);
    setSafeTempMin(tmpl.defaultTempRange[0]);
    setSafeTempMax(tmpl.defaultTempRange[1]);
  };

  // Add new item to checklist
  const handleAddChecklistItem = () => {
    if (!newItemTitle.trim()) return;
    setCheckList([
      ...checkList,
      {
        title: newItemTitle.trim(),
        standard: newItemStandard.trim() || 'Đạt tiêu chuẩn an toàn kỹ thuật',
      },
    ]);
    setNewItemTitle('');
    setNewItemStandard('');
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setCheckList(checkList.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEqCode.trim() || !equipmentName.trim()) {
      alert('Vui lòng chọn hoặc nhập mã và tên thiết bị');
      return;
    }

    if (checkList.length === 0) {
      alert('Vui lòng cấu hình ít nhất 1 hạng mục kiểm tra trong checklist');
      return;
    }

    const assignedKtv = AVAILABLE_TECHNICIANS.find(t => t.id === assignedKtvId) || AVAILABLE_TECHNICIANS[0];

    onSubmit({
      equipmentCode: selectedEqCode.trim(),
      equipmentName: equipmentName.trim(),
      location: location.trim() || 'Tòa nhà Aqua',
      cycle,
      lastMaintained: new Date().toISOString().split('T')[0],
      nextDue,
      assignedKtvId: assignedKtv.id,
      assignedKtvName: assignedKtv.name,
      status: 'DEN_HAN',
      checkList: checkList.map(item => ({ ...item, passed: false })),
      safeCurrentRange: [Number(safeCurrentMin), Number(safeCurrentMax)],
      safePressureRange: [Number(safePressureMin), Number(safePressureMax)],
      safeTempRange: [Number(safeTempMin), Number(safeTempMax)],
    });

    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-3 text-left">
      <div className="w-full max-h-[92%] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-cyan-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Lập Danh Sách Bảo Trì & Cấu Hình Checklist
              </h3>
            </div>
            <p className="text-[10px] text-slate-300 mt-0.5">
              Thiết lập kế hoạch bảo trì định kỳ và biểu mẫu kiểm định cho thiết bị tòa nhà
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs text-slate-700">
          
          {/* SECTION 1: Equipment Selection */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-cyan-600" /> 1. Chọn Thiết Bị Từ Danh Mục Quản Lý
            </h4>

            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                Chọn thiết bị có sẵn trong danh mục:
              </label>
              <select
                value={selectedEqCode}
                onChange={(e) => handleSelectEquipment(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-cyan-500"
              >
                {equipments.map((eq) => (
                  <option key={eq.id} value={eq.code}>
                    [{eq.code}] {eq.name} ({eq.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-slate-500">Mã thiết bị:</span>
                <input
                  type="text"
                  value={selectedEqCode}
                  onChange={(e) => setSelectedEqCode(e.target.value)}
                  className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-cyan-700"
                  required
                />
              </div>
              <div>
                <span className="text-slate-500">Vị trí lắp đặt:</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500">Tên thiết bị đầy đủ:</span>
              <input
                type="text"
                value={equipmentName}
                onChange={(e) => setEquipmentName(e.target.value)}
                className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-900"
                required
              />
            </div>
          </div>

          {/* SECTION 2: Schedule & Assigned Technician */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-600" /> 2. Chu Kỳ & Phân Công Kỹ Thuật Viên
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                  Chu kỳ bảo trì:
                </label>
                <select
                  value={cycle}
                  onChange={(e) => setCycle(e.target.value as any)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                >
                  <option value="Hàng tuần">Hàng tuần</option>
                  <option value="Hàng tháng">Hàng tháng</option>
                  <option value="Hàng quý">Hàng quý</option>
                  <option value="Hàng năm">Hàng năm</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                  Hạn bảo dưỡng tiếp theo:
                </label>
                <input
                  type="date"
                  value={nextDue}
                  onChange={(e) => setNextDue(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                Kỹ thuật viên phụ trách:
              </label>
              <select
                value={assignedKtvId}
                onChange={(e) => setAssignedKtvId(e.target.value)}
                className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-amber-800"
              >
                {AVAILABLE_TECHNICIANS.map((ktv) => (
                  <option key={ktv.id} value={ktv.id}>
                    {ktv.name} ({ktv.specialty}) - {ktv.status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 3: Safe Measurement Range Thresholds */}
          <div className="p-3 rounded-2xl bg-cyan-50/60 border border-cyan-200 space-y-2">
            <h4 className="text-[11px] font-bold text-cyan-900 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" /> 3. Ngưỡng Thông Số Đo Kiểm Định An Toàn
            </h4>
            <p className="text-[10px] text-cyan-800/80">
              KTV khi quét QR bảo trì sẽ đo các giá trị này và hệ thống sẽ tự động cảnh báo nếu vượt ngưỡng.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {/* Current */}
              <div className="p-2 rounded-xl bg-white border border-cyan-200 space-y-1">
                <span className="text-[9px] font-bold text-blue-700 flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" /> Dòng điện (Ampe)
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={safeCurrentMin}
                    onChange={(e) => setSafeCurrentMin(Number(e.target.value))}
                    className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-center"
                    placeholder="Min"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    value={safeCurrentMax}
                    onChange={(e) => setSafeCurrentMax(Number(e.target.value))}
                    className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-center font-bold text-blue-800"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Pressure */}
              <div className="p-2 rounded-xl bg-white border border-cyan-200 space-y-1">
                <span className="text-[9px] font-bold text-cyan-700 flex items-center gap-0.5">
                  <Gauge className="w-2.5 h-2.5" /> Áp suất (Bar)
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    value={safePressureMin}
                    onChange={(e) => setSafePressureMin(Number(e.target.value))}
                    className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-center"
                    placeholder="Min"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    step="0.5"
                    value={safePressureMax}
                    onChange={(e) => setSafePressureMax(Number(e.target.value))}
                    className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-center font-bold text-cyan-800"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Temperature */}
              <div className="p-2 rounded-xl bg-white border border-cyan-200 space-y-1">
                <span className="text-[9px] font-bold text-amber-700 flex items-center gap-0.5">
                  <Thermometer className="w-2.5 h-2.5" /> Nhiệt độ (°C)
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={safeTempMin}
                    onChange={(e) => setSafeTempMin(Number(e.target.value))}
                    className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-center"
                    placeholder="Min"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    value={safeTempMax}
                    onChange={(e) => setSafeTempMax(Number(e.target.value))}
                    className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-mono text-center font-bold text-amber-800"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Checklist Form Configuration */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-cyan-600" /> 4. Cấu Hình Biểu Mẫu Checklist ({checkList.length} Mục)
              </h4>
              <span className="text-[9px] text-slate-400">Tùy biến linh hoạt</span>
            </div>

            {/* Quick Templates Buttons */}
            <div>
              <span className="text-[10px] font-semibold text-slate-600 block mb-1">
                Hoặc chọn nhanh biểu mẫu checklist mẫu có sẵn:
              </span>
              <div className="flex flex-wrap gap-1">
                {CHECKLIST_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-300 border border-slate-200 text-[10px] font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    + Mẫu {tmpl.name.split(' ')[2] || tmpl.name.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Checklist Items */}
            <div className="space-y-1.5 pt-1">
              {checkList.map((item, index) => (
                <div
                  key={index}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2 text-[11px]"
                >
                  <div className="flex-1 space-y-0.5">
                    <div className="font-semibold text-slate-800">
                      {index + 1}. {item.title}
                    </div>
                    <div className="text-[10px] text-slate-500 italic">
                      Tiêu chuẩn: {item.standard}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Xóa tiêu chí này"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Item */}
            <div className="p-2.5 rounded-xl bg-slate-100/80 border border-dashed border-slate-300 space-y-2">
              <span className="text-[10px] font-bold text-slate-700 block">
                + Thêm tiêu chí kiểm tra mới vào checklist:
              </span>
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="Tên hạng mục (ví dụ: Kiểm tra cảm biến quang cửa thang...)"
                className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
              />
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newItemStandard}
                  onChange={(e) => setNewItemStandard(e.target.value)}
                  placeholder="Tiêu chuẩn kỹ thuật yêu cầu (ví dụ: Ngắt nhạy khi có vật cản...)"
                  className="flex-1 p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm</span>
                </button>
              </div>
            </div>

          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Lưu Kế Hoạch & Tạo Lịch Bảo Trì</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
